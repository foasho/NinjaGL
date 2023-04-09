import { IObjectManagement } from "@/core/utils/NinjaProps";
import { 
  // PivotControls, 
  useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useState, useRef } from "react";
import { BoxHelper, DirectionalLight, DirectionalLightHelper, DoubleSide, Euler, Material, Mesh, PerspectiveCamera, PointLight, PointLightHelper, SpotLight, SpotLightHelper, Vector2, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

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
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
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

  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
  }

  const onDrag = (e) => {
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
    // キャッチ用Boxを同期させる
    if (catchRef.current && ref.current){
      catchRef.current.position.copy(ref.current.position.clone());
      catchRef.current.rotation.copy(ref.current.rotation.clone());
      catchRef.current.scale.copy(ref.current.scale.clone());
    }

    if (ref.current){
      if (state.editorFocus){
        const color = ref.current?.color;
        if (color && color.isColor){
          const meshStandardMaterial = ref.current? ref.current.material: new Material();
          meshStandardMaterial.color.set(color);
          editor.setMaterial(id, meshStandardMaterial);
        }
      }
      const castShadow = editor.getCastShadow(id);
      const receiveShadow = editor.getreceiveShadow(id);
      ref.current.castShadow = castShadow;
      ref.current.receiveShadow = receiveShadow;
      const material = editor.getMaterial(id);
      if (material instanceof Material){
        ref.current.material = material;
        ref.current.needsUpdate = true;
      }
    }
  })
  
  return (
      <>
        {om.args.type == "spot" &&
          <>
            {!state.editorFocus &&
              <PivotControls
                  scale={5}
                  visible={(id==state.currentId)}
                  disableAxes={!(id==state.currentId)}
                  disableSliders={!(id==state.currentId)}
                  disableRotations={!(id==state.currentId)}
                  onDrag={(e) => onDrag(e)}
                  onDragStart={() => onDragStart()}
                  onDragEnd={() => onDragEnd()}
                  object={(id==state.currentId) ? ref : undefined}
              />
            }
            <spotLight 
              ref={ref}
              castShadow
            />
            <mesh 
              onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
              onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
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
                visible={(id==state.currentId)}
                disableAxes={!(id==state.currentId)}
                disableSliders={!(id==state.currentId)}
                disableRotations={!(id==state.currentId)}
                onDrag={(e) => onDrag(e)}
                onDragStart={() => onDragStart()}
                onDragEnd={() => onDragEnd()}
                object={(id==state.currentId) ? ref : undefined}
            />
              <directionalLight 
                ref={ref}
                castShadow
              />
              <mesh 
                onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
                onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
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
                visible={(id==state.currentId)}
                disableAxes={!(id==state.currentId)}
                disableSliders={!(id==state.currentId)}
                disableRotations={!(id==state.currentId)}
                onDrag={(e) => onDrag(e)}
                onDragStart={() => onDragStart()}
                onDragEnd={() => onDragEnd()}
                object={(id==state.currentId) ? ref : undefined}
            />
            <pointLight
              ref={ref}
              position={[0, 5, 0]}
              castShadow
            />
            <mesh 
              onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
              onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
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