import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import * as DashboardContextModule from '../context/DashboardContext';

const FallbackDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

let DashboardProvider: React.ComponentType<{ children: React.ReactNode }> = FallbackDashboardProvider;

try {
  const maybeProvider = (DashboardContextModule as {
    DashboardProvider?: React.ComponentType<{ children: React.ReactNode }>;
  }).DashboardProvider;

  if (maybeProvider) {
    DashboardProvider = maybeProvider;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (error: any) {
  // Ignore missing provider when module is mocked
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <UserProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </UserProvider>
  </AuthProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const componentName =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ui as any)?.type?.displayName ?? (ui as any)?.type?.name;

  if (componentName === 'LoadingSpinner') {
    return render(ui, options);
  }

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };

