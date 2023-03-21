import { Environment, OrbitControls, PivotControls, Sky, useHelper } from "@react-three/drei";
import { Box3, BoxHelper, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "@/engine/Core/NinjaProps";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";

/**
 * アバターデータ
 */
export const Avatar = () => {
  const editor = useContext(NinjaEditorContext);
  const [avatar, setAvatar] = useState<IObjectManagement>(null);
  const id = avatar? avatar.id: null;
  const [enabled, setEnabled] = useState<boolean>(true)
  const [helper, setHelper] = useState<boolean>(true)
  const handleDrag = useRef<boolean>(false);

  const onClick = (e, value: boolean) => {
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
    }
    if ( enabled != (editor.getSelectId() == id)){
      setEnabled(editor.getSelectId() == id);
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

  return (
    <>
      {avatar &&
        <PivotControls
          visible={enabled}
          disableAxes={false}
          disableSliders={false}
          disableRotations={false}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        >
            <primitive
              object={avatar.object}
              // onClick={(e) => {
              //   onClick(e, true)
              // }}
              // onPointerMissed={(e) => {
              //   onClick(e, false)
              // }}
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