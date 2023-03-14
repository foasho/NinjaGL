import styles from "@/App.module.scss";
import { GLTFViewer } from "@/components/NaniwaEditor/ViewPort/GLTFViewer";
import { MainViewer } from "@/components/NaniwaEditor/ViewPort/MainViewer";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect } from "react";
import { Vector3 } from "three";
import { NaniwaEditor } from "@/components/NaniwaEditor/NaniwaEditor";

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
    </>
  )
}


export default NaniwaEditorComponent;