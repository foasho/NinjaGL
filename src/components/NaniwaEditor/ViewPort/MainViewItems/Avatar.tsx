import { Environment, OrbitControls, PivotControls, Sky, useHelper } from "@react-three/drei";
import { Box3, BoxHelper, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NaniwaEditorContext } from "../../NaniwaEditorManager";
import { IObjectManagement } from "@/engine/Core/NaniwaProps";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";

/**
 * アバターデータ
 */
export const Avatar = () => {
  const editor = useContext(NaniwaEditorContext);
  const [avatar, setAvatar] = useState<IObjectManagement>(null);
  const id = avatar? avatar.id: null;
  const [enabled, setEnabled] = useState<boolean>(true)
  const [helper, setHelper] = useState<boolean>(true)

  const onClick = (e, value: boolean) => {
    console.log("Click", value);
    if (value) {
      editor.selectObject(id);
    }
    else {
      editor.unSelectObject(id);
    }
  }

  const lineSegs = [];
  if (avatar && avatar.physics == "along"){
    avatar.object.traverse((node) => {
      if (node instanceof Mesh) {
        // nodeの回転率を戻す
        node.updateMatrix();
        node.geometry.applyMatrix4(node.matrix);
        node.quaternion.copy(new Quaternion().setFromEuler(node.rotation));
        node.rotation.set(0, 0, 0);
        const wire = new WireframeGeometry(node.geometry);
        const colorMat = new LineBasicMaterial({ color: editor.wireFrameColor });
        const lineSeg = new LineSegments(wire, colorMat);
        lineSegs.push(lineSeg);
      }
    });
  }
  else if (avatar && avatar.physics == "aabb"){
    // try{
    //   useHelper(ref, BoxHelper)
    // }
    // catch(e){
    //   console.error("Helperの表示でエラー");
    // }
  }

  useFrame((_, delta) => {
    if (avatar != editor.getAvatar()){
      setAvatar(editor.getAvatar());
      console.log("アバターセットするでー");
    }
    if ( enabled != (editor.getSelectId() == id)){
      setEnabled(editor.getSelectId() == id);
    }
  });

  const onDrag = (e) => {}
  const onDragStart = () => {}
  const onDragEnd = () => {}

  return (
    <>
      {avatar &&
        <PivotControls
          visible={enabled}
          disableAxes={false}
          disableSliders={enabled}
          disableRotations={false}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        >
            <primitive
              object={avatar.object}
              onClick={(e) => {
                onClick(e, true)
              }}
              onPointerMissed={(e) => {
                onClick(e, false)
              }}
            />
        </PivotControls>
      }
      {helper &&
        <>
          {lineSegs.map((lineSeg) => {
            return <primitive object={lineSeg} />
          })}
        </>
      }
    </>
  )
}