import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/apiError";
import { useAsyncRequest } from "./useAsyncRequest";

afterEach(() => {
  cleanup();
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useAsyncRequest", () => {
  it("supports an explicit initial loading and empty-data state", () => {
    const request = vi.fn();
    const { result } = renderHook(() => useAsyncRequest(request, {
      initialData: [],
      initialLoading: true,
    }));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe("");
    expect(request).not.toHaveBeenCalled();
  });

  it("tracks loading and stores a successful response", async () => {
    const response = deferred();
    const request = vi.fn(() => response.promise);
    const { result } = renderHook(() => useAsyncRequest(request));
    let runPromise;

    act(() => {
      runPromise = result.current.run("course-1");
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");

    await act(async () => {
      response.resolve(["document-1"]);
      await runPromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(["document-1"]);
    expect(request).toHaveBeenCalledWith(expect.any(AbortSignal), "course-1");
  });

  it("stores an empty successful response without treating it as an error", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => useAsyncRequest(request, { initialData: ["old"] }));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("exposes a user-safe error when a request fails", async () => {
    const request = vi.fn().mockRejectedValue(new Error("database password leaked"));
    const { result } = renderHook(() => useAsyncRequest(request));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Đã xảy ra lỗi ngoài dự kiến. Vui lòng thử lại.");
    expect(result.current.error).not.toContain("password");
  });

  it("displays the clear message carried by a backend ApiError", async () => {
    const request = vi.fn().mockRejectedValue(new ApiError(
      "Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.",
      { status: 404, code: "RESOURCE_NOT_FOUND" },
    ));
    const { result } = renderHook(() => useAsyncRequest(request));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.error).toBe("Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.");
    expect(result.current.loading).toBe(false);
  });

  it("retries with the arguments from the latest run", async () => {
    const request = vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("retried");
    const { result } = renderHook(() => useAsyncRequest(request));

    await act(async () => {
      await result.current.run("session-7", { page: 2 });
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1].slice(1)).toEqual(["session-7", { page: 2 }]);
    expect(result.current.data).toBe("retried");
  });

  it("cancels an active request without displaying an error", async () => {
    const request = vi.fn((signal) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        reject(abortError);
      });
    }));
    const { result } = renderHook(() => useAsyncRequest(request));
    let runPromise;

    act(() => {
      runPromise = result.current.run();
    });
    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.cancel();
    });
    await act(async () => {
      await runPromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("ignores a stale response after a newer request finishes", async () => {
    const first = deferred();
    const second = deferred();
    const request = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const { result } = renderHook(() => useAsyncRequest(request));
    let firstRun;
    let secondRun;

    act(() => {
      firstRun = result.current.run("old");
      secondRun = result.current.run("new");
    });

    await act(async () => {
      second.resolve("new response");
      await secondRun;
    });
    expect(result.current.data).toBe("new response");

    await act(async () => {
      first.resolve("stale response");
      await firstRun;
    });

    await waitFor(() => expect(result.current.data).toBe("new response"));
  });

  it("aborts the active request before starting another run", async () => {
    const aborts = [];
    const request = vi.fn((signal, value) => new Promise((resolve, reject) => {
      if (value === "new") {
        resolve("new response");
        return;
      }
      signal.addEventListener("abort", () => {
        aborts.push(value);
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        reject(abortError);
      });
    }));
    const { result } = renderHook(() => useAsyncRequest(request));
    let firstRun;

    act(() => {
      firstRun = result.current.run("old");
    });
    await act(async () => {
      await result.current.run("new");
      await firstRun;
    });

    expect(aborts).toEqual(["old"]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(result.current.data).toBe("new response");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });
});
