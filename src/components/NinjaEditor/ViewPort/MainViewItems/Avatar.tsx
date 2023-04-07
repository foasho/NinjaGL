import { Environment, OrbitControls, Sky, useHelper } from "@react-three/drei";
import { Box3, BoxHelper, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "@/core/utils/NinjaProps";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";
import { PivotControls } from "./PivoitControl";

/**
 * アバターデータ
 */
export const Avatar = () => {
  const editor = useContext(NinjaEditorContext);
  const [avatar, setAvatar] = useState<IObjectManagement>(null);
  const id = avatar? avatar.id: null;
  const ref = useRef<Object3D>();
  const [enabled, setEnabled] = useState<boolean>(true)
  const [helper, setHelper] = useState<boolean>(true)
  const handleDrag = useRef<boolean>(false);
  const editorData = useRef<{ 
    focus: boolean; 
    position: Vector3, 
    rotation: Euler, 
    scale: Vector3 
  }>({ 
    focus: false, 
    position: new Vector3(), 
    rotation: new Euler(), 
    scale: new Vector3() 
  });

  const onClick = (e, value: boolean) => {
    if (value) {
      editor.selectObject(id);
    }
    else {
      editor.unSelectObject(id);
    }
  }

  useFrame((_, delta) => {
    if (avatar != editor.getAvatar()){
      setAvatar(editor.getAvatar());
    }
    if ( enabled != (editor.getSelectId() == id)){
      setEnabled(editor.getSelectId() == id);
    }
    if (ref.current){
      ref.current.visible = editor.getVisible(id);
    }
    if (helper !== editor.getHelper(id)){
      setHelper(editor.getHelper(id));
    }
    editorData.current.focus = editor.getFocus(id);
    if (editorData.current.focus){
      const pos = editor.getPosition(id);
      editorData.current.position = new Vector3().copy(pos);
      const rot = editor.getRotation(id);
      editorData.current.rotation = new Euler().copy(rot);
      const sca = editor.getScale(id);
      editorData.current.scale = new Vector3().copy(sca);
    }
  });

  const onDragStart = () => {
    handleDrag.current = true;
  }
  const onDragEnd = () => {
    handleDrag.current = false;
  }

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    handleDrag.current = true;
  }

  useHelper((enabled && helper) && ref, BoxHelper);

  return (
    <>
      {avatar &&
      <>
        <PivotControls
          visible={enabled}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
          userData={editorData.current}
        >
          <primitive
            ref={ref}
            object={avatar.object}
            onClick={(e) => {
              onClick(e, true)
            }}
            onPointerMissed={(e) => {
              onClick(e, false)
            }}
          />
        </PivotControls>
      </>
      }
    </>
  )
}