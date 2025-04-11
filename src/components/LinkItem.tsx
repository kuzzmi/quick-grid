import React from "react";
import { Link } from "../types";
import { Trash2, Edit } from "react-feather";

export interface LinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  showTitle: boolean;
  size: "small" | "medium" | "large";
}

const LinkItem: React.FC<LinkItemProps> = ({
  link,
  onEdit,
  onDelete,
  showTitle,
  size,
}) => {
  const handleClick = () => {
    window.open(link.url, "_blank");
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "w-16 h-16";
      case "large":
        return "w-32 h-32";
      case "medium":
      default:
        return "w-24 h-24";
    }
  };

  return (
    <div className="group relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-100">
      <div
        className={`flex justify-center items-center cursor-pointer ${getSizeClass()}`}
        onClick={handleClick}
      >
        {link.iconType === "custom" && link.iconBase64 ? (
          <img
            src={link.iconBase64}
            alt={link.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            src={
              link.iconUrl ||
              `https://www.google.com/s2/favicons?domain=${link.url}&sz=128`
            }
            alt={link.title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // Fallback if favicon loading fails
              const target = e.target as HTMLImageElement;
              target.src = "icons/default-icon.png";
            }}
          />
        )}
      </div>

      {showTitle && (
        <div className="mt-2 text-center text-sm text-gray-800 truncate w-full">
          {link.title}
        </div>
      )}

      {/* Edit and delete controls - visible on hover */}
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(link);
          }}
          className="p-1 text-gray-500 hover:text-blue-500"
          aria-label="Edit link"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link.id);
          }}
          className="p-1 text-gray-500 hover:text-red-500"
          aria-label="Delete link"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default LinkItem;
