import { IObjectManagement } from "@/core/utils/NinjaProps";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { BoxHelper, Euler, Group, Material, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager"
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";


export const ThreeObjects = () => {
  const editor = useContext(NinjaEditorContext);
  const [threeOMs, setThreeOMs] = useState<IObjectManagement[]>([]);
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
  const state = useSnapshot(globalStore);
  const ref = useRef<Mesh>();
  const editor = useContext(NinjaEditorContext);
  const [helper, setHelper] = useState<boolean>(false);
  const id = props.om.id;
  const matRef = useRef<Material>();
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

  // 操作系
  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
    // globalStore.pivotControl = false;
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.position.copy(editor.getPosition(id));
      ref.current.rotation.copy(editor.getRotation(id));
      ref.current.scale.copy(editor.getScale(id));
    }
  }, []);

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    globalStore.pivotControl = true;
  }

  useFrame((_, delta) => {
    if (state.currentId == id && state.editorFocus && ref.current) {
      const pos = editor.getPosition(id);
      ref.current.position.copy(pos);
      const rot = editor.getRotation(id);
      ref.current.rotation.copy(rot);
      const scale = editor.getScale(id);
      ref.current.scale.copy(scale);
      const material = editor.getMaterial(id);
      console.log("check m");
      console.log(material);
      if (material && matRef.current !== material){
        console.log("set material");
        console.log(material);
        matRef.current = new MeshStandardMaterial({ color: 0x00ff00 });
        matRef.current.needsUpdate = true;
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

  useHelper(((state.currentId == id) && helper) && ref, BoxHelper);

  return (
    <>
      {geometry &&
        <>
          {!state.editorFocus &&
            <PivotControls
              object={(state.currentId == id) ? ref : undefined}
              visible={(state.currentId == id)}
              depthTest={false}
              lineWidth={2}
              anchor={[0, 0, 0]}
              onDrag={(e) => onDrag(e)}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
            />
          }
          <mesh 
            ref={ref}
            onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
            onPointerMissed={(e) => e.type === 'click' && (globalStore.init())}
            castShadow={true}
            receiveShadow={true}
          >
            {geometry}
            {matRef.current}
          </mesh>
        </>
      }
    </>
  )
}