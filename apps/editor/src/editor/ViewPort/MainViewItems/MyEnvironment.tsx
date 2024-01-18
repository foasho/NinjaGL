import { useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { DoubleSide, Euler, Matrix4, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

/**
 * Environment
 * @returns
 */
export const MyEnviroment = () => {
  const [degraded, degrade] = useState(false);
  const [environment, setEnvironment] = useState<any>();
  const [lightformers, setLightformers] = useState<any[]>([]);
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  useEffect(() => {
    const update = () => {
      const _envs = oms.current.find((om) => om.type == "environment");
      const _lfs = oms.current.filter((om) => om.type == "lightformer");
      setEnvironment(_envs);
      setLightformers(_lfs);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);

  let enabled = false;
  if (environment) {
    if (environment.args.visible !== "") enabled = true;
  }

  return (
    <>
      {environment && (
        <>
          <Environment
            resolution={512}
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
            frames={degraded && lightformers.length > 0 ? 1 : Infinity}
          >
            {lightformers.map((om) => {
              return <LightFormer {...om} key={om.id} />;
            })}
          </Environment>
        </>
      )}
      {!environment && lightformers.length > 0 && (
        <>
          <Environment frames={degraded && lightformers.length > 0 ? 1 : Infinity} resolution={512}>
            {lightformers.map((om, idx) => {
              return <LightFormer {...om} key={idx} />;
            })}
          </Environment>
        </>
      )}
      {/* LightFormerのコントローラは別にもつ */}
      {lightformers.map((om, idx) => {
        return <LightFormerControl {...om} key={idx} />;
      })}
    </>
  );
};

const LightFormerControl = ({ ...om }: IObjectManagement) => {
  const editor = useNinjaEditor();
  const catchRef = useRef<any>();
  const state = useSnapshot(editorStore);
  const id = om.id;

  const onDragStart = () => {
    editorStore.pivotControl = true;
  };
  const onDragEnd = () => {};

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    editorStore.pivotControl = true;
  };

  useEffect(() => {
    if (om.args.position) catchRef.current.position.copy(om.args.position.clone());
    if (om.args.rotation) catchRef.current.rotation.copy(om.args.rotation.clone());
    if (om.args.scale) catchRef.current.scale.copy(om.args.scale.clone());
    if (om.args.lookAt) {
      const newVector = new Vector3().copy(om.args.lookAt);
      catchRef.current.lookAt(newVector);
    }
  }, [om]);

  return (
    <>
      {!state.editorFocus && (
        <PivotControls
          object={state.currentId == id ? catchRef : undefined}
          visible={state.currentId == id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        />
      )}
      <mesh
        onClick={(e) => (e.stopPropagation(), (editorStore.currentId = id))}
        onPointerMissed={(e) => e.type === "click" && (editorStore.currentId = null)}
        ref={catchRef}
      >
        <planeGeometry />
        <meshStandardMaterial
          side={DoubleSide}
          wireframe={true}
          color={om.args.color ? om.args.color : 0x00ff00}
          visible={true}
        />
      </mesh>
    </>
  );
};

const LightFormer = ({ ...om }: IObjectManagement) => {
  const ref = useRef<any>();
  const editor = useNinjaEditor();
  const id = om.id;
  useEffect(() => {
    const init = () => {
      if (ref.current) {
        if (om.args.position) ref.current.position.copy(om.args.position.clone());
        if (om.args.rotation) ref.current.rotation.copy(om.args.rotation.clone());
        if (om.args.scale) ref.current.scale.copy(om.args.scale.clone());
        // ref.current.update();
      }
    };
    init();
    editor.onOMIdChanged(id, init);
    return () => {
      editor.offOMIdChanged(id, init);
    };
  }, [om]);
  return (
    <>
      {om.args.isFloat ? (
        <Float speed={5} floatIntensity={2} rotationIntensity={2}>
          <Lightformer
            ref={ref}
            form={om.args.form}
            intensity={om.args.intensity}
            color={om.args.color}
            position={om.args.position}
            rotation={om.args.rotation}
            scale={om.args.scale as any}
            onUpdate={(self) => {
              if (om.args.lookAt) {
                const newVector = new Vector3().copy(om.args.lookAt);
                self.lookAt(newVector);
              }
            }}
          />
        </Float>
      ) : (
        <>
          <Lightformer
            ref={ref}
            form={om.args.form}
            intensity={om.args.intensity}
            color={om.args.color}
            position={om.args.position}
            rotation={om.args.rotation}
            scale={om.args.scale as any}
            onUpdate={(self) => {
              if (om.args.lookAt) {
                const newVector = new Vector3().copy(om.args.lookAt);
                self.lookAt(newVector);
              }
            }}
          />
        </>
      )}
    </>
  );
};
