import Head from 'next/head';
import { Inter } from '@next/font/google';
import styles from '../App.module.scss';
import { NinjaEditorContext, NinjaEditorManager } from "@/editor/NinjaEditorManager";
import { useState, useEffect } from "react";
import { NinjaEditor } from "@/editor/NinjaEditor";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ['latin'] })

function Home() {
  const [editor, setEditor] = useState<NinjaEditorManager>(null);

  useEffect(() => {
    setEditor(new NinjaEditorManager());
    return () => {
      setEditor(null);
    }
  }, [false]);

  const mode = process.env.MODE;

  return (
    <>
      <Head>
        <title></title>
        <meta name="ReactGameEngine" content="NinjaGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <NinjaEditorContext.Provider value={editor}>
          {editor &&
            <NinjaEditor />
          }
        </NinjaEditorContext.Provider>
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