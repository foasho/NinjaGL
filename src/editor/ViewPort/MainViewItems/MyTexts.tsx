import { NinjaEditorContext } from "@/editor/NinjaEditorManager";
import { IObjectManagement } from "ninja-core";
import { useContext, useEffect, useState } from "react";


export const MyTexts = () => {
  const editor = useContext(NinjaEditorContext);
  const [texts, setTexts] = useState<IObjectManagement[]>([]);

  useEffect(() => {
    setTexts(editor.getTexts());
    const handleTextsChanged = () => {
      setTexts([...editor.getTexts()]);
    }
    editor.onTextsChanged(handleTextsChanged);
    return () => {
      editor.offTextsChanged(handleTextsChanged);
    }
  }, [editor]);

  return (
    <>
    </>
  )
}

const TextComponent = ( ) => {

  return (
    <>
    </>
  )
}