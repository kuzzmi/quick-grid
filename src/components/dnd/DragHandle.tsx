// src/components/dnd/DragHandle.tsx
import React from "react";
import { Menu } from "react-feather";

interface DragHandleProps {
  dragHandleProps?: any;
  className?: string;
}

const DragHandle: React.FC<DragHandleProps> = ({
  dragHandleProps,
  className = "cursor-move mr-2 text-gray-400 hover:text-gray-700",
}) => {
  return (
    <div className={className} {...dragHandleProps}>
      <Menu size={20} />
    </div>
  );
};

export default DragHandle;
