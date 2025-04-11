import React, { useState, ChangeEvent } from "react";
import { Group, Link } from "../types";
import { X, Upload } from "react-feather";

interface AddLinkModalProps {
  groups: Group[];
  onSave: (linkData: Omit<Link, "id" | "order">) => void;
  onCancel: () => void;
  activeGroupId: string | null;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({
  groups,
  onSave,
  onCancel,
  activeGroupId,
}) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [groupId, setGroupId] = useState(
    activeGroupId || (groups.length > 0 ? groups[0].id : ""),
  );
  const [iconType, setIconType] = useState<"favicon" | "custom">("favicon");
  const [iconPreview, setIconPreview] = useState<string | undefined>(undefined);
  const [_iconFile, setIconFile] = useState<File | null>(null);

  // Sort groups by order
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Make sure there's a valid group
    if (!groupId && groups.length > 0) {
      setGroupId(groups[0].id);
      return;
    }

    const newLinkData: Omit<Link, "id" | "order"> = {
      title: title.trim(),
      url: url.startsWith("http") ? url.trim() : `https://${url.trim()}`,
      groupId,
      iconType,
    };

    // If using custom icon
    if (iconType === "custom" && iconPreview) {
      newLinkData.iconBase64 = iconPreview;
    }

    onSave(newLinkData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Add New Link</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="group"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Group
            </label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {sortedGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-1">
              Icon Type
            </p>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="iconType"
                  value="favicon"
                  checked={iconType === "favicon"}
                  onChange={() => setIconType("favicon")}
                  className="mr-2"
                />
                Use Website Favicon
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="iconType"
                  value="custom"
                  checked={iconType === "custom"}
                  onChange={() => setIconType("custom")}
                  className="mr-2"
                />
                Custom Icon
              </label>
            </div>
          </div>

          {iconType === "custom" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Icon
              </label>

              <div className="flex items-center space-x-4">
                {iconPreview && (
                  <div className="w-16 h-16 border rounded flex items-center justify-center p-1">
                    <img
                      src={iconPreview}
                      alt="Icon preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                  <Upload size={16} className="mr-2" />
                  <span>Upload Icon</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {iconType === "custom" && !iconPreview && (
                <p className="text-sm text-red-500 mt-1">
                  Please upload an icon image
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={iconType === "custom" && !iconPreview}
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;
