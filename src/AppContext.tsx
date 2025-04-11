import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link, Group, GridSettings, AppState } from './types';
import { db, initializeDatabase, getFaviconUrl } from './db';
import { isExtensionMode } from './db-utils';

interface AppContextType {
  state: AppState;
  addLink: (link: Omit<Link, 'id' | 'order'>) => Promise<void>;
  updateLink: (link: Link) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  addGroup: (title: string) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  reorderLinks: (linkIds: string[], groupId: string) => Promise<void>;
  reorderGroups: (groupIds: string[]) => Promise<void>;
  updateSettings: (settings: GridSettings) => Promise<void>;
  setActiveGroup: (groupId: string | null) => void;
  uploadIcon: (linkId: string, file: File) => Promise<void>;
}

const defaultState: AppState = {
  links: [],
  groups: [],
  settings: {
    itemsPerRow: 5,
    itemSize: 'medium',
    showTitles: true
  },
  activeGroupId: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    // Initialize the database and load data
    const loadData = async () => {
      await initializeDatabase();
      
      // Load all data
      const links = await db.links.toArray();
      const groups = await db.groups.toArray();
      const settingsArray = await db.settings.toArray();
      const settings = settingsArray[0] || defaultState.settings;

      setState({
        links,
        groups,
        settings,
        activeGroupId: groups.length > 0 ? groups[0].id : null
      });
    };

    loadData();
  }, []);

  const addLink = async (linkData: Omit<Link, 'id' | 'order'>) => {
    // Calculate the next order for the group
    const groupLinks = state.links.filter(link => link.groupId === linkData.groupId);
    const maxOrder = groupLinks.length > 0 
      ? Math.max(...groupLinks.map(link => link.order)) 
      : -1;

    const newLink: Link = {
      ...linkData,
      id: uuidv4(),
      order: maxOrder + 1
    };

    // If using favicon, set the iconUrl
    if (newLink.iconType === 'favicon') {
      newLink.iconUrl = getFaviconUrl(newLink.url);
    }

    await db.table('links').add(newLink);
    setState(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const updateLink = async (link: Link) => {
    // If changing to favicon, update the iconUrl
    if (link.iconType === 'favicon') {
      link.iconUrl = getFaviconUrl(link.url);
      link.iconBase64 = undefined;
    }

    await db.table('links').update(link.id, link);
    setState(prev => ({
      ...prev,
      links: prev.links.map(item => item.id === link.id ? link : item)
    }));
  };

  const deleteLink = async (id: string) => {
    await db.table('links').delete(id);
    setState(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const addGroup = async (title: string) => {
    // Calculate the next order
    const maxOrder = state.groups.length > 0 
      ? Math.max(...state.groups.map(group => group.order)) 
      : -1;

    const newGroup: Group = {
      id: uuidv4(),
      title,
      order: maxOrder + 1,
      isCollapsed: false
    };

    await db.table('groups').add(newGroup);
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      activeGroupId: prev.activeGroupId || newGroup.id
    }));
  };

  const updateGroup = async (group: Group) => {
    await db.table('groups').update(group.id, group);
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(item => item.id === group.id ? group : item)
    }));
  };

  const deleteGroup = async (id: string) => {
    // Delete all links in the group
    const linksToDelete = state.links.filter(link => link.groupId === id);
    for (const link of linksToDelete) {
      await db.table('links').delete(link.id);
    }
    
    // Delete the group
    await db.table('groups').delete(id);

    setState(prev => {
      // Find a new active group if needed
      let newActiveGroupId = prev.activeGroupId;
      if (newActiveGroupId === id) {
        const remainingGroups = prev.groups.filter(group => group.id !== id);
        newActiveGroupId = remainingGroups.length > 0 ? remainingGroups[0].id : null;
      }

      return {
        ...prev,
        groups: prev.groups.filter(group => group.id !== id),
        links: prev.links.filter(link => link.groupId !== id),
        activeGroupId: newActiveGroupId
      };
    });
  };

  const reorderLinks = async (linkIds: string[], groupId: string) => {
    // Update the order of each link
    const updates = linkIds.map((id, index) => {
      return db.table('links').update(id, { order: index, groupId });
    });

    await Promise.all(updates);

    // Update state
    setState(prev => {
      const updatedLinks = [...prev.links];
      
      linkIds.forEach((id, index) => {
        const linkIndex = updatedLinks.findIndex(link => link.id === id);
        if (linkIndex !== -1) {
          updatedLinks[linkIndex] = {
            ...updatedLinks[linkIndex],
            order: index,
            groupId
          };
        }
      });

      return {
        ...prev,
        links: updatedLinks
      };
    });
  };

  const reorderGroups = async (groupIds: string[]) => {
    // Update the order of each group
    const updates = groupIds.map((id, index) => {
      return db.table('groups').update(id, { order: index });
    });

    await Promise.all(updates);

    // Update state
    setState(prev => {
      const updatedGroups = [...prev.groups];
      
      groupIds.forEach((id, index) => {
        const groupIndex = updatedGroups.findIndex(group => group.id === id);
        if (groupIndex !== -1) {
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            order: index
          };
        }
      });

      return {
        ...prev,
        groups: updatedGroups
      };
    });
  };

  const updateSettings = async (settings: GridSettings) => {
    await db.table('settings').clear();
    await db.table('settings').add(settings);
    setState(prev => ({
      ...prev,
      settings
    }));
  };(id, { order: index });
    });

    await Promise.all(updates);

    // Update state
    setState(prev => {
      const updatedGroups = [...prev.groups];
      
      groupIds.forEach((id, index) => {
        const groupIndex = updatedGroups.findIndex(group => group.id === id);
        if (groupIndex !== -1) {
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            order: index
          };
        }
      });

      return {
        ...prev,
        groups: updatedGroups
      };
    });
  };

  const updateSettings = async (settings: GridSettings) => {
    await db.settings.clear();
    await db.settings.add(settings);
    setState(prev => ({
      ...prev,
      settings
    }));
  };

  const setActiveGroup = (groupId: string | null) => {
    setState(prev => ({
      ...prev,
      activeGroupId: groupId
    }));
  };

  const uploadIcon = async (linkId: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Find the link
          const link = state.links.find(link => link.id === linkId);
          if (!link) {
            reject(new Error('Link not found'));
            return;
          }
          
          // Update the link
          const updatedLink: Link = {
            ...link,
            iconType: 'custom',
            iconBase64: base64String,
            iconUrl: undefined
          };
          
          await updateLink(updatedLink);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const value = {
    state,
    addLink,
    updateLink,
    deleteLink,
    addGroup,
    updateGroup,
    deleteGroup,
    reorderLinks,
    reorderGroups,
    updateSettings,
    setActiveGroup,
    uploadIcon
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
