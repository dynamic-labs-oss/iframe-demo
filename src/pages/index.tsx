import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useRef } from "react";
import { setupIframe } from "../setupIframe";

const iframeUrl = new URL("https://basic-demo-repo.vercel.app/");

const Home: NextPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const cleanUp = setupIframe(iframe, iframeUrl.origin);

    return () => {
      cleanUp();
    };
  }, []);

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
            <iframe
              src={iframeUrl.toString()}
              width="100%"
              height="95%"
              style={{ border: "none" }}
              title="Dynamic Demo"
              ref={iframeRef}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
