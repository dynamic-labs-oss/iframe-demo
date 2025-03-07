/**
 * Setup an iframe to comunicate with the Dynamic SDK
 * running inside the iframe
 *
 * This file is self contained and should not import or dependend on any
 * other file or package.
 *
 * @see https://www.npmjs.com/package/@dynamic-labs/iframe-setup
 */
/* eslint no-restricted-syntax: ["error", "ImportDeclaration"] */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MESSAGE_HANDLER = (...params: any[]) => Promise<any> | void;

export type IFRAME_EVENTS = {
  OPEN_URL: (args: {
    url: string;
    target?: "self" | "blank";
    features?: string;
  }) => void;
  UPDATE_PARENT_URL: (args: { url: string }) => void;
  APP_FOCUS: () => void;
};

/**
 * Setup an iframe to comunicate with the Dynamic SDK
 * running inside the iframe
 *
 * @returns a function to teardown the iframe setup
 */
export const setupIframe = (
  iframe: HTMLIFrameElement,
  origin: string
): VoidFunction => {
  const messageHandler = createMessageHandler<IFRAME_EVENTS>(window, origin);
  const messageSender = createMessageSender<IFRAME_EVENTS>(iframe);

  // Add initial parent url to iframe src
  const applyInitialParentUrlToIframeSrc = () => {
    const iframeURL = new URL(iframe.src);

    iframeURL.searchParams.set("initial-parent-url", window.location.href);

    iframe.src = iframeURL.toString();
  };

  // Add event listener to handle deeplink
  const setupOpenUrlHandler = () =>
    messageHandler("OPEN_URL", ({ url, target = "self", features }) => {
      if (target === "blank") {
        window.open(url, "_blank", features);
      } else {
        window.location.assign(url);
      }
    });

  // Watch for url changes and update Dynamic SDK in iframe
  const setupUrlUpdateHandler = (): VoidFunction => {
    const onPopState = () => {
      const url = window.location.href;

      messageSender("UPDATE_PARENT_URL", { url });
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  };

  /**
   * Watch for app focus and send event to Dynamic SDK in iframe
   */
  const watchForAppVisibilityChange = (): VoidFunction => {
    let lastFired = false;

    const onVisibilityOrFocus = () => {
      if (!lastFired && document.visibilityState === "visible") {
        lastFired = true;
        messageSender("APP_FOCUS");

        // Reset flag after a short delay to allow next valid trigger
        setTimeout(() => (lastFired = false), 100);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("focus", onVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("focus", onVisibilityOrFocus);
    };
  };

  applyInitialParentUrlToIframeSrc();

  // Holds all the cleanup handlers
  const cleanupHandlers: VoidFunction[] = [];

  cleanupHandlers.push(setupUrlUpdateHandler());
  cleanupHandlers.push(setupOpenUrlHandler());
  cleanupHandlers.push(watchForAppVisibilityChange());

  return () => cleanupHandlers.forEach((offHandler) => offHandler());
};

// Utils

/**
 * Create a message handler for the iframe
 */
const createMessageHandler =
  <T extends Record<string, MESSAGE_HANDLER>>(window: Window, origin: string) =>
  <EVENT_NAME extends Extract<keyof T, string>>(
    eventName: EVENT_NAME,
    handler: T[EVENT_NAME]
  ): VoidFunction => {
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== origin) return;

      const { eventName: incomingEventName, args } = event.data;

      if (eventName === incomingEventName) {
        handler(...args);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  };

/**
 * Create a function to send messages to the iframe
 */
const createMessageSender =
  <T extends Record<string, MESSAGE_HANDLER>>(iframe: HTMLIFrameElement) =>
  <EVENT_NAME extends Extract<keyof T, string>>(
    eventName: EVENT_NAME,
    ...args: Parameters<T[EVENT_NAME]>
  ) => {
    iframe.contentWindow?.postMessage(
      { args, eventName },
      new URL(iframe.src).origin
    );
  };
