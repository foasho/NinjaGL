import { Environment, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "@/core/utils/NinjaProps";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";

/**
 * 地形データの選択
 */
export const Terrain = () => {
  const editor = useContext(NinjaEditorContext);
  const [terrain, setTerrain] = useState<IObjectManagement>(null);
  const object = terrain? terrain.object: null;
  const id = terrain? terrain.id: null;
  const [helper, setHelper] = useState<boolean>(true)

  const lineSegs = [];
  if (object && helper){
    object.traverse((node) => {
      if (node instanceof Mesh) {
        node.receiveShadow = true;
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

  useEffect(() => {
    setTerrain(editor.getTerrain());
  });

  useFrame((_, delta) => {
    if (terrain != editor.getTerrain()){
      setTerrain(editor.getTerrain());
    }
    if (terrain && helper !== editor.getHelper(id)){
      console.log("ちぇっくだよｐん");
      setHelper(editor.getHelper(id));
    }
  });

  return (
    <>
      {object &&
          <primitive
            object={object}
            // pointerEvents="none"
          />
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