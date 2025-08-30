import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { ApiResponse, errorHandler } from "../lib/api";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showToast?: boolean;
    toastMessages?: {
      success?: string;
      error?: string;
    };
  } = {},
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { toast } = useToast();
  const { onSuccess, onError, showToast = true, toastMessages } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });

          if (onSuccess) {
            onSuccess(response.data);
          }

          if (showToast && toastMessages?.success) {
            toast({
              title: "Success",
              description: toastMessages.success,
            });
          }

          return response.data;
        } else {
          const errorMessage = response.error || "Operation failed";
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });

          if (onError) {
            onError(errorMessage);
          }

          if (showToast) {
            toast({
              title: "Error",
              description: toastMessages?.error || errorMessage,
              variant: "destructive",
            });
          }

          return null;
        }
      } catch (error) {
        const errorMessage = errorHandler.handleError(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (onError) {
          onError(errorMessage);
        }

        if (showToast) {
          toast({
            title: "Error",
            description: toastMessages?.error || errorMessage,
            variant: "destructive",
          });
        }

        return null;
      }
    },
    [apiFunction, onSuccess, onError, showToast, toastMessages, toast],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hooks for common use cases
export function useApiData<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: Parameters<typeof useApi>[1] = {},
) {
  const apiHook = useApi(apiFunction, options);

  const refresh = useCallback(() => {
    if (dependencies.length > 0) {
      apiHook.execute(...dependencies);
    } else {
      apiHook.execute();
    }
  }, [apiHook, dependencies]);

  return {
    ...apiHook,
    refresh,
  };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiFunction: (filters: any) => Promise<ApiResponse<T[]>>,
  initialFilters: any = {},
  options: Parameters<typeof useApi>[1] = {},
) {
  const [filters, setFilters] = useState(initialFilters);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const apiHook = useApi(
    async (newFilters: any) => {
      const result = await apiFunction(newFilters);
      return result;
    },
    {
      ...options,
      onSuccess: (data: T[]) => {
        if (filters.offset === 0) {
          setAllData(data);
        } else {
          setAllData((prev) => [...prev, ...data]);
        }

        // Check if we have more data
        setHasMore(data.length === (filters.limit || 20));

        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
    },
  );

  const loadMore = useCallback(() => {
    if (!apiHook.loading && hasMore) {
      const newFilters = {
        ...filters,
        offset: (filters.offset || 0) + (filters.limit || 20),
      };
      setFilters(newFilters);
      apiHook.execute(newFilters);
    }
  }, [apiHook, filters, hasMore]);

  const refresh = useCallback(() => {
    const newFilters = { ...filters, offset: 0 };
    setFilters(newFilters);
    setAllData([]);
    setHasMore(true);
    apiHook.execute(newFilters);
  }, [apiHook, filters]);

  const updateFilters = useCallback(
    (newFilters: any) => {
      const updatedFilters = { ...newFilters, offset: 0 };
      setFilters(updatedFilters);
      setAllData([]);
      setHasMore(true);
      apiHook.execute(updatedFilters);
    },
    [apiHook],
  );

  return {
    data: allData,
    loading: apiHook.loading,
    error: apiHook.error,
    hasMore,
    loadMore,
    refresh,
    updateFilters,
    filters,
  };
}

// Hook for optimistic updates
export function useOptimisticApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  optimisticUpdate: (data: T, ...args: any[]) => T,
  options: Parameters<typeof useApi>[1] = {},
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const apiHook = useApi(apiFunction, {
    ...options,
    onSuccess: (data: T) => {
      setOptimisticData(null); // Clear optimistic data on success
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: string) => {
      setOptimisticData(null); // Clear optimistic data on error
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  const executeOptimistic = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Apply optimistic update immediately
      if (apiHook.data) {
        const optimistic = optimisticUpdate(apiHook.data, ...args);
        setOptimisticData(optimistic);
      }

      // Execute the actual API call
      return apiHook.execute(...args);
    },
    [apiHook, optimisticUpdate],
  );

  return {
    ...apiHook,
    data: optimisticData || apiHook.data,
    execute: executeOptimistic,
  };
}

// Hook for managing multiple API calls
export function useMultipleApi<T extends Record<string, any>>(
  apiCalls: {
    [K in keyof T]: (...args: any[]) => Promise<ApiResponse<T[K]>>;
  },
  options: Parameters<typeof useApi>[1] = {},
) {
  const [state, setState] = useState<{
    [K in keyof T]: UseApiState<T[K]>;
  }>(() => {
    const initialState = {} as any;
    Object.keys(apiCalls).forEach((key) => {
      initialState[key] = {
        data: null,
        loading: false,
        error: null,
      };
    });
    return initialState;
  });

  const { toast } = useToast();

  const execute = useCallback(
    async <K extends keyof T>(key: K, ...args: any[]): Promise<T[K] | null> => {
      setState((prev) => ({
        ...prev,
        [key]: { ...prev[key], loading: true, error: null },
      }));

      try {
        const response = await apiCalls[key](...args);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            [key]: {
              data: response.data!,
              loading: false,
              error: null,
            },
          }));

          return response.data;
        } else {
          const errorMessage = response.error || "Operation failed";
          setState((prev) => ({
            ...prev,
            [key]: {
              data: null,
              loading: false,
              error: errorMessage,
            },
          }));

          if (options.showToast !== false) {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }

          return null;
        }
      } catch (error) {
        const errorMessage = errorHandler.handleError(error);
        setState((prev) => ({
          ...prev,
          [key]: {
            data: null,
            loading: false,
            error: errorMessage,
          },
        }));

        if (options.showToast !== false) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        return null;
      }
    },
    [apiCalls, options.showToast, toast],
  );

  const reset = useCallback((key?: keyof T) => {
    if (key) {
      setState((prev) => ({
        ...prev,
        [key]: {
          data: null,
          loading: false,
          error: null,
        },
      }));
    } else {
      setState((prev) => {
        const newState = {} as any;
        Object.keys(prev).forEach((k) => {
          newState[k] = {
            data: null,
            loading: false,
            error: null,
          };
        });
        return newState;
      });
    }
  }, []);

  return {
    state,
    execute,
    reset,
    isLoading: (key: keyof T) => state[key]?.loading || false,
    getData: (key: keyof T) => state[key]?.data || null,
    getError: (key: keyof T) => state[key]?.error || null,
  };
}
