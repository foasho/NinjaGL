import { IObjectManagement } from "@/core/utils/NinjaProps";
import { 
  // PivotControls, 
  useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useState, useRef } from "react";
import { BoxHelper, Color, DirectionalLight, DirectionalLightHelper, DoubleSide, Euler, Material, Mesh, PerspectiveCamera, PointLight, PointLightHelper, SpotLight, SpotLightHelper, Vector2, Vector3 } from "three";
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
      {lights.map((om, idx) => {
        return <MyLight om={om} key={idx}/>
      })}
    </>
  )
}

interface ILightProps {
  om       : IObjectManagement;
}
export const MyLight = (prop: ILightProps) => {
  const [ready, setReady] = useState<boolean>(false);
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const ref = useRef<any>();
  const catchRef = useRef<Mesh>();
  const { om } = prop;
  const id = om.id;
  let _helperObject: any = DirectionalLightHelper;
  if (om.args.type == "spot"){
    _helperObject = SpotLightHelper;
  }
  if (om.args.type == "point"){
    _helperObject = PointLightHelper;
  }
  useHelper(ref, _helperObject);

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
    if (om.args.materialData){
      const materialData = om.args.materialData;
      if (materialData.value){
        ref.current.color.copy(new Color(materialData.value));
      }
      ref.current.needsUpdate = true;
    }
    setReady(true);
  }, []);

  useFrame((_, delta) => {
    if (!ready) return;
    // キャッチ用Boxを同期させる
    if (catchRef.current && ref.current){
      catchRef.current.position.copy(ref.current.position.clone());
      catchRef.current.rotation.copy(ref.current.rotation.clone());
      catchRef.current.scale.copy(ref.current.scale.clone());
    }

    if (ref.current){
      if (state.editorFocus){
        const materialData = editor.getMaterialData(id);
        if (materialData){
          if (ref.current.color && materialData.value){
            ref.current.color.copy(new Color(materialData.value));
          }
          ref.current.needsUpdate = true;
        }
      }
      else {
        const color = ref.current?.color;
        if (color){
          editor.setMaterialData(id, "standard", "#"+color.getHexString());
        }
      }
      const castShadow = editor.getCastShadow(id);
      const receiveShadow = editor.getreceiveShadow(id);
      ref.current.castShadow = castShadow;
      ref.current.receiveShadow = receiveShadow;
      const materialData = editor.getMaterialData(id);
      if (materialData && materialData.type == "standard"){
        if (ref.current.color && materialData.color){
          ref.current.color.copy(new Color(materialData.color));
        }
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
        {om.args.type == "directional" &&
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