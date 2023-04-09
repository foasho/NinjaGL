import type { AppProps } from 'next/app'
import "./styles/index.css";
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
