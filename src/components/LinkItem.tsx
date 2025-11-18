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
    // window.open(link.url, "same");
    window.location.href = link.url;
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

  const getIconSource = () => {
    // Always use iconBase64 if available (for both custom and favicon types)
    if (link.iconBase64) {
      return link.iconBase64;
    }

    // Fallback: use iconUrl for backwards compatibility (deprecated)
    if (link.iconUrl) {
      return link.iconUrl;
    }

    // Final fallback: default SVG icon
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
  };

  return (
    <div className="group relative flex flex-col items-center p-4 rounded-lg dark:hover:bg-gray-500 hover:bg-gray-100 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500">
      <div
        className={`flex justify-center items-center cursor-pointer ${getSizeClass()}`}
        onClick={handleClick}
      >
        <img
          src={getIconSource()}
          alt={link.title}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            // Fallback if icon loading fails
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
          }}
        />
      </div>

      {showTitle && (
        <div className="mt-2 text-center text-[0.75rem] text-gray-900 dark:text-white truncate w-full">
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
