import type { AppProps } from 'next/app'
import "../components/NinjaEditor/Locale";
import "./styles/global.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
