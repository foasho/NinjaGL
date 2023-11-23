import { useEffect } from "react";
import { globalEditorStore } from "../Store/editor";


export const WindowdAnalyzer = () => {

  const resize = () => {
    const width = window.innerWidth;
    if (width >= 768) {
      globalEditorStore.isMd = true;
    } else {
      globalEditorStore.isMd = false;
    }
  }

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    }
  }, []);
  
  return (
    <></>
  )
};