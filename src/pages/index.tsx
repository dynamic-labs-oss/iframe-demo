"use client";

import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { setupIframe } from "@dynamic-labs/iframe-setup";

const Home: NextPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeUrl, setIframeUrl] = useState<URL | null>(null);

  /**
   * Because nextjs will hydrate the DOM with SSR content, we cannot
   * render the iframe until the client is hydrated and we have access
   * to the window object.
   */
  useEffect(() => {
    const url = new URL("https://basic-demo-repo.vercel.app/");

    url.searchParams.set("initial-parent-url", window.location.href);

    setIframeUrl(url);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe || !iframeUrl) return;

    const cleanUp = setupIframe(iframe, iframeUrl.origin);

    return () => {
      cleanUp();
    };
  }, [iframeUrl]);

  return (
    <div className={styles.container}>
      <Head>
        <title>iframe demo app</title>
      </Head>

      <main className={styles.main}>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }}>
            {iframeUrl && (
              <iframe
                src={iframeUrl.toString()}
                width="100%"
                height="95%"
                style={{ border: "none" }}
                title="Dynamic Demo"
                ref={iframeRef}
                allow="clipboard-read; clipboard-write"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
