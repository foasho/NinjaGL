import { useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { useHelper } from "@react-three/drei";
import { Color, DirectionalLightHelper, Euler, Mesh, PointLightHelper, SpotLightHelper, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

export const MyLights = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [lights, setLights] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _oms = oms.current.filter((om) => om.type == "light");
      if (lights !== _oms) {
        setLights(_oms);
      }
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);

  return (
    <>
      {lights.map((om) => {
        return <MyLight om={om} key={om.id} />;
      })}
    </>
  );
};

interface ILightProps {
  om: IObjectManagement;
}
export const MyLight = (prop: ILightProps) => {
  const state = useSnapshot(editorStore);
  const { setPosition, setRotation, setScale, onOMIdChanged, offOMIdChanged } = useNinjaEditor();
  const catchRef = useRef<Mesh>(null);
  const ref = useRef<any>();
  const { om } = prop;
  const id = om.id;

  const onDragStart = () => {
    editorStore.pivotControl = true;
  };
  const onDragEnd = () => {};

  const onDrag = (e: THREE.Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    setPosition(id, position);
    setScale(id, scale);
    setRotation(id, rotation);
  };

  useEffect(() => {
    const init = () => {
      if (!catchRef.current) return;
      if (om.args.position) {
        ref.current.position.copy(om.args.position.clone());
        catchRef.current.position.copy(ref.current.position.clone());
      }
      if (om.args.rotation) {
        ref.current.rotation.copy(om.args.rotation.clone());
        catchRef.current.rotation.copy(om.args.rotation.clone());
      }
      if (om.args.scale) {
        ref.current.scale.copy(om.args.scale.clone());
        catchRef.current.scale.copy(om.args.scale.clone());
      }
      if (om.args.color) {
        ref.current.color.copy(new Color(om.args.color));
        ref.current.needsUpdate = true;
      }
      // I wanna remove helper
      catchRef.current.updateMatrix();
    };
    init();
    const handleIdChanged = () => {
      init();
    };
    onOMIdChanged(id, handleIdChanged);
    return () => {
      offOMIdChanged(id, handleIdChanged);
    };
  }, [om]);

  let _helperObject: any = DirectionalLightHelper;
  if (om.args.type == "spot") {
    _helperObject = SpotLightHelper;
  } else if (om.args.type == "point") {
    _helperObject = PointLightHelper;
  }

  // @ts-ignore
  useHelper(ref, _helperObject);

  return (
    <>
      {om.args.type == "spot" && (
        <>
          <spotLight ref={ref} castShadow />
        </>
      )}
      {om.args.type == "directional" && (
        <>
          <directionalLight ref={ref} castShadow />
        </>
      )}
      {om.args.type == "point" && (
        <>
          <pointLight ref={ref} position={[0, 5, 0]} castShadow />
        </>
      )}

      {/* ヘルパーはやはり一緒にいれる */}
      {!state.editorFocus && (
        <PivotControls
          // @ts-ignore
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
        onClick={(e) => {
          e.stopPropagation();
          editorStore.currentId = id;
          editorStore.pivotControl = true;
        }}
        onPointerMissed={(e) => {
          if (e.type === "click") {
            editorStore.currentId = null;
            editorStore.pivotControl = false;
          }
        }}
        ref={catchRef}
        // onContextMenu={(e) => {e.stopPropagation()}}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial wireframe={true} visible={false} color={0x00ff00} />
      </mesh>
    </>
  );
};
