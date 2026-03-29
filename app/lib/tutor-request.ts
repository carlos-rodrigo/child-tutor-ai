const DEFAULT_MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 600;
const MAX_RETRY_DELAY_MS = 2400;

interface RequestTutorResponseOptions {
  body: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  path?: string;
  signal?: AbortSignal;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function requestTutorResponse({
  body,
  fetchImpl = fetch,
  maxRetries = DEFAULT_MAX_RETRIES,
  path = "/api/tutor/teach",
  signal,
  sleep = defaultSleep,
}: RequestTutorResponseOptions) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetchImpl(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        signal,
      });

      if (response.ok || !shouldRetryTutorResponse(response.status) || attempt >= maxRetries) {
        return response;
      }
    } catch (error) {
      if (isAbortError(error) || !isRetryableNetworkError(error) || attempt >= maxRetries) {
        throw error;
      }
    }

    await sleep(getTutorRetryDelayMs(attempt));
  }
}

export function shouldRetryTutorResponse(status: number) {
  return status === 429 || status === 503;
}

export function getTutorRetryDelayMs(attempt: number) {
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function isRetryableNetworkError(error: unknown) {
  return error instanceof TypeError;
}
