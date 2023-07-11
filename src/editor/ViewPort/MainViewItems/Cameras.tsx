// @ts-nocheck
import { IObjectManagement } from "@ninjagl/core";
import { NinjaEditorContext } from "@/editor/NinjaEditorManager";
import { useContext, useEffect, useRef, useState } from "react";
import { PerspectiveCamera, useGLTF, useHelper } from "@react-three/drei";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { 
  CameraHelper, 
  Euler, 
  Vector3, 
  BoxHelper, 
  Mesh, 
  Group, 
  PerspectiveCamera as TPerspectiveCamera,
  Camera as ThreeCamera
} from "three";

export const Cameras = () => {
  const editor = useContext(NinjaEditorContext);
  const [cameras, setCameras] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setCameras(editor.getCameras());
    const handleCameraChanged = () => {
      setCameras([...editor.getCameras()]);
    }
    editor.onCameraChanged(handleCameraChanged);
    return () => {
      editor.offCameraChanged(handleCameraChanged);
    }
  }, [editor]);
  return (
    <>
      {cameras.map((om) => {
        return <Camera om={om} key={om.id} />
      })}
    </>
  )
}

interface ICamera {
  om: IObjectManagement;
}
const Camera = (props: ICamera) => {
  const id = props.om.id;
  const editor = useContext(NinjaEditorContext);
  const ref = useRef<TPerspectiveCamera>();
  const catchRef = useRef<any>();
  const state = useSnapshot(globalStore);
  const { scene } = useGLTF("/fileicons/camera.glb");

  useHelper(ref, CameraHelper);
  useHelper(catchRef, BoxHelper);

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
    const cameraDirection = new Vector3();
    ref.current.getWorldDirection(cameraDirection);
    editor.setCameraDirection(id, cameraDirection);
  }

  useEffect(() => {
    const init = () => {
      if (ref.current  && catchRef.current) {
        if (props.om.args.position){
          ref.current.position.copy(props.om.args.position.clone());
          catchRef.current.position.copy(props.om.args.position.clone());
        }
        if (props.om.args.rotation){
          ref.current.rotation.copy(props.om.args.rotation.clone());
          catchRef.current.rotation.copy(props.om.args.rotation.clone());
        }
        if (props.om.args.scale){
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
    }
    init();
    const handleOMIdChanged = () => {
      init();
    }
    editor.onOMIdChanged(id, handleOMIdChanged);
    return () => {
      editor.onOMIdChanged(id, handleOMIdChanged);
    }

  }, [props.om, scene]);

  return (
    <>
    {scene &&
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
        <primitive 
          ref={catchRef}
          object={scene}
          onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
          onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
        />
        <perspectiveCamera
          ref={ref}
          visible={false}
          frustumCulled={true}
        />
      </>
    }
    </>
  );
}