import { IObjectManagement } from "ninja-core";
import { MeshReflectorMaterial, useHelper } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { BoxHelper, Euler, Group, Material, Matrix4, Mesh, MeshPhongMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, ShaderMaterial, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager"
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { EnableClickTrigger } from "@/commons/functional";


export const ThreeObjects = () => {
  const editor = useContext(NinjaEditorContext);
  const [threeOMs, setThreeOMs] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setThreeOMs(editor.getThreeObjects());
    const handleThreesChanged = () => {
      setThreeOMs([...editor.getThreeObjects()]);
    }
    editor.onThreeChanged(handleThreesChanged);
    return () => {
      editor.offOMsChanged(handleThreesChanged);
    }
  }, []);
  return (
    <>
      {threeOMs.map((om) => {
        return <ThreeObject om={om} key={om.id} />
      })}
    </>
  )
}

interface IThreeObject {
  om: IObjectManagement;
}
const ThreeObject = (props: IThreeObject) => {
  const { om } = props;
  const { camera } = useThree();
  const state = useSnapshot(globalStore);
  const ref = useRef<Mesh>();
  const editor = useContext(NinjaEditorContext);
  const [helper, setHelper] = useState<boolean>(false);
  const id = props.om.id;
  const matRef = useRef<any>();
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

  let material;
  let color;
  if (om.args.materialData){
    if (om.args.materialData.type == "standard") {
      material = (<meshStandardMaterial ref={matRef} />);
    }
    else if (om.args.materialData.type == "phong") {
      material = (<meshPhongMaterial ref={matRef} />);
    }
    else if (om.args.materialData.type == "toon") {
      material = (<meshToonMaterial ref={matRef} />);
    }
    else if (om.args.materialData.type == "reflection"){
      material = (<MeshReflectorMaterial mirror={0} ref={matRef}/>);
    }
  }


  // 操作系
  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
    // globalStore.pivotControl = false;
  }
  
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
  
  useEffect(() => {
    const init = () => {
      if (ref.current) {
        if (om.args.position) {
          ref.current.position.copy(om.args.position);
        }
        if (om.args.rotation) {
          ref.current.rotation.copy(om.args.rotation);
        }
        if (om.args.scale) {
          ref.current.scale.copy(om.args.scale);
        }
        if (om.args.materialData){
          if (om.args.materialData.type !== "shader"){
            if (matRef.current){
              matRef.current.color.set(om.args.materialData.value);
            }
          }
        }
      }
    }
    init();
    editor.onOMIdChanged(id, init);
    return () => {
      editor.offOMIdChanged(id, init);
    }
  }, []);

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
            onClick={(e) => {
              e.stopPropagation();
              if (EnableClickTrigger(
                camera.position.clone(), 
                ref.current
              )){
                globalStore.currentId = id
              }
            }}
            onPointerMissed={(e) => e.type === 'click' && (globalStore.init())}
            castShadow={true}
            receiveShadow={true}
          >
            {geometry}
            {material}
          </mesh>
        </>
      }
    </>
  )
}