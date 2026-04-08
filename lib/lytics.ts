export interface JsTag {
  send(data: Record<string, unknown>): void;
  send(
    stream: string,
    data: Record<string, unknown>,
    cb?: (res: unknown) => void
  ): void;
  pageView(): void;
}

declare global {
  interface Window {
    jstag?: JsTag;
  }
}

/** Fire-and-forget send. Silently no-ops if jstag hasn't loaded yet. */
export function lyticsSend(data: Record<string, unknown>): void {
  if (typeof window !== "undefined" && window.jstag) {
    window.jstag.send(data);
  }
}
