import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import UserProfile from '../UserProfile';
import { User } from '../../types';
import * as UserContext from '../../context/UserContext';

// Mock user data
const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'physician',
  isActive: true,
  createdAt: '2024-01-01',
  specialty: 'Cardiology',
  department: 'Internal Medicine',
  phone: '555-1234',
};

const mockSetCurrentUser = vi.fn();

// Mock the UserContext
vi.mock('../../context/UserContext', async () => {
  const actual = await vi.importActual('../../context/UserContext');
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

describe('UserProfile', () => {
  beforeEach(() => {
    vi.mocked(UserContext.useUser).mockReturnValue({
      currentUser: mockUser,
      setCurrentUser: mockSetCurrentUser,
      logout: vi.fn(),
    });
  });

  it('renders user information', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    // Email appears multiple times, use getAllByText
    const emails = screen.getAllByText('test@example.com');
    expect(emails.length).toBeGreaterThan(0);
  });

  it('allows user to click edit button', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);
    
    // Find edit button by looking for button with Edit2 icon or text
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => 
      btn.textContent?.includes('Edit') || btn.querySelector('svg')
    ) || editButtons[0]; // Fallback to first button if no match
    
    expect(editButton).toBeInTheDocument();
    
    await user.click(editButton);
    
    // After clicking edit, input fields should be visible
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('allows user to type in input fields', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);
    
    // Click edit button - find by looking for Edit icon button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg')) || editButtons[0];
    await user.click(editButton);
    
    // Wait for input fields to appear
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // Get input fields - they should be visible now
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const firstNameInput = inputs.find(input => 
      input.closest('div')?.textContent?.includes('First Name')
    ) || inputs[0];
    const lastNameInput = inputs.find(input => 
      input.closest('div')?.textContent?.includes('Last Name')
    ) || inputs[1];
    
    // Verify initial values
    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    
    // Clear and type new values
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');
    
    // Verify the values were updated
    expect(firstNameInput.value).toBe('Jane');
    expect(lastNameInput.value).toBe('Smith');
  });

  it('allows user to type in email field', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);
    
    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg')) || editButtons[0];
    await user.click(editButton);
    
    // Wait for input fields to appear
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // Find email input by type
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const emailInput = inputs.find(input => 
      input.type === 'email' || input.value.includes('@')
    )!;
    
    // Verify initial value
    expect(emailInput.value).toBe('test@example.com');
    
    // Clear and type new email
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@example.com');
    
    // Verify the value was updated
    expect(emailInput.value).toBe('newemail@example.com');
  });

  it('allows user to type in phone field', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);
    
    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg')) || editButtons[0];
    await user.click(editButton);
    
    // Wait for input fields to appear
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // Find phone input
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const phoneInput = inputs.find(input => 
      input.type === 'tel' || input.value === '555-1234' || 
      input.closest('div')?.textContent?.includes('Phone')
    )!;
    
    // Verify initial value
    expect(phoneInput.value).toBe('555-1234');
    
    // Clear and type new phone number
    await user.clear(phoneInput);
    await user.type(phoneInput, '555-9876');
    
    // Verify the value was updated
    expect(phoneInput.value).toBe('555-9876');
  });

  it('allows user to save changes', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);
    
    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg')) || editButtons[0];
    await user.click(editButton);
    
    // Wait for input fields
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // Change first name
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const firstNameInput = inputs.find(input => 
      input.value === 'John' || input.closest('div')?.textContent?.includes('First Name')
    )!;
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'UpdatedName');
    
    // Find and click save button - it should be the form submit button
    const form = firstNameInput.closest('form');
    expect(form).toBeInTheDocument();
    
    // Submit the form
    await user.type(firstNameInput, '{Enter}'); // Submit via Enter or find submit button
    
    // Alternative: find Save button by text
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    await user.click(saveButton);
    
    // After saving, should return to view mode - verify setCurrentUser was called
    await waitFor(() => {
      expect(mockSetCurrentUser).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});

