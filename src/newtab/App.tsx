import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { Plus, Settings } from "react-feather";
import { useApp } from "../AppContext";
import GroupSidebar from "../components/GroupSidebar";
import LinkGrid from "../components/LinkGrid";
import AddLinkModal from "../components/AddLinkModal";
import AddGroupModal from "../components/AddGroupModal";
import SettingsModal from "../components/SettingsModal";

const App: React.FC = () => {
  const {
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
  } = useApp();

  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sort groups by order
  const sortedGroups = [...state.groups].sort((a, b) => a.order - b.order);

  // Get active group
  const activeGroup = state.activeGroupId
    ? state.groups.find((group) => group.id === state.activeGroupId)
    : sortedGroups[0];

  // Get links for the active group
  const activeGroupLinks = activeGroup
    ? state.links
        .filter((link) => link.groupId === activeGroup.id)
        .sort((a, b) => a.order - b.order)
    : [];

  // Set first group as active on initial load if none is selected
  useEffect(() => {
    if (!state.activeGroupId && sortedGroups.length > 0) {
      setActiveGroup(sortedGroups[0].id);
    }
  }, [state.activeGroupId, sortedGroups, setActiveGroup]);

  // Handle drag end
  const handleDragEnd: OnDragEndResponder = (result) => {
    const { source, destination, type, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle group reordering
    if (type === "GROUP") {
      const newGroups = [...sortedGroups];
      const [removed] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, removed);

      reorderGroups(newGroups.map((group) => group.id));
      return;
    }

    // Handle link reordering within same group
    if (source.droppableId === destination.droppableId) {
      const groupId = source.droppableId.replace("group-", "");
      const groupLinks = state.links
        .filter((link) => link.groupId === groupId)
        .sort((a, b) => a.order - b.order);

      const newLinks = [...groupLinks];
      const [removed] = newLinks.splice(source.index, 1);
      newLinks.splice(destination.index, 0, removed);

      reorderLinks(
        newLinks.map((link) => link.id),
        groupId,
      );
      return;
    }

    // Handle link moving between groups
    if (source.droppableId !== destination.droppableId) {
      // Find the link being moved
      const linkId = draggableId;
      const link = state.links.find((link) => link.id === linkId);
      if (!link) return;

      // Source group links
      const sourceGroupId = source.droppableId.replace("group-", "");
      const sourceGroupLinks = state.links
        .filter((link) => link.groupId === sourceGroupId)
        .sort((a, b) => a.order - b.order);

      // Destination group links
      const destGroupId = destination.droppableId.replace("group-", "");
      const destGroupLinks = state.links
        .filter((link) => link.groupId === destGroupId)
        .sort((a, b) => a.order - b.order);

      // Remove link from source group
      const newSourceLinks = [...sourceGroupLinks];
      newSourceLinks.splice(source.index, 1);

      // Add link to destination group
      const newDestLinks = [...destGroupLinks];
      newDestLinks.splice(destination.index, 0, {
        ...link,
        groupId: destGroupId,
      });

      // Update link with new group
      updateLink({
        ...link,
        groupId: destGroupId,
        order: destination.index,
      });

      // Reorder source group links
      if (newSourceLinks.length > 0) {
        reorderLinks(
          newSourceLinks.map((link) => link.id),
          sourceGroupId,
        );
      }

      // Reorder destination group links
      reorderLinks(
        newDestLinks.map((link) => link.id),
        destGroupId,
      );

      // If the active group was the source group, switch to destination group
      if (sourceGroupId === state.activeGroupId) {
        setActiveGroup(destGroupId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex">
          {/* Left Sidebar with Groups */}
          <div className="w-64 bg-white shadow-md min-h-screen p-4 border-r border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-gray-800">QuickGrid</h1>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-700" />
              </button>
            </div>

            <button
              onClick={() => setIsAddGroupModalOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 mb-6 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              Add Group
            </button>

            <GroupSidebar
              groups={sortedGroups}
              activeGroupId={state.activeGroupId}
              onSelectGroup={setActiveGroup}
              onAddGroup={() => setIsAddGroupModalOpen(true)}
              onUpdateGroup={updateGroup}
              onDeleteGroup={deleteGroup}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {activeGroup ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{activeGroup.title}</h2>
                  <button
                    onClick={() => setIsAddLinkModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Link
                  </button>
                </div>

                <LinkGrid
                  links={activeGroupLinks}
                  groupId={activeGroup.id}
                  settings={state.settings}
                  onUpdateLink={updateLink}
                  onDeleteLink={deleteLink}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-600 mb-4">
                  No groups yet. Get started by creating a group.
                </p>
                <button
                  onClick={() => setIsAddGroupModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Your First Group
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      {/* Modals */}
      {isAddLinkModalOpen && (
        <AddLinkModal
          groups={state.groups}
          onSave={async (linkData) => {
            await addLink(linkData);
            setIsAddLinkModalOpen(false);
          }}
          onCancel={() => setIsAddLinkModalOpen(false)}
          activeGroupId={state.activeGroupId}
        />
      )}

      {isAddGroupModalOpen && (
        <AddGroupModal
          onSave={async (title) => {
            await addGroup(title);
            setIsAddGroupModalOpen(false);
          }}
          onCancel={() => setIsAddGroupModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          settings={state.settings}
          onSave={async (settings) => {
            await updateSettings(settings);
            setIsSettingsModalOpen(false);
          }}
          onCancel={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
