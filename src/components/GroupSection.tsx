import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Group, Link, GridSettings } from "../types";
import LinkItem from "./LinkItem";
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Menu,
} from "react-feather";
import EditLinkModal from "./EditLinkModal";
import NewLinkItem from "./NewLinkItem";

interface GroupSectionProps {
  group: Group;
  links: Link[];
  settings: GridSettings;
  onUpdateGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (id: string) => void;
  onReorderLinks: (linkIds: string[], groupId: string) => void;
  onAddLink: () => void;
  dragHandleProps?: any; // For the drag handle
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  links,
  settings,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateLink,
  onDeleteLink,
  onReorderLinks,
  onAddLink,
  dragHandleProps,
}) => {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState(group.title);

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  const handleToggleCollapse = () => {
    onUpdateGroup({
      ...group,
      isCollapsed: !group.isCollapsed,
    });
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newLinks = [...sortedLinks];
    const [removed] = newLinks.splice(sourceIndex, 1);
    newLinks.splice(destinationIndex, 0, removed);

    // Update the order
    onReorderLinks(
      newLinks.map((link) => link.id),
      group.id,
    );
  };

  const handleStartRenaming: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewGroupTitle(group.title);
  };

  const handleSaveRenaming = () => {
    if (newGroupTitle.trim()) {
      onUpdateGroup({
        ...group,
        title: newGroupTitle.trim(),
      });
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRenaming();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setNewGroupTitle(group.title);
    }
  };

  // Calculate grid template columns based on settings
  const gridTemplateColumns = `repeat(${settings.itemsPerRow}, minmax(0, 1fr))`;

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {/* Drag handle for the group */}
        <div
          className="cursor-move mr-2 text-gray-400 hover:text-gray-700"
          {...dragHandleProps}
        >
          <Menu size={20} />
        </div>
        <div
          className="flex flex-1 p-2 justify-between hover:bg-gray-100 rounded"
          onClick={handleToggleCollapse}
        >
          <div className="flex flex-row items-center">
            <button
              className="mr-2 text-gray-600 hover:text-gray-900"
              aria-label={group.isCollapsed ? "Expand group" : "Collapse group"}
            >
              {group.isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isRenaming ? (
              <input
                type="text"
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                onBlur={handleSaveRenaming}
                onKeyDown={handleRenameKeyDown}
                className="px-2 py-1 border rounded"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-medium">{group.title}</h2>
            )}
          </div>

          <div className="flex">
            <button
              onClick={handleStartRenaming}
              className="p-1 mr-1 text-gray-500 hover:text-blue-500"
              aria-label="Rename group"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="p-1 text-gray-500 hover:text-red-500"
              aria-label="Delete group"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {!group.isCollapsed && (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`group-${group.id}`} direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-4"
                  style={{ gridTemplateColumns }}
                >
                  {sortedLinks.map((link, index) => (
                    <Draggable
                      key={link.id}
                      draggableId={link.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <LinkItem
                            link={link}
                            onEdit={handleEditLink}
                            onDelete={onDeleteLink}
                            showTitle={settings.showTitles}
                            size={settings.itemSize}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  <NewLinkItem onClick={onAddLink} size={settings.itemSize} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}

      {isEditModalOpen && editingLink && (
        <EditLinkModal
          link={editingLink}
          onSave={(updatedLink) => {
            onUpdateLink(updatedLink);
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupSection;
