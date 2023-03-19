import { IObjectManagement } from "@/engine/Core/NaniwaProps";
import { PivotControls, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useState, useRef } from "react";
import { BoxHelper, DirectionalLight, DirectionalLightHelper, Euler, PerspectiveCamera, PointLight, PointLightHelper, SpotLight, SpotLightHelper, Vector2, Vector3 } from "three";
import { NaniwaEditorContext } from "../../NaniwaEditorManager";


export const MyLights = () => {
  const editor = useContext(NaniwaEditorContext);
  const [lights, setLights] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setLights(editor.getLights());
  }, [])
  useFrame((_, delta) => {
    if (lights.length !== editor.getLights().length){
      setLights(editor.getLights());
    }
  })
  return (
    <>
      {lights.map((om) => {
        return <MyLight om={om}/>
      })}
    </>
  )
}

interface ILightProps {
  om       : IObjectManagement;
}
export const MyLight = (prop: ILightProps) => {
  const itemsRef = useRef([]);
  const editor = useContext(NaniwaEditorContext);
  const [visible, setVisible] = useState<boolean>(false);
  const handleDrag = useRef<boolean>(false);
  const ref = useRef<any>();
  const { om } = prop;
  const id = om.id;
  const [helper, setHelper] = useState<boolean>(true);
  if (helper){
    if (om.args.type == "direction"){
      useHelper(ref, BoxHelper, 'cyan')
      useHelper(ref, DirectionalLightHelper);
    }
    if (om.args.type == "spot"){
      useHelper(ref, SpotLightHelper);
    }
    if (om.args.type == "point"){
      useHelper(ref, PointLightHelper);
    }
  }

  const onClick = (e, value: boolean) => {
    if (value) {
      // 選択できるのは１つのみにする
      if (editor.selectedId != id) {
        editor.selectObject(id);
      }
    }
    else {
      if (e.type == "click" && !handleDrag.current) {
        editor.unSelectObject(id);
      }
    }
  }

  const onDragStart = () => {
    handleDrag.current = true;
  }
  const onDragEnd = () => {
    handleDrag.current = false;
  }

  const onDrag = (e) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    handleDrag.current = true;
  }

  useFrame((_, delta) => {
    if ( visible != (editor.getSelectId() == id)){
      setVisible(editor.getSelectId() == id);
    }
  })
  
  return (
      <>
        {om.args.type == "spot" &&
          <>
            <PivotControls
                scale={5}
                visible={visible}
                disableAxes={!visible}
                disableSliders={!visible}
                disableRotations={!visible}
                onDrag={(e) => onDrag(e)}
                onDragStart={() => onDragStart()}
                onDragEnd={() => onDragEnd()}
            >
              <spotLight 
                ref={ref}
              />
            </PivotControls>
          </>
        }
        {om.args.type == "direction" &&
          <>
            <PivotControls
              scale={5}
              visible={visible}
              disableAxes={!visible}
              disableSliders={!visible}
              disableRotations={!visible}
              onDrag={(e) => onDrag(e)}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
            >
              <directionalLight 
                ref={ref}
                position={[5, 5, 5]}
              />
            </PivotControls>
          </>
        }
        {om.args.type == "point" &&
          <>
            <PivotControls
              scale={5}
              visible={visible}
              disableAxes={!visible}
              disableSliders={!visible}
              disableRotations={!visible}
              onDrag={(e) => onDrag(e)}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
            >
            <directionalLight 
              ref={ref}
              position={[0, 5, 0]}
            />
            </PivotControls>
          </>
        }
      </>
  )
}