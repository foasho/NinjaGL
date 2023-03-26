import { IObjectManagement } from "@/core/Core/NinjaProps";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { BoxHelper, Euler, Group, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager"
import { PivotControls } from "./PivoitControl";


export const ThreeObjects = () => {
  const editor = useContext(NinjaEditorContext);
  const [threeOMs, setThreeOMs] = useState<IObjectManagement[]>([]);
  const enabledCamera = (trig: boolean) => {
    editor.setEnabledCamera(trig);
  }
  useEffect(() => {
    setThreeOMs(editor.getThreeObjects())
  }, [])
  useFrame(() => {
    if (threeOMs.length !== editor.getThreeObjects().length){
      setThreeOMs(editor.getThreeObjects())
    }
  });
  return (
    <>
      {threeOMs.map(om => {
        return <ThreeObject om={om} />
      })}
    </>
  )
}

interface IThreeObject {
  om: IObjectManagement;
}
const ThreeObject = (props: IThreeObject) => {
  const { om } = props;
  const ref = useRef<Mesh>();
  const editor = useContext(NinjaEditorContext);
  const [visible, setVisible] = useState<boolean>(false);
  const [helper, setHelper] = useState<boolean>(true);
  const handleDrag = useRef<boolean>(false);
  const editorData = useRef<{ focus: boolean; position: Vector3, rotation: Euler }>({ focus: false, position: new Vector3(), rotation: new Euler() });
  const id = props.om.id;
  const matRef = useRef<MeshStandardMaterial>();
  let geometry;
  if (om.args.type == "plane") {
    geometry = (<planeBufferGeometry />);
  }
  else if (om.args.type == "sphere") {
    geometry = (<sphereBufferGeometry />);
  }
  else if (om.args.type == "box") {
    geometry = (<boxBufferGeometry />);
  }
  else if (om.args.type == "cylinder") {
    geometry = (<cylinderBufferGeometry />);
  }
  else if (om.args.type == "capsule") {
    geometry = (<capsuleGeometry />);
  }

  const onClick = (e, value: boolean) => {
    if (value) {
      // 選択できるのは１つのみにする
      if (editor.selectedId != id) {
        editor.selectObject(id);
        setVisible(true);
      }
    }
    else {
      if (e.type == "click" && !handleDrag.current) {
        editor.unSelectObject(id);
        setVisible(false);
      }
    }
  }

  // 操作系
  const onDragStart = () => {
    handleDrag.current = true;
  }
  const onDragEnd = () => {
    handleDrag.current = false;
  }

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    const isFocus = editor.getFocus(id);
    if (!isFocus) {
      console.log(position);
      editor.setPosition(id, position);
      editor.setScale(id, scale);
      editor.setRotation(id, rotation);
    }
    handleDrag.current = true;
  }

  useFrame((_, delta) => {
    const isNowSelect = (editor.getSelectOM() == props.om)?true: false;
    if (visible != isNowSelect){
      setVisible(isNowSelect);
    }
    editorData.current.focus = editor.getFocus(id);
    if (editorData.current.focus){
      const pos = editor.getPosition(id);
      editorData.current.position = new Vector3().copy(pos);
      const rot = editor.getRotation(id);
      editorData.current.rotation = new Euler().copy(rot);
      const scale = editor.getScale(id);
      // editorData.current.scale = new Vector3().copy(rot);
      const material = editor.getMaterial(id);
      if (material && matRef.current){
        if (material.type == "color"){
          matRef.current.color.set(material.value);
          matRef.current.needsUpdate = true;
        }
      }
    }
    if (ref.current){
      const castShadow = editor.getCastShadow(id);
      const receiveShadow = editor.getreceiveShadow(id);
      ref.current.castShadow = castShadow;
      ref.current.receiveShadow = receiveShadow;
      ref.current.visible = editor.getVisible(id);
    }
    if (helper !== editor.getHelper(id)){
      setHelper(editor.getHelper(id));
    }
  });

  useHelper((visible && helper) && ref, BoxHelper);

  return (
    <>
      {geometry &&
        <>
          <PivotControls
            object={visible ? ref : undefined}
            visible={visible}
            depthTest={false}
            lineWidth={2}
            anchor={[0, 0, 0]}
            onDrag={(e) => onDrag(e)}
            onDragStart={() => onDragStart()}
            onDragEnd={() => onDragEnd()}
            userData={editorData.current}
          />
          <mesh 
            ref={ref}
            onClick={(e) => {
              onClick(e, true)
            }}
            onPointerMissed={(e) => {
              onClick(e, false)
            }}
            castShadow={true}
            receiveShadow={true}
          >
            {geometry}
            <meshStandardMaterial ref={matRef} />
          </mesh>
        </>
      }
    </>
  )
}