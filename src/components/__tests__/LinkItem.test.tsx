import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LinkItem from '../LinkItem';
import { Link } from '../../types';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

describe('LinkItem Component', () => {
  const mockLink: Link = {
    id: 'test-id',
    title: 'Test Link',
    url: 'https://example.com',
    iconType: 'favicon',
    iconUrl: 'https://example.com/favicon.ico',
    groupId: 'group-1',
    order: 0
  };
  
  const mockEdit = jest.fn();
  const mockDelete = jest.fn();
  
  beforeEach(() => {
    mockOpen.mockClear();
    mockEdit.mockClear();
    mockDelete.mockClear();
  });

  test('renders correctly with title', () => {
    render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockLink.iconUrl);
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockLink.title);
  });
  
  test('does not show title when showTitle is false', () => {
    render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={false}
        size="medium"
      />
    );
    
    expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
  });
  
  test('opens URL when clicked', () => {
    render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    // Find the clickable area (parent of the image)
    const clickableArea = screen.getByRole('img').parentElement;
    expect(clickableArea).toBeTruthy();
    
    if (clickableArea) {
      fireEvent.click(clickableArea);
      expect(mockOpen).toHaveBeenCalledWith(mockLink.url, '_blank');
    }
  });
  
  test('calls edit function when edit button is clicked', () => {
    render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    const editButton = screen.getByLabelText('Edit link');
    fireEvent.click(editButton);
    
    expect(mockEdit).toHaveBeenCalledWith(mockLink);
  });
  
  test('calls delete function when delete button is clicked', () => {
    render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete link');
    fireEvent.click(deleteButton);
    
    expect(mockDelete).toHaveBeenCalledWith(mockLink.id);
  });
  
  test('applies the correct size class', () => {
    const { rerender } = render(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="small"
      />
    );
    
    // Check for small size
    expect(screen.getByRole('img').parentElement).toHaveClass('w-16');
    expect(screen.getByRole('img').parentElement).toHaveClass('h-16');
    
    // Rerender with medium size
    rerender(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    expect(screen.getByRole('img').parentElement).toHaveClass('w-24');
    expect(screen.getByRole('img').parentElement).toHaveClass('h-24');
    
    // Rerender with large size
    rerender(
      <LinkItem
        link={mockLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="large"
      />
    );
    
    expect(screen.getByRole('img').parentElement).toHaveClass('w-32');
    expect(screen.getByRole('img').parentElement).toHaveClass('h-32');
  });
  
  test('renders custom icon from base64 when available', () => {
    const customIconLink: Link = {
      ...mockLink,
      iconType: 'custom',
      iconUrl: undefined,
      iconBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };
    
    render(
      <LinkItem
        link={customIconLink}
        onEdit={mockEdit}
        onDelete={mockDelete}
        showTitle={true}
        size="medium"
      />
    );
    
    expect(screen.getByRole('img')).toHaveAttribute('src', customIconLink.iconBase64);
  });
});