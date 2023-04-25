import { NinjaEditorContext } from "@/editor/NinjaEditorManager";
import { IObjectManagement } from "ninjagl-core";
import { useContext, useEffect, useRef, useState } from "react";
import { Text, Text3D, useFont, FontData } from "@react-three/drei";


export const MyTexts = () => {
  const editor = useContext(NinjaEditorContext);
  const [texts, setTexts] = useState<IObjectManagement[]>([]);

  useEffect(() => {
    setTexts(editor.getTexts());
    const handleTextsChanged = () => {
      setTexts([...editor.getTexts()]);
    }
    editor.onTextChanged(handleTextsChanged);
    return () => {
      editor.offTextChanged(handleTextsChanged);
    }
  }, [editor]);

  return (
    <>
      {texts.map((om) => {
        return <TextComponent om={om} key={om.id} />
      })}
    </>
  )
}

const TextComponent = ({ om }) => {
  const ref = useRef<any>();
  const font: any = useFont("MPLUS.json");
  useEffect(() => {
    if (ref.current){
      if (om.args.position){
        ref.current.position.copy(om.args.position);
      }
      if (om.args.rotation){
        ref.current.rotation.copy(om.args.rotation);
      }
      if (om.args.scale){
        ref.current.scale.copy(om.args.scale);
      }
    }
  }, []);
  return (
    <>
      {om.args.type == "3dtext"? 
        <>
          <Text3D
            ref={ref}
            font={font}
          >
            {om.args.text}
          </Text3D>
        </>
        :
        <>
          <Text 
            ref={ref}
            font={font}
          >
            {om.args.text}
          </Text>
        </>
      }
    </>
  )
}