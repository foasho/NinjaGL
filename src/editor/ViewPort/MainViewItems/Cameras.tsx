import { useEffect, useMemo, useRef } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { useGLTF, useHelper } from '@react-three/drei';
import { CameraHelper, Euler, Vector3, PerspectiveCamera as TPerspectiveCamera } from 'three';
import { useSnapshot } from 'valtio';

import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { PivotControls } from './PivoitControl';

export const Cameras = () => {
  const { oms } = useNinjaEditor();
  const cameras = useMemo(() => {
    return oms.filter((om) => {
      return om.type == 'camera';
    });
  }, [oms]);

  return (
    <>
      {cameras.map((om) => {
        return <Camera om={om} key={om.id} />;
      })}
    </>
  );
};

interface ICamera {
  om: IObjectManagement;
}
const Camera = (props: ICamera) => {
  const id = props.om.id;
  const editor = useNinjaEditor();
  const ref = useRef<TPerspectiveCamera>(null);
  const catchRef = useRef<any>();
  const state = useSnapshot(editorStore);
  const { scene } = useGLTF('/fileicons/camera.glb');
  // const cameraHelperRef = useRef<CameraHelper>(null);

  // @ts-ignore
  useHelper(ref, CameraHelper);

  const onDragStart = () => {
    editorStore.pivotControl = true;
  };
  const onDragEnd = () => {};

  const onDrag = (e) => {
    if (!ref.current || !catchRef.current) return;
    if (!editor) return;
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    editorStore.pivotControl = true;
    const cameraDirection = new Vector3();
    ref.current.getWorldDirection(cameraDirection);
    editor.setArg(id, 'cameraDirection', cameraDirection);
  };

  useEffect(() => {
    const init = () => {
      if (ref.current && catchRef.current) {
        if (props.om.args.position) {
          ref.current.position.copy(props.om.args.position.clone());
          catchRef.current.position.copy(props.om.args.position.clone());
        }
        if (props.om.args.rotation) {
          ref.current.rotation.copy(props.om.args.rotation.clone());
          catchRef.current.rotation.copy(props.om.args.rotation.clone());
        }
        if (props.om.args.scale) {
          ref.current.scale.copy(props.om.args.scale.clone());
        }
        if (props.om.args.lookAt) {
          ref.current.lookAt(props.om.args.lookAt.clone());
          catchRef.current.lookAt(props.om.args.lookAt.clone());
        }
        if (props.om.args.fov) {
          ref.current.fov = props.om.args.fov;
        }
        if (props.om.args.near) {
          ref.current.near = props.om.args.near;
        }
        if (props.om.args.far) {
          ref.current.far = props.om.args.far;
        }
        if (props.om.args.aspect) {
          ref.current.aspect = props.om.args.aspect;
        }
      }
    };
    init();
    const handleOMIdChanged = () => {
      init();
    };
    editor.onOMIdChanged(id, handleOMIdChanged);
    return () => {
      editor.onOMIdChanged(id, handleOMIdChanged);
    };
  }, [props.om, scene]);

  return (
    <>
      {scene && (
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
          <group
            ref={catchRef}
            onClick={(e) => (e.stopPropagation(), (editorStore.currentId = id))}
            onPointerMissed={(e) => e.type === 'click' && (editorStore.currentId = null)}
          >
            <primitive object={scene} position={[0, 0, 0.5]} />
          </group>
          <perspectiveCamera
            ref={ref}
            visible={false}
            frustumCulled={true}
            fov={props.om.args.fov ? props.om.args.fov : 50}
            near={props.om.args.near ? props.om.args.near : 0.1}
            far={props.om.args.far ? props.om.args.far : 1000}
          />
        </>
      )}
    </>
  );
};
