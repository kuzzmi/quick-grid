import React, { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Link, GridSettings } from "../types";
import LinkItem from "./LinkItem";
import EditLinkModal from "./EditLinkModal";

interface LinkGridProps {
  links: Link[];
  groupId: string;
  settings: GridSettings;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (id: string) => void;
}

const LinkGrid: React.FC<LinkGridProps> = ({
  links,
  groupId,
  settings,
  onUpdateLink,
  onDeleteLink,
}) => {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  // Calculate grid template columns based on settings
  const gridTemplateColumns = `repeat(${settings.itemsPerRow}, minmax(0, 1fr))`;

  return (
    <div>
      <Droppable
        droppableId={`group-${groupId}`}
        type="LINK"
        direction="horizontal"
      >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid gap-4"
            style={{ gridTemplateColumns }}
          >
            {links.length > 0 ? (
              links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <LinkItem
                        link={link}
                        onEdit={handleEditLink}
                        onDelete={onDeleteLink}
                        showTitle={settings.showTitles}
                        size={settings.itemSize}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="col-span-full py-10 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-2">No links in this group yet</p>
                <p className="text-sm text-gray-400">
                  Add links using the button above or drag from another group
                </p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

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

export default LinkGrid;
