import { IObjectManagement } from "@/core/Core/NinjaProps";
import { 
  // PivotControls, 
  useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useState, useRef } from "react";
import { BoxHelper, DirectionalLight, DirectionalLightHelper, DoubleSide, Euler, Mesh, PerspectiveCamera, PointLight, PointLightHelper, SpotLight, SpotLightHelper, Vector2, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { PivotControls } from "./PivoitControl";


export const MyLights = () => {
  const editor = useContext(NinjaEditorContext);
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
  const editor = useContext(NinjaEditorContext);
  const [visible, setVisible] = useState<boolean>(false);
  const handleDrag = useRef<boolean>(false);
  const ref = useRef<any>();
  const catchRef = useRef<Mesh>();
  const { om } = prop;
  const id = om.id;
  if (om.args.type == "direction"){
    useHelper(ref, DirectionalLightHelper);
  }
  if (om.args.type == "spot"){
    useHelper(ref, SpotLightHelper);
  }
  if (om.args.type == "point"){
    useHelper(ref, PointLightHelper);
  }

  const onClick = (e, value: boolean) => {
    e.stopPropagation();
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
    // ref.current.loolAt(1, 1, 1);
  }

  useEffect(() => {
    if (om.args.position){
      ref.current.position.copy(om.args.position.clone());
    }
    if (om.args.rotation){
      ref.current.rotation.copy(om.args.rotation.clone());
    }
    if (om.args.scale){
      ref.current.scale.copy(om.args.scale.clone());
    }
  }, []);

  useFrame((_, delta) => {
    if ( visible != (editor.getSelectId() == id)){
      setVisible(editor.getSelectId() == id);
    }
    if (catchRef.current && ref.current){
      catchRef.current.position.copy(ref.current.position.clone());
      catchRef.current.rotation.copy(ref.current.rotation.clone());
      catchRef.current.scale.copy(ref.current.scale.clone());
    }
    if (ref.current){
      const isFocus = editor.getFocus(id);
      if (isFocus){
        // const pos = editor.getPosition(id);
        // editorData.current.position = new Vector3().copy(pos);
        // const rot = editor.getRotation(id);
        // editorData.current.rotation = new Euler().copy(rot);
        // const sca = editor.getScale(id);
        // editorData.current.scale = new Vector3().copy(sca);
      }
      else {
        const castShadow = editor.getCastShadow(id);
        const receiveShadow = editor.getreceiveShadow(id);
        ref.current.castShadow = castShadow;
        ref.current.receiveShadow = receiveShadow;
        const material = editor.getMaterial(id);
        if (material && material.type == "color"){
          ref.current.color.set(material.value);
        }
      }
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
                object={visible ? ref : undefined}
            />
            <spotLight 
              ref={ref}
              castShadow
            />
            <mesh 
              onClick={(e) => onClick(e, true)}
              onPointerMissed={(e) => onClick(e, false)}
              ref={catchRef}
            >
              <boxBufferGeometry />
              <meshStandardMaterial wireframe={true} visible={false} />
            </mesh>
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
                object={visible ? ref : undefined}
            />
              <directionalLight 
                ref={ref}
                castShadow
              />
              <mesh 
                onClick={(e) => onClick(e, true)}
                onPointerMissed={(e) => onClick(e, false)}
                ref={catchRef}
                onContextMenu={(e) => {e.stopPropagation()}}
              >
                <boxBufferGeometry  />
                <meshStandardMaterial wireframe={true} visible={false} side={DoubleSide} />
              </mesh>
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
                object={visible ? ref : undefined}
            />
            <pointLight
              ref={ref}
              position={[0, 5, 0]}
              castShadow
            />
            <mesh 
              onClick={(e) => onClick(e, true)}
              onPointerMissed={(e) => onClick(e, false)}
              ref={catchRef}
            >
              <octahedronGeometry args={[1]} />
              <meshStandardMaterial wireframe={true} visible={false} color={0xff0000}/>
            </mesh>
          </>
        }
      </>
  )
}