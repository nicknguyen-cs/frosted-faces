"use client";

import { useEffect } from "react";
import contentstack from "@contentstack/delivery-sdk";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import type { IStackSdk } from "@contentstack/live-preview-utils";

export default function ContentstackVisualBuilder() {
  useEffect(() => {
    // Restore scroll position saved before SSR reload
    const savedY = sessionStorage.getItem("__vb_scrollY");
    if (savedY !== null) {
      sessionStorage.removeItem("__vb_scrollY");
      window.scrollTo(0, parseInt(savedY, 10));
    }

    const saveScroll = () => {
      sessionStorage.setItem("__vb_scrollY", String(window.scrollY));
    };
    window.addEventListener("beforeunload", saveScroll);

    const stack = contentstack.stack({
      apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
      deliveryToken: "unused-on-client",
      environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || "us",
      live_preview: {
        enable: true,
        preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN,
        host: "rest-preview.contentstack.com",
      },
    });

    ContentstackLivePreview.init({
      ssr: true,
      enable: true,
      mode: "builder",
      stackSdk: stack.config as unknown as IStackSdk,
      stackDetails: {
        apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
        environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      },
      editButton: { enable: true, includeByQueryParameter: true },
      editInVisualBuilderButton: { enable: false },
      cleanCslpOnProduction: true,
    });
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);

  return null;
}
