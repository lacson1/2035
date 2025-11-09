import { useCallback, useEffect, useState } from "react";
import { Hub } from "../types";
import { hubsService, HubListParams } from "../services/hubs";
import { useAuth } from "../context/AuthContext";

interface UseHubsOptions {
  autoFetch?: boolean;
  params?: HubListParams;
  enabled?: boolean;
}

interface UseHubsResult {
  hubs: Hub[];
  isLoading: boolean;
  error: Error | null;
  refresh: (overrideParams?: HubListParams) => Promise<void>;
  setHubs: React.Dispatch<React.SetStateAction<Hub[]>>;
}

export function useHubs(options: UseHubsOptions = {}): UseHubsResult {
  const { autoFetch = true, params, enabled = true } = options;
  const { isAuthenticated } = useAuth();

  const [hubs, setHubs] = useState<Hub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHubs = useCallback(
    async (overrideParams?: HubListParams) => {
      if (!isAuthenticated || !enabled) {
        setHubs([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await hubsService.getHubs({
          limit: 200,
          ...params,
          ...overrideParams,
        });

        if (Array.isArray(response.data)) {
          setHubs(response.data);
        } else {
          setHubs([]);
        }
      } catch (err) {
        console.error("Failed to load hubs:", err);
        setError(err as Error);
        setHubs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, isAuthenticated, params]
  );

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchHubs();
  }, [autoFetch, fetchHubs]);

  return {
    hubs,
    isLoading,
    error,
    refresh: fetchHubs,
    setHubs,
  };
}

export default useHubs;
