import React from "react";
import { Link } from "../types";
import { Trash2, Edit, Move } from "react-feather";

export interface LinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  showTitle: boolean;
  size: "small" | "medium" | "large";
  dragHandleProps?: any; // For the drag handle
}

const LinkItem: React.FC<LinkItemProps> = ({
  link,
  onEdit,
  onDelete,
  showTitle,
  size,
  dragHandleProps,
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

  const getFallbackIconUrl = () => {
    // In browser mode, use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`;
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
            src={link.iconUrl || getFallbackIconUrl()}
            alt={link.title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // Fallback if favicon loading fails
              const target = e.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle></svg>';
            }}
          />
        )}
      </div>

      {showTitle && (
        <div className="mt-2 text-center text-sm text-gray-800 truncate w-full">
          {link.title}
        </div>
      )}

      {/* Drag handle in top-left corner - visible on hover */}
      <div
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10"
        {...dragHandleProps}
      >
        <Move size={16} className="text-gray-500 hover:text-gray-700" />
      </div>

      {/* Edit and delete controls - visible on hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
