import { QueryClient } from "@tanstack/react-query"
import { RpcError } from "./rpc"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => !(error instanceof RpcError && error.code === -32601) && failureCount < 2,
    },
  },
})
