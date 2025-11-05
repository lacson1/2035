import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading patients..." />);
    expect(screen.getByText('Loading patients...')).toBeInTheDocument();
  });

  it('renders full screen when fullScreen prop is true', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

