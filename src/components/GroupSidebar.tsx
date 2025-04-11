import React, { useState, useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Edit, Trash2 } from "react-feather";
import { Group } from "../types";
import SortableItem from "./dnd/SortableItem";

interface GroupSidebarProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onAddGroup: () => void;
  onUpdateGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
}

// Create a separate component for each group item to properly use hooks
const GroupItem = ({
  group,
  isActive,
  onSelectGroup,
  onStartRenaming,
  onDeleteGroup,
}: {
  group: Group;
  isActive: boolean;
  onSelectGroup: (id: string) => void;
  onStartRenaming: (group: Group, e: React.MouseEvent) => void;
  onDeleteGroup: (id: string, e: React.MouseEvent) => void;
}) => {
  // Create a droppable area for the group
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: {
      type: "GROUP",
      groupId: group.id,
    },
  });

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer relative ${
        isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
      }`}
      onClick={() => onSelectGroup(group.id)}
    >
      <div className="flex items-center flex-1 min-w-0">
        <span className="truncate">{group.title}</span>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onStartRenaming(group, e)}
          className="p-1 text-gray-500 hover:text-blue-500"
          aria-label="Rename group"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => onDeleteGroup(group.id, e)}
          className="p-1 text-gray-500 hover:text-red-500"
          aria-label="Delete group"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Drop zone indicator for links */}
      <div
        ref={setDroppableRef}
        className={`absolute left-0 right-0 top-0 bottom-0 inset-0 rounded-md ${
          isOver
            ? "bg-green-100 border-2 border-green-400 opacity-60"
            : "opacity-0 pointer-events-none"
        }`}
      ></div>
    </div>
  );
};

// Create a separate component for renaming to handle the conditional rendering properly
const GroupRenameInput = ({
  title,
  onTitleChange,
  onSave,
  onKeyDown,
}: {
  title: string;
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div className="flex items-center justify-between p-3 rounded-md">
    <input
      type="text"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={onKeyDown}
      className="w-full px-2 py-1 border rounded"
      autoFocus
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onUpdateGroup,
  onDeleteGroup,
}) => {
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Get sorted group IDs for the sortable context
  const groupIds = useMemo(
    () => groups.map((group) => `group-${group.id}`),
    [groups],
  );

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
      <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {groups.map((group) => (
            <SortableItem key={`group-${group.id}`} id={`group-${group.id}`}>
              {renamingGroupId === group.id ? (
                <GroupRenameInput
                  title={newTitle}
                  onTitleChange={setNewTitle}
                  onSave={() => handleSaveRename(group)}
                  onKeyDown={(e) => handleKeyDown(e, group)}
                />
              ) : (
                <GroupItem
                  group={group}
                  isActive={activeGroupId === group.id}
                  onSelectGroup={onSelectGroup}
                  onStartRenaming={handleStartRenaming}
                  onDeleteGroup={handleDeleteGroup}
                />
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default GroupSidebar;
