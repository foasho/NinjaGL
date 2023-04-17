import { IObjectManagement } from "@/src/utils/NinjaProps";
import { NinjaEditorContext } from "@/editor/NinjaEditorManager";
import { useContext, useRef } from "react";
import { PerspectiveCamera, useGLTF, useHelper } from "@react-three/drei";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { CameraHelper, Euler, Vector3, BoxHelper } from "three";
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
  const catchRef = useRef<any>();
  const ref = useRef<any>();
  const editor = useContext(NinjaEditorContext);
  const state = useSnapshot(globalStore);
  const { scene } = useGLTF("/fileicons/camera.glb");
  useHelper((globalStore.currentId == id) && (ref), CameraHelper);

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
    catchRef.current.position.copy(position.clone());
    catchRef.current.rotation.copy(rotation.clone());
    catchRef.current.scale.copy(scale.clone());
    globalStore.pivotControl = true;
  }

  useFrame((_, delta) => {
  })

  return (
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
      <mesh
        ref={catchRef}
        onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
        onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
      >
        <primitive object={scene} />
      </mesh>
      <PerspectiveCamera
        ref={ref}
      />
    </>
  );
}