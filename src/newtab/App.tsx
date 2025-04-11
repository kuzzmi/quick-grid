import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  Active,
  Over,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Settings } from "react-feather";
import { useApp } from "../AppContext";
import GroupSidebar from "../components/GroupSidebar";
import LinkGrid from "../components/LinkGrid";
import AddLinkModal from "../components/AddLinkModal";
import AddGroupModal from "../components/AddGroupModal";
import SettingsModal from "../components/SettingsModal";
import SortableItem from "../components/dnd/SortableItem";
import { arrayMove, findIndices } from "../components/dnd/utils";

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"GROUP" | "LINK" | null>(null);

  // Configure sensors for drag and drop interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sort groups by order
  const sortedGroups = [...state.groups].sort((a, b) => a.order - b.order);
  const groupIds = sortedGroups.map((group) => `group-${group.id}`);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Determine if we're dragging a group or a link
    if (typeof active.id === "string") {
      if (active.id.startsWith("group-")) {
        setActiveType("GROUP");
      } else {
        setActiveType("LINK");
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle dragging links between groups
    const { active, over } = event;

    if (!over || !activeType || activeType !== "LINK") return;

    // If dragging over a group drop area
    if (typeof over.id === "string" && over.id.startsWith("group-")) {
      const activeId = active.id as string;
      const linkToMove = state.links.find((link) => link.id === activeId);

      if (!linkToMove) return;

      const targetGroupId = over.id.replace("group-", "");

      // If already in the target group, do nothing
      if (linkToMove.groupId === targetGroupId) return;

      // Update the link to the new group temporarily in the UI
      // (we'll make the actual change in handleDragEnd)
      updateLink({
        ...linkToMove,
        groupId: targetGroupId,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    // Handle group reordering
    if (
      activeType === "GROUP" &&
      typeof active.id === "string" &&
      typeof over.id === "string"
    ) {
      const activeGroupId = active.id.replace("group-", "");
      const overGroupId = over.id.replace("group-", "");

      if (activeGroupId !== overGroupId) {
        const { activeIndex, overIndex } = findIndices(
          sortedGroups,
          activeGroupId,
          overGroupId,
        );

        if (activeIndex !== -1 && overIndex !== -1) {
          const newGroups = arrayMove(sortedGroups, activeIndex, overIndex);
          reorderGroups(newGroups.map((group) => group.id));
        }
      }
    }

    // Handle link reordering and moving between groups
    else if (activeType === "LINK") {
      const activeId = active.id as string;
      const linkToMove = state.links.find((link) => link.id === activeId);

      if (!linkToMove) return;

      // If dropped over a group (from handleDragOver), we've already updated the UI
      // We just need to finalize the order in the target group
      if (typeof over.id === "string" && over.id.startsWith("group-")) {
        const targetGroupId = over.id.replace("group-", "");
        const targetGroupLinks = state.links
          .filter((link) => link.groupId === targetGroupId)
          .sort((a, b) => a.order - b.order);

        // Add the moved link to the end of the group
        const newLinks = [...targetGroupLinks, linkToMove];

        // Update the order
        reorderLinks(
          newLinks.map((link) => link.id),
          targetGroupId,
        );
      }
      // Handle regular link reordering within the same group
      else if (typeof over.id === "string") {
        const overId = over.id as string;
        const overLink = state.links.find((link) => link.id === overId);

        if (!overLink || linkToMove.groupId !== overLink.groupId) return;

        const groupLinks = state.links
          .filter((link) => link.groupId === linkToMove.groupId)
          .sort((a, b) => a.order - b.order);

        const { activeIndex, overIndex } = findIndices(
          groupLinks,
          activeId,
          overId,
        );

        if (activeIndex !== -1 && overIndex !== -1) {
          const newLinks = arrayMove(groupLinks, activeIndex, overIndex);

          reorderLinks(
            newLinks.map((link) => link.id),
            linkToMove.groupId,
          );
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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

            <SortableContext
              items={groupIds}
              strategy={verticalListSortingStrategy}
            >
              <GroupSidebar
                groups={sortedGroups}
                activeGroupId={state.activeGroupId}
                onSelectGroup={setActiveGroup}
                onAddGroup={() => setIsAddGroupModalOpen(true)}
                onUpdateGroup={updateGroup}
                onDeleteGroup={deleteGroup}
              />
            </SortableContext>
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
                  onDeleteLink={deleteLink}
                  onUpdateLink={updateLink}
                  settings={state.settings}
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
      </DndContext>

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
