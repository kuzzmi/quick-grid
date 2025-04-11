import React, { useState, ChangeEvent } from 'react';
import { Link } from '../types';
import { X, Upload } from 'react-feather';

interface EditLinkModalProps {
  link: Link;
  onSave: (updatedLink: Link) => void;
  onCancel: () => void;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({
  link,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [iconType, setIconType] = useState<'favicon' | 'custom'>(link.iconType);
  const [iconPreview, setIconPreview] = useState<string | undefined>(
    link.iconType === 'custom' ? link.iconBase64 : undefined
  );
  const [iconFile, setIconFile] = useState<File | null>(null);

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
    
    const updatedLink: Link = {
      ...link,
      title: title.trim(),
      url: url.trim(),
      iconType
    };
    
    // If using custom icon and we have a new file
    if (iconType === 'custom' && iconPreview) {
      updatedLink.iconBase64 = iconPreview;
      updatedLink.iconUrl = undefined;
    } 
    // If switching to favicon
    else if (iconType === 'favicon') {
      updatedLink.iconBase64 = undefined;
      // The actual favicon URL will be set in the context
    }
    
    onSave(updatedLink);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Edit Link</h2>
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-1">Icon Type</p>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="iconType"
                  value="favicon"
                  checked={iconType === 'favicon'}
                  onChange={() => setIconType('favicon')}
                  className="mr-2"
                />
                Use Website Favicon
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="iconType"
                  value="custom"
                  checked={iconType === 'custom'}
                  onChange={() => setIconType('custom')}
                  className="mr-2"
                />
                Custom Icon
              </label>
            </div>
          </div>
          
          {iconType === 'custom' && (
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
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;