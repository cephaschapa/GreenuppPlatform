import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // console.error(`API Error: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { isFormData?: boolean; credentials?: RequestCredentials }
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: any = undefined;

  if (data) {
    if (options?.isFormData) {
      // FormData should be sent without Content-Type header
      // to let the browser set it with the correct boundary
      body = data as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  // console.log(`Making ${method} request to: ${url}`);

  try {
    // Add credentials to the request to ensure cookies are sent
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include", // Always include credentials for cross-domain requests
    });

    // Log response status, cookies, and important headers
    // console.log(`Response status: ${res.status}`);
    // console.log(`Response cookies present: ${!!document.cookie}`);
    if (document.cookie) {
      // console.log(`Cookie length: ${document.cookie.length}`);
    }

    if (!res.ok) {
      const text = await res.text();
      // console.error(`API error: ${res.status}`, text);

      // Try to parse JSON error response
      let errorMessage = text || res.statusText;
      try {
        const errorData = JSON.parse(text);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If not JSON, use the raw text
      }

      const error = new Error(errorMessage);
      // Attach the full response data for more detailed error handling
      (error as any).response = {
        status: res.status,
        data: (() => {
          try {
            return JSON.parse(text);
          } catch {
            return { message: text };
          }
        })(),
      };
      throw error;
    }

    return res;
  } catch (error) {
    // console.error(`Request error for ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // console.log(`Executing query for: ${queryKey[0]}`);
    // console.log(`Cookies present: ${!!document.cookie}`);

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    // console.log(`Query response status: ${res.status}`);
    if (res.status === 401) {
      // console.log("Authentication failed for request");
    } else {
      // console.log("Request authenticated successfully");
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Make queryClient globally accessible for WebSocket-driven updates
// This allows components outside the React rendering tree to access
// the queryClient instance (like WebSocket event handlers)
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: typeof queryClient;
  }
}

// Assign the queryClient to the window object for global access
if (typeof window !== "undefined") {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
