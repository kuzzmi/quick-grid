import React, { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Edit, Trash2, Menu } from "react-feather";
import { Group } from "../types";

interface GroupSidebarProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onAddGroup: () => void;
  onUpdateGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}) => {
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleStartRenaming = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingGroupId(group.id);
    setNewTitle(group.title);
  };

  const handleSaveRename = (group: Group) => {
    if (newTitle.trim()) {
      onUpdateGroup({
        ...group,
        title: newTitle.trim(),
      });
    }
    setRenamingGroupId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, group: Group) => {
    if (e.key === "Enter") {
      handleSaveRename(group);
    } else if (e.key === "Escape") {
      setRenamingGroupId(null);
    }
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this group and all its links?",
      )
    ) {
      onDeleteGroup(id);
    }
  };

  return (
    <div className="sidebar-groups">
      <Droppable droppableId="group-sidebar" type="GROUP">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {groups.map((group, index) => (
              <Draggable
                key={group.id}
                draggableId={`group-${group.id}`}
                index={index}
                isDragDisabled={renamingGroupId === group.id}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer relative ${
                      activeGroupId === group.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => onSelectGroup(group.id)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {renamingGroupId === group.id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => handleSaveRename(group)}
                          onKeyDown={(e) => handleKeyDown(e, group)}
                          className="w-full px-2 py-1 border rounded"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate">{group.title}</span>
                      )}
                    </div>

                    {renamingGroupId !== group.id && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartRenaming(group, e)}
                          className="p-1 text-gray-500 hover:text-blue-500"
                          aria-label="Rename group"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteGroup(group.id, e)}
                          className="p-1 text-gray-500 hover:text-red-500"
                          aria-label="Delete group"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {/* Drop zone indicator for links - visible only when dragging */}
                    <Droppable droppableId={`group-${group.id}`} type="LINK">
                      {(providedDroppable, snapshot) => (
                        <div
                          ref={providedDroppable.innerRef}
                          {...providedDroppable.droppableProps}
                          className={`absolute left-0 right-0 top-0 bottom-0 inset-0 rounded-md ${
                            snapshot.isDraggingOver
                              ? "bg-green-100 border-2 border-green-400 opacity-60"
                              : "opacity-0 pointer-events-none"
                          }`}
                        >
                          {providedDroppable.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default GroupSidebar;
