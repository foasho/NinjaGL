import styles from "@/App.module.scss";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect } from "react";
import { NaniwaEditor } from "@/components/NaniwaEditor/NaniwaEditor";
import { ToastContainer } from "react-toastify";

const NaniwaEditorComponent = () => {
  const [editor, setEditor] = useState<NaniwaEditorManager>(null);

  useEffect(() => {
    setEditor(new NaniwaEditorManager());
    return () => {
      setEditor(null);
    }
  }, [false]);

  return (
    <>
      <NaniwaEditorContext.Provider value={editor}>
        {editor &&
          <NaniwaEditor />
        }
      </NaniwaEditorContext.Provider>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          style={{zIndex:99999}}
        />
    </>
  )
}


export default NaniwaEditorComponent;