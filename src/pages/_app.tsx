import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { QueryClient } from '@tanstack/react-query';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <Component {...pageProps} />
  );
}

export default MyApp;
