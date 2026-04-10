import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
      // Keep background refetching predictable and avoid retry loops.
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
