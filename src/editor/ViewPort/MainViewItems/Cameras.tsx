import { IObjectManagement } from "ninja-core";
import { NinjaEditorContext } from "@/editor/NinjaEditorManager";
import { useContext, useEffect, useRef } from "react";
import { PerspectiveCamera, useGLTF, useHelper } from "@react-three/drei";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { CameraHelper, Euler, Vector3, BoxHelper, Mesh, Group, PerspectiveCamera as TPerspectiveCamera } from "three";
import { useFrame } from "@react-three/fiber";

export const Cameras = () => {
  const editor = useContext(NinjaEditorContext);
  const cameras = editor ? editor.getCameras() : null;

  return (
    <>
      {cameras.map((om, idx) => {
        return <Camera om={om} key={idx} />
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
  scene.scale.set(0.33, 0.33, 0.33);

  useHelper((ref), CameraHelper);

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
    const init = () => {
      if (scene && ref.current) {
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

  }, [props.om]);

  return (
    <>
    {scene &&
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
        <primitive 
          ref={catchRef}
          object={scene} 
          onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
          onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
        />
        <PerspectiveCamera
          makeDefault={false}
          ref={ref}
        />
      </>
    }
    </>
  );
}