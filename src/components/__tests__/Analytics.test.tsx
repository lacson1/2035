import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Analytics from '../Analytics';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('Analytics dashboard', () => {
  it('renders the overview metrics by default', () => {
    render(<Analytics />);

    expect(screen.getByText(/total patients/i)).toBeInTheDocument();
    expect(screen.getByText(/active appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/recovery rate/i)).toBeInTheDocument();
  });

  it('switches between analytics tabs', async () => {
    const user = userEvent.setup();
    render(<Analytics />);

    const [patientTab] = screen.getAllByRole('button', { name: /patient metrics/i });
    await user.click(patientTab);
    expect(screen.getByText(/monitor patient health trends/i)).toBeInTheDocument();

    const [appointmentsTab] = screen.getAllByRole('button', { name: /appointments/i });
    await user.click(appointmentsTab);
    expect(screen.getByText(/appointment scheduling, completion rates, and department utilization/i)).toBeInTheDocument();

    const [outcomesTab] = screen.getAllByRole('button', { name: /clinical outcomes/i });
    await user.click(outcomesTab);
    expect(screen.getByText(/track patient recovery rates, satisfaction, and quality metrics/i)).toBeInTheDocument();

    const [performanceTab] = screen.getAllByRole('button', { name: /performance/i });
    await user.click(performanceTab);
    expect(screen.getByText(/monitor system performance, response times, and provider metrics/i)).toBeInTheDocument();
  });
});
