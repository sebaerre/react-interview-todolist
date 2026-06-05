import React from 'react'
import { render, renderHook } from '@testing-library/react'
import type { RenderOptions, RenderHookOptions } from '@testing-library/react'
import { type QueryKey, QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children)
  }
}

export function renderWithClient(
  ui: React.ReactElement,
  queryClient = createQueryClient(),
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return { ...render(ui, { wrapper: makeWrapper(queryClient), ...options }), queryClient }
}

export function renderHookWithClient<T>(
  hook: () => T,
  queryClient = createQueryClient(),
  options?: Omit<RenderHookOptions<void>, "wrapper">,
  initialData?: { queryKey: QueryKey; data: unknown }[],
) {
  initialData?.forEach(({ queryKey, data }) => {
    queryClient.setQueryData(queryKey, data);
  });

  return { ...renderHook(hook, { wrapper: makeWrapper(queryClient), ...options }), queryClient };
}
