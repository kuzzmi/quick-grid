import React from "react";
import { Plus } from "react-feather";
import type { LinkItemProps } from "./LinkItem";

type NewLinkItemProps = Pick<LinkItemProps, "size"> & {
  onClick: () => void;
};

const NewLinkItem: React.FC<NewLinkItemProps> = ({ onClick, size }) => {
  const handleClick = () => {
    onClick();
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "w-16 min-h-16";
      case "large":
        return "w-32 min-h-32";
      case "medium":
      default:
        return "w-24 min-h-24";
    }
  };

  return (
    <div className="group relative flex flex-1 h-full flex-col items-center p-2 rounded-lg hover:bg-gray-100">
      <div
        className={`flex flex-1 h-full justify-center items-center cursor-pointer ${getSizeClass()}`}
        onClick={handleClick}
      >
        <Plus />
      </div>
    </div>
  );
};

export default NewLinkItem;
