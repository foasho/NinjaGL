import { Environment, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { Box3, Euler, LineBasicMaterial, LineSegments, MathUtils, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three-stdlib";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "@ninjagl/core";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

/**
 * 地形データの選択
 */
export const Terrain = () => {
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const [terrain, setTerrain] = useState<IObjectManagement>();
  const object = terrain? terrain.object: null;
  const id = terrain? terrain.id: MathUtils.generateUUID();
  const handleDrag = useRef<boolean>(false);
  const [helper, setHelper] = useState<boolean>(true)

  useEffect(() => {
    const newTerrain = editor.getTerrain();
    if (newTerrain !== terrain){
      setTerrain(newTerrain);
    }
  });

  useFrame((_, delta) => {
    if (terrain != editor.getTerrain()){
      setTerrain(editor.getTerrain());
    }
    if (terrain && helper !== editor.getHelper(id)){
      setHelper(editor.getHelper(id));
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
    <group>
      {object &&
        <>
            <PivotControls
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
            />
            <primitive
              object={object}
              // onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
              // onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
            />
        </>
      }
    </group>
  )
}