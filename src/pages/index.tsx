import Head from 'next/head';
import styles from '../App.module.scss';
import { NinjaEditorContext, NinjaEditorManager } from "@/editor/NinjaEditorManager";
import { useState, useEffect, useCallback } from "react";
import { NinjaEditor } from "@/editor/NinjaEditor";
import { ToastContainer } from "react-toastify";

function Home() {
  const [editor, setEditor] = useState<NinjaEditorManager>();

  useEffect(() => {
    const editor = new NinjaEditorManager();
    setEditor(editor);
    return () => {
      setEditor(undefined);
    }
  }, []);

  return (
    <>
      <Head>
        <title></title>
        <meta name="ReactGameEngine" content="NinjaGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {editor &&
          <NinjaEditorContext.Provider value={editor}>
              <NinjaEditor />
          </NinjaEditorContext.Provider>
        }
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