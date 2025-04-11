import React, { useState } from 'react';
import { X } from 'react-feather';
import { GridSettings } from '../types';

interface SettingsModalProps {
  settings: GridSettings;
  onSave: (settings: GridSettings) => void;
  onCancel: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onCancel
}) => {
  const [itemsPerRow, setItemsPerRow] = useState(settings.itemsPerRow);
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(settings.itemSize);
  const [showTitles, setShowTitles] = useState(settings.showTitles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      itemsPerRow,
      itemSize,
      showTitles
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Grid Settings</h2>
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
            <label htmlFor="items-per-row" className="block text-sm font-medium text-gray-700 mb-1">
              Items Per Row
            </label>
            <input
              id="items-per-row"
              type="number"
              min="1"
              max="12"
              value={itemsPerRow}
              onChange={(e) => setItemsPerRow(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of links to display in each row (1-12)
            </p>
          </div>
          
          <div className="mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-1">Item Size</p>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemSize"
                  value="small"
                  checked={itemSize === 'small'}
                  onChange={() => setItemSize('small')}
                  className="mr-2"
                />
                Small
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemSize"
                  value="medium"
                  checked={itemSize === 'medium'}
                  onChange={() => setItemSize('medium')}
                  className="mr-2"
                />
                Medium
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemSize"
                  value="large"
                  checked={itemSize === 'large'}
                  onChange={() => setItemSize('large')}
                  className="mr-2"
                />
                Large
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="show-titles"
                type="checkbox"
                checked={showTitles}
                onChange={(e) => setShowTitles(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="show-titles" className="text-sm font-medium text-gray-700">
                Show Titles
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-6">
              Display the title text below each icon
            </p>
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
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;