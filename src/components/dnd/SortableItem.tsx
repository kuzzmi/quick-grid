import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  handle?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className = "",
  handle = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    // transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  // If handle is true, we don't apply listeners to the entire component
  // Instead, we'll pass the listeners to a handle element inside the children
  const itemProps = handle
    ? {
        ...attributes,
      }
    : {
        ...attributes,
        ...listeners,
      };

  // Function to clone children and add dragHandleProps safely with type checking
  const childrenWithDragHandle = handle
    ? React.Children.map(children, (child) => {
        // Only process React elements
        if (React.isValidElement(child)) {
          // Create a properly typed props object
          const dragHandleProps = {
            ...child.props,
            dragHandleProps: listeners,
          };

          // Clone the element with the new props
          return React.cloneElement(child, dragHandleProps);
        }
        return child;
      })
    : children;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? "relative z-50" : ""}`}
      {...itemProps}
      data-dragging={isDragging}
    >
      {childrenWithDragHandle}
    </div>
  );
};

export default SortableItem;
