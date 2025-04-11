import React from 'react';
import { ExternalLink, Settings, Plus, Grid } from 'react-feather';
import { useApp } from '../AppContext';
import { isExtensionMode } from '../db-utils';

const PopupApp: React.FC = () => {
  const { state } = useApp();

  const openNewTab = () => {
    if (isExtensionMode()) {
      chrome.tabs.create({ url: 'index.html' });
    } else {
      window.open('index.html', '_blank');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">QuickGrid</h1>
      
      <div className="space-y-3">
        <button
          onClick={openNewTab}
          className="flex items-center w-full px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          <ExternalLink size={16} className="mr-2" />
          Open in New Tab
        </button>
        
        <div className="py-2 border-t border-b">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-500">Groups</p>
              <p className="text-lg font-semibold">{state.groups.length}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-500">Links</p>
              <p className="text-lg font-semibold">{state.links.length}</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Manage your links and groups in the full page interface.
        </p>
      </div>
    </div>
  );
};

export default PopupApp;
