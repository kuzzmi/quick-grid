import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, Settings } from "react-feather";
import { useApp } from "../AppContext";
import GroupSection from "../components/GroupSection";
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

  // Handle group reordering
  const handleGroupDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newGroups = [...sortedGroups];
    const [removed] = newGroups.splice(sourceIndex, 1);
    newGroups.splice(destinationIndex, 0, removed);

    // Update the order
    reorderGroups(newGroups.map((group) => group.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">QuickGrid</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsAddGroupModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Plus size={16} className="mr-1" />
              Add Group
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <Settings size={16} className="mr-1" />
              Settings
            </button>
          </div>
        </header>

        <main>
          <DragDropContext onDragEnd={handleGroupDragEnd}>
            {sortedGroups.length > 0 && (
              <Droppable droppableId="groups" type="GROUP">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {sortedGroups.map((group, index) => (
                      <Draggable
                        key={group.id}
                        draggableId={group.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <GroupSection
                              key={group.id}
                              group={group}
                              links={state.links.filter(
                                (link) => link.groupId === group.id,
                              )}
                              settings={state.settings}
                              onUpdateGroup={updateGroup}
                              onDeleteGroup={deleteGroup}
                              onUpdateLink={updateLink}
                              onDeleteLink={deleteLink}
                              onReorderLinks={reorderLinks}
                              onAddLink={() => {
                                setActiveGroup(group.id);
                                setIsAddLinkModalOpen(true);
                              }}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </DragDropContext>

          {state.groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
              <p className="text-lg text-gray-600 mb-4">
                No groups yet. Get started by creating a group.
              </p>
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Plus size={16} className="mr-1" />
                Add Your First Group
              </button>
            </div>
          )}
        </main>
      </div>

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
