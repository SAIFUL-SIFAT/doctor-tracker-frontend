export class ApiError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; message: string }>;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    code: string = "INTERNAL_ERROR",
    details?: Array<{ field: string; message: string }>,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

interface RequestOptions extends RequestInit {
  retryOn401?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { retryOn401 = true, headers = {}, ...rest } = options;

  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  requestHeaders.set("X-Requested-With", "XMLHttpRequest");

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    credentials: "include",
  });

  if (response.status === 401 && retryOn401 && !url.includes("/auth/")) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(apiClient<T>(endpoint, { ...options, retryOn401: false })),
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new ApiError("Session expired", 401, "UNAUTHENTICATED");
      }

      processQueue(null);
      isRefreshing = false;

      return apiClient<T>(endpoint, { ...options, retryOn401: false });
    } catch (refreshErr) {
      processQueue(refreshErr);
      isRefreshing = false;
      if (typeof window !== "undefined") {
        window.location.href = `/login?next=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
      }
      throw refreshErr;
    }
  }

  let data: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorPayload = data?.error;
    const message = errorPayload?.message || response.statusText || "Request failed";
    const code = errorPayload?.code || (response.status === 401 ? "UNAUTHENTICATED" : "API_ERROR");
    throw new ApiError(message, response.status, code, errorPayload?.details, errorPayload?.requestId);
  }

  return data as T;
}
