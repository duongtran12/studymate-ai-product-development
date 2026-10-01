import { useCallback, useEffect, useRef, useState } from "react";

export function useAsyncRequest(request, { initialData = null, initialLoading = false } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const lastArgumentsRef = useRef([]);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (mountedRef.current) setLoading(false);
  }, []);

  const run = useCallback(async (...requestArguments) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    controllerRef.current = controller;
    lastArgumentsRef.current = requestArguments;
    setLoading(true);
    setError("");

    try {
      const result = await request(controller.signal, ...requestArguments);
      if (mountedRef.current && requestIdRef.current === requestId) setData(result);
      return result;
    } catch (requestError) {
      if (requestError.name !== "AbortError" && mountedRef.current && requestIdRef.current === requestId) {
        setError(requestError.message);
      }
      return undefined;
    } finally {
      if (mountedRef.current && requestIdRef.current === requestId) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [request]);

  const retry = useCallback(() => run(...lastArgumentsRef.current), [run]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  return { data, setData, loading, error, setError, run, retry, cancel };
}
