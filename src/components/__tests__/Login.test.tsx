import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Login from '../Login';

const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: loginMock,
    register: registerMock,
    logout: vi.fn(),
    refreshToken: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe('Login component', () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it('submits login credentials', async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'doctor@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(loginMock).toHaveBeenCalledWith('doctor@example.com', 'password123');
    });
  });

  it('submits registration details when sign up is enabled', async () => {
    registerMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<Login />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'Sarah');
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Johnson');
    await user.type(screen.getByRole('textbox', { name: /^username$/i }), 'sarahj');
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'sarah@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'strongpassword');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(1);
      expect(registerMock).toHaveBeenCalledWith(
        'sarah@example.com',
        'strongpassword',
        'Sarah',
        'Johnson',
        'sarahj'
      );
    });
  });
});
