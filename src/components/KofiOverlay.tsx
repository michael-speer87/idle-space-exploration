import { useEffect } from "react";

const KOFI_USERNAME = "hippymp";

type KofiOverlayApi = {
  draw: (
    username: string,
    options: Record<string, string>,
  ) => void;
};

declare global {
  interface Window {
    kofiWidgetOverlay?: KofiOverlayApi;
  }
}

export function KofiOverlay() {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-kofi-overlay="true"]',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";

    script.async = true;
    script.dataset.kofiOverlay = "true";

    script.onload = () => {
      window.kofiWidgetOverlay?.draw(KOFI_USERNAME, {
        type: "floating-chat",
        "floating-chat.donateButton.text":
          "Support",
        "floating-chat.donateButton.background-color":
          "#29abe0",
        "floating-chat.donateButton.text-color":
          "#ffffff",
      });
    };

    script.onerror = () => {
      console.warn("Ko-fi overlay failed to load.");
    };

    document.body.appendChild(script);
  }, []);

  return null;
}