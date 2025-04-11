import React, { useState } from 'react';
import { X } from 'react-feather';

interface AddGroupModalProps {
  onSave: (title: string) => void;
  onCancel: () => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Create New Group</h2>
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
            <label htmlFor="group-title" className="block text-sm font-medium text-gray-700 mb-1">
              Group Title
            </label>
            <input
              id="group-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              autoFocus
            />
          </div>
          
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
              disabled={!title.trim()}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;