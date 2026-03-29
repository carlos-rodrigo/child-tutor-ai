import { describe, expect, it, vi } from "vitest";

import {
  getTutorRetryDelayMs,
  requestTutorResponse,
  shouldRetryTutorResponse,
} from "../tutor-request";

describe("tutor-request", () => {
  it("retries rate-limited tutor requests with backoff until one succeeds", async () => {
    const fetchImpl = vi
      .fn<() => Promise<Response>>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "rate_limited" }), { status: 429 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const response = await requestTutorResponse({
      body: JSON.stringify({ messages: [{ role: "user", content: "teach me fractions" }] }),
      fetchImpl,
      maxRetries: 2,
      sleep,
    });

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledOnce();
    expect(sleep).toHaveBeenCalledWith(getTutorRetryDelayMs(0));
  });

  it("retries transient network failures but stops on aborts", async () => {
    const fetchImpl = vi
      .fn<() => Promise<Response>>()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const response = await requestTutorResponse({
      body: JSON.stringify({ messages: [{ role: "user", content: "teach me multiplication" }] }),
      fetchImpl,
      maxRetries: 2,
      sleep,
    });

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledOnce();

    const abortedFetch = vi.fn<() => Promise<Response>>().mockRejectedValueOnce(
      new DOMException("Request aborted", "AbortError")
    );

    await expect(
      requestTutorResponse({
        body: JSON.stringify({ messages: [{ role: "user", content: "teach me division" }] }),
        fetchImpl: abortedFetch,
        maxRetries: 2,
        sleep,
      })
    ).rejects.toThrow("Request aborted");
  });

  it("only retries retryable HTTP responses", () => {
    expect(shouldRetryTutorResponse(429)).toBe(true);
    expect(shouldRetryTutorResponse(503)).toBe(true);
    expect(shouldRetryTutorResponse(400)).toBe(false);
  });
});
