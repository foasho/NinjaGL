// @ts-nocheck
import { IObjectManagement } from "@ninjagl/core";
import { MeshReflectorMaterial, useHelper } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { BoxHelper, Color, Euler, Group, Material, Matrix4, Mesh, MeshPhongMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, ShaderMaterial, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager"
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { EnableClickTrigger } from "@/commons/functional";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";


export const ThreeObjects = () => {
  const { onOMsChanged, offOMsChanged, oms } = useNinjaEditor();
  const [threeOMs, setThreeOMs] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setThreeOMs(editor.getThreeObjects());
    const handleThreesChanged = () => {
      const _threes = oms.filter((om) => {
        return om.type == "three";
      });
      setThreeOMs([..._threes]);
    }
    onOMsChanged(handleThreesChanged);
    return () => {
      offOMsChanged(handleThreesChanged);
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
  const [material, setMaterial] = useState<any>();
  // const matRef = useRef<any>();
  let geometry;
  if (om.args.type == "plane") {
    geometry = (<planeGeometry />);
  }
  else if (om.args.type == "sphere") {
    geometry = (<sphereGeometry />);
  }
  else if (om.args.type == "box") {
    geometry = (<boxGeometry />);
  }
  else if (om.args.type == "cylinder") {
    geometry = (<cylinderGeometry />);
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
        let _material;
        if (om.args.materialData){
          const color = om.args.materialData.value? new Color(om.args.materialData.value) : new Color(0xffffff);
          if (om.args.materialData.type == "standard") {
            _material = (<meshStandardMaterial color={color} />);
          }
          else if (om.args.materialData.type == "phong") {
            _material = (<meshPhongMaterial color={color} />);
          }
          else if (om.args.materialData.type == "toon") {
            _material = (<meshToonMaterial color={color} />);
          }
          else if (om.args.materialData.type == "reflection"){
            _material = (<MeshReflectorMaterial mirror={0} color={color} />);
          }
        }
        if (_material) setMaterial(_material);
        if (om.args.helper !== undefined) setHelper(om.args.helper);
        if (om.args.castShadow !== undefined){
          ref.current.castShadow = om.args.castShadow;
        }
        if (om.args.receiveShadow !== undefined){
          ref.current.receiveShadow = om.args.receiveShadow;
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
            castShadow={true}
            receiveShadow={true}
            onPointerMissed={(e) => e.type === 'click' && (globalStore.init())}
          >
            {geometry}
            {material}
          </mesh>
        </>
      }
    </>
  )
}