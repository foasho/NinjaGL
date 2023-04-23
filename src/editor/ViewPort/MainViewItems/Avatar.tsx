import { useHelper } from "@react-three/drei";
import { BoxHelper, Euler, Matrix4, Object3D, Vector3 } from "three";
import { useState, useEffect, useContext, useRef } from "react";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "ninja-core";
import { PivotControls } from "./PivoitControl";
import { globalStore } from "@/editor/Store";
import { useSnapshot } from "valtio";

/**
 * アバターデータ
 */
export const Avatar = () => {
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const [avatar, setAvatar] = useState<IObjectManagement>(null);
  const id = avatar? avatar.id: null;
  const ref = useRef<any>();
  const [helper, setHelper] = useState<boolean>(true)
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

  useEffect(() => {
    setAvatar(editor.getAvatar());
    const init = () => {
      setAvatar(editor.getAvatar());
    }
    editor.onOMIdChanged(id, init);
    editor.onAvatarChanged(init);
    return () => {
      editor.offOMIdChanged(id, init);
      editor.offAvatarChanged(init);
    }
  }, []);

  // 美しくないので廃止
  // useFrame((_, delta) => {
  //   if (avatar != editor.getAvatar()){
  //     setAvatar(editor.getAvatar());
  //   }
  //   if (ref.current){
  //     ref.current.visible = editor.getVisible(id);
  //   }
  //   if (helper !== editor.getHelper(id)){
  //     setHelper(editor.getHelper(id));
  //   }
  //   if (state.editorFocus){
  //     const pos = editor.getPosition(id);
  //     editorData.current.position = new Vector3().copy(pos);
  //     const rot = editor.getRotation(id);
  //     editorData.current.rotation = new Euler().copy(rot);
  //     const sca = editor.getScale(id);
  //     editorData.current.scale = new Vector3().copy(sca);
  //   }
  // });

  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
    // globalStore.pivotControl = false;
  }

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    globalStore.pivotControl = true;
  }

  useHelper(((globalStore.currentId == id) && helper) && ref, BoxHelper);

  return (
    <>
      {avatar &&
      <>
          {!state.editorFocus &&
            <PivotControls
              object={(globalStore.currentId == id) ? ref : undefined}
              visible={(id==state.currentId)}
              disableAxes={!(id==state.currentId)}
              disableSliders={!(id==state.currentId)}
              disableRotations={!(id==state.currentId)}
              depthTest={false}
              lineWidth={2}
              anchor={[0, 0, 0]}
              onDrag={(e) => onDrag(e)}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
              userData={editorData.current}
            />
          }
          <mesh
            ref={ref}
          >
            <primitive
              object={avatar.object}
              onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
              onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
            />
          </mesh>
      </>
      }
    </>
  )
}