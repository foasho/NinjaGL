import { Environment, Float, Lightformer, useHelper } from "@react-three/drei";
import { useContext, useEffect, useRef, useState } from "react";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "ninja-core";
import { Euler, Vector3, BoxHelper, DoubleSide } from "three";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { PivotControls } from "./PivoitControl";

/**
 * Environment
 * @returns 
 */
export const MyEnviroment = () => {
  const [degraded, degrade] = useState(false)
  const editor = useContext(NinjaEditorContext);
  const [environment, setEnvironment] = useState<IObjectManagement>();
  const [lightformers, setLightformers] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setEnvironment(editor.getEnvironment());
    setLightformers(editor.getLightformers());
    const handleEnvChanged = () => {
      setEnvironment(editor.getEnvironment()?{...editor.getEnvironment()}: undefined);
      setLightformers([...editor.getLightformers()]);
    }
    editor.onEnvChanged(handleEnvChanged);
    return () => {
      editor.offEnvChanged(handleEnvChanged);
    }
  }, [editor]);

  let enabled = false;
  if (environment) {
    if (environment.args.visible !== "") enabled = true;
  }
  
  return (
    <>
      {environment &&
        <>
          <Environment 
            resolution={512}
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
            frames={(degraded && lightformers.length > 0) ? 1 : Infinity}
          >
            {lightformers.map((om) => {
              return <LightFormer om={om} key={om.id}/>
            })}
          </Environment>
        </>
      }
      {!environment && lightformers.length > 0 &&
        <>
          <Environment 
            frames={(degraded && lightformers.length > 0) ? 1 : Infinity}
            resolution={512}
          >
            {lightformers.map((om, idx) => {
              return <LightFormer om={om} key={idx}/>
            })}
          </Environment>
        </>
      }
      {/* LightFormerのコントローラは別にもつ */}
      {lightformers.map((om, idx) => {
        return <LightFormerControl om={om} key={idx}/>
      })}
    </>
  )
}

const LightFormerControl = ({ om }) => {
  const editor = useContext(NinjaEditorContext);
  const catchRef = useRef<any>();
  const state = useSnapshot(globalStore);
  const id = om.id;

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
  };

  useEffect(() => {
    if (om.args.position)catchRef.current.position.copy(om.args.position.clone());
    if (om.args.rotation)catchRef.current.rotation.copy(om.args.rotation.clone());
    if (om.args.scale)catchRef.current.scale.copy(om.args.scale.clone());
    if (om.args.lookAt) {
      const newVector = new Vector3().copy(om.args.lookAt);
      catchRef.current.lookAt(newVector);
    }
  }, [om]);

  return (
    <>
      {!state.editorFocus &&
        <PivotControls
          object={(state.currentId == id) ? catchRef : undefined}
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
        onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
        onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
        ref={catchRef}
      >
        <planeBufferGeometry />
        <meshStandardMaterial side={DoubleSide} wireframe={true} color={om.args.color?om.args.color:0x00ff00} visible={true} />
      </mesh>
    </>
  )
}

const LightFormer = ({ om }) => {
  const ref = useRef<any>();
  const editor = useContext(NinjaEditorContext);
  const id = om.id;
  useEffect(() => {
    // const init = () => {
    //   if (ref.current) {
    //     if (om.args.position) ref.current.position.copy(om.args.position.clone());
    //     if (om.args.rotation) ref.current.rotation.copy(om.args.rotation.clone());
    //     if (om.args.scale) ref.current.scale.copy(om.args.scale.clone());
    //     // ref.current.update();
    //   }
    // }
    // init();
    // editor.onOMIdChanged(id, init);
    // return () => {
    //   editor.offOMIdChanged(id, init);
    // }
  }, [om]);
  return (
    <>
    {om.args.isFloat?
      <Float speed={5} floatIntensity={2} rotationIntensity={2}>
        <Lightformer
          ref={ref}
          form={om.args.form}
          intensity={om.args.intensity}
          color={om.args.color}
          position={om.args.position}
          rotation={om.args.rotation}
          scale={om.args.scale}
          onUpdate={(self) => {
            if (om.args.lookAt){
              const newVector = new Vector3().copy(om.args.lookAt);
              self.lookAt(newVector);
            }
          }}
        />
      </Float>
      :
      <>
        <Lightformer
          ref={ref}
          form={om.args.form}
          intensity={om.args.intensity}
          color={om.args.color}
          position={om.args.position}
          rotation={om.args.rotation}
          scale={om.args.scale}
          onUpdate={(self) => {
            if (om.args.lookAt){
              const newVector = new Vector3().copy(om.args.lookAt);
              self.lookAt(newVector);
            }
          }}
        />
      </>
    }
    </>
  )
}