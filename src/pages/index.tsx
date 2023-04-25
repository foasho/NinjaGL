import Head from 'next/head';
import styles from '../App.module.scss';
import { NinjaEditorContext, NinjaEditorProvider } from "@/editor/NinjaEditorManager";
import { useState, useEffect,  useContext } from "react";
// import { NinjaEditor } from "@/editor/NinjaEditor";
import { ToastContainer } from "react-toastify";
import dynamic from 'next/dynamic';

// Dynamic import
const NinjaEditor = dynamic(() => import('@/editor/NinjaEditor').then((mod) => mod.NinjaEditor), { ssr: false });

const ReadyNinjaEditor = () => {
  const [ready, setReady] = useState(false);
  const editor = useContext(NinjaEditorContext);
  useEffect(() => {
    if (!editor) return;
    else {
      setReady(true);
    }
    return () => {};
  }, [editor]);
  return (
    <>
      {ready && <NinjaEditor />}
    </>
  );
};

function Home() {
  return (
    <>
      <Head>
        <title>NinjaGL</title>
        <meta name="R3F-GameEngine" content="NinjaGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <NinjaEditorProvider>
          <ReadyNinjaEditor />
        </NinjaEditorProvider>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            style={{zIndex:99999}}
          />
      </main>
    </>
  )
}

export default Home;