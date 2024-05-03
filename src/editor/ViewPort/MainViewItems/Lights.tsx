import { useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Color, DirectionalLightHelper, Mesh, PointLightHelper, SpotLightHelper } from "three";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

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
  const { onOMIdChanged, offOMIdChanged, pivotRef } = useNinjaEditor();
  const catchRef = useRef<Mesh>(null);
  const ref = useRef<any>();
  const { om } = prop;
  const { camera } = useThree();
  const id = om.id;

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
      if (om.args.mapSizeWidth && om.args.type === "directional") {
        ref.current.shadow.mapSize.width = om.args.mapSizeWidth;
      }
      if (om.args.mapSizeHeight && om.args.type === "directional") {
        ref.current.shadow.mapSize.height = om.args.mapSizeHeight;
      }
      if (om.args.bias) {
        ref.current.shadow.mapSize.bias = om.args.bias;
      }
      if (om.args.normalBias) {
        ref.current.shadow.mapSize.normalBias = om.args.normalBias;
      }
      if (om.args.shadowCameraSize) {
        ref.current.shadow.camera.left = -om.args.shadowCameraSize / 2;
        ref.current.shadow.camera.right = om.args.shadowCameraSize / 2;
        ref.current.shadow.camera.top = om.args.shadowCameraSize / 2;
        ref.current.shadow.camera.bottom = -om.args.shadowCameraSize / 2;
      }
      ref.current.castShadow = !!om.args.castShadow;
      // update light
      ref.current.shadow.map = null; // 既存のシャドウマップを破棄
      ref.current.shadow.needsUpdate = true;

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
      {om.args.type == "spot" && <spotLight ref={ref} castShadow />}
      {om.args.type == "directional" && <directionalLight ref={ref} castShadow />}
      {om.args.type == "point" && <pointLight ref={ref} position={[0, 5, 0]} castShadow />}
      <mesh
        onClick={(e) => {
          if (!editorStore.currentId) e.stopPropagation();
          if (EnableClickTrigger(camera.position.clone(), ref.current!) && editorStore.currentId !== id) {
            pivotRef.current = catchRef.current;
            editorStore.currentId = id;
          }
        }}
        onPointerMissed={(e) => {
          if (e.type === "click" && editorStore.currentId == id) {
            editorStore.init(e);
            e.preventDefault();
          }
        }}
        ref={catchRef}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial wireframe={true} visible={false} color={0x00ff00} />
      </mesh>
    </>
  );
};
