import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider, useApp } from '../AppContext';
import { db } from '../db';

// Spy on database methods
jest.spyOn(db.links, 'toArray').mockResolvedValue([]);
jest.spyOn(db.groups, 'toArray').mockResolvedValue([]);
jest.spyOn(db.settings, 'toArray').mockResolvedValue([]);
jest.spyOn(db.links, 'add').mockResolvedValue('');
jest.spyOn(db.groups, 'add').mockResolvedValue('');
jest.spyOn(db.settings, 'add').mockResolvedValue(1);
jest.spyOn(db.links, 'update').mockResolvedValue(1);
jest.spyOn(db.groups, 'update').mockResolvedValue(1);
jest.spyOn(db.links, 'delete').mockResolvedValue();
jest.spyOn(db.groups, 'delete').mockResolvedValue();
jest.spyOn(db.settings, 'clear').mockResolvedValue();

// Create a test component that uses the context
const TestComponent: React.FC = () => {
  const { state, addGroup, addLink, updateSettings } = useApp();
  
  return (
    <div>
      <div data-testid="group-count">{state.groups.length}</div>
      <div data-testid="link-count">{state.links.length}</div>
      <div data-testid="items-per-row">{state.settings.itemsPerRow}</div>
      <button 
        data-testid="add-group-button" 
        onClick={() => addGroup('Test Group')}
      >
        Add Group
      </button>
      <button 
        data-testid="add-link-button" 
        onClick={() => addLink({
          title: 'Test Link',
          url: 'https://example.com',
          groupId: 'default',
          iconType: 'favicon'
        })}
      >
        Add Link
      </button>
      <button 
        data-testid="update-settings-button" 
        onClick={() => updateSettings({
          itemsPerRow: 6,
          itemSize: 'large',
          showTitles: false
        })}
      >
        Update Settings
      </button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('provides default state values', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('group-count')).toHaveTextContent('0');
      expect(screen.getByTestId('link-count')).toHaveTextContent('0');
      expect(screen.getByTestId('items-per-row')).toHaveTextContent('5');
    });
  });
  
  test('adds a new group', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('group-count')).toHaveTextContent('0');
    });
    
    // Mock the state update after adding a group
    (db.groups.toArray as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve([{ id: 'test-group-id', title: 'Test Group', order: 0, isCollapsed: false }]);
    });
    
    await act(async () => {
      screen.getByTestId('add-group-button').click();
    });
    
    await waitFor(() => {
      expect(db.groups.add).toHaveBeenCalled();
    });
  });
  
  test('adds a new link', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('link-count')).toHaveTextContent('0');
    });
    
    // Mock the state update after adding a link
    (db.links.toArray as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve([{
        id: 'test-link-id',
        title: 'Test Link',
        url: 'https://example.com',
        groupId: 'default',
        iconType: 'favicon',
        order: 0
      }]);
    });
    
    await act(async () => {
      screen.getByTestId('add-link-button').click();
    });
    
    await waitFor(() => {
      expect(db.links.add).toHaveBeenCalled();
    });
  });
  
  test('updates settings', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    await act(async () => {
      screen.getByTestId('update-settings-button').click();
    });
    
    await waitFor(() => {
      expect(db.settings.clear).toHaveBeenCalled();
      expect(db.settings.add).toHaveBeenCalledWith({
        itemsPerRow: 6,
        itemSize: 'large',
        showTitles: false
      });
    });
  });
});