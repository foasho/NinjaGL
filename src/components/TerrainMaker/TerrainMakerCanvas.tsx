import { Environment, OrbitControls, SpotLight } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import { DoubleSide, Mesh, Vector2, Raycaster, Vector3, MeshStandardMaterial, MathUtils, Intersection, SpotLight as SL, Color, GridHelper } from "three";
import { TerrainMakerContext } from "./TerrainMakerManager";

const TerrainMakeComponent = () => {
  /**
   * 初期値
   */
  const terrainManager = useContext(TerrainMakerContext);
  const ref = useRef<Mesh>();
  const camRef = useRef<any>();
  const matRef = useRef<MeshStandardMaterial>();
  const lightRef = useRef<SL>();
  const gridRef = useRef<GridHelper>();
  const mouse = new Vector2();
  const raycaster = new Raycaster();
  const { camera } = useThree();
  camera.position.set(
    terrainManager.mapSize / 2,
    terrainManager.mapSize / 2,
    -terrainManager.mapSize / 2
  );
  terrainManager.camera = camera;
  let isReverse = false;
  let isGrid = false;

  const getVertexes = (intersects: Intersection[], radius: number): { indexes: number[], values: number[] } => {
    const nearVertices: number[] = []; // 範囲内の頂点
    const values: number[] = [];       // 中心からの距離
    if (intersects.length > 0 && intersects[0].object) {
      const object: Mesh = intersects[0].object as Mesh;
      const geometry = object.geometry;
      const vertices = geometry.attributes.position.array;
      const stride = geometry.attributes.position.itemSize;
      let position: Vector3;
      if (intersects.length > 0) {
        position = intersects[0].point;
        if (position) {
          const vertices = geometry.attributes.position.array;
          const maxDistance = radius * radius; // 2乗距離
          for (let i = 0; i < vertices.length; i += stride) {
            const v = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            // 回転を考慮する
            v.applyMatrix4(object.matrixWorld);
            if (v.distanceToSquared(position) < maxDistance) {
              nearVertices.push(i / stride);
              values.push(1 - v.distanceToSquared(position) / maxDistance);
            }
          }
        }
      }
    }
    return {
      indexes: nearVertices,
      values: values
    };
  }
  const onMouseMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (terrainManager.isMouseDown && terrainManager.mode == "edit") {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ref.current);
      const { indexes, values } = getVertexes(intersects, terrainManager.radius);
      if (intersects.length > 0 && intersects[0]) {
        const object: Mesh = intersects[0].object as Mesh;
        if (!object) return;
        indexes.map((index, i) => {
          const value = values[i];
          let position = object.geometry.attributes.position;
          position.setZ(
            index,
            (position.getZ(index) + (terrainManager.power * value * (isReverse ? -1 : 1)))
          );
          position.needsUpdate = true;
        });
      }
    }
  }

  const onMouseDown = (e) => {
    terrainManager.isMouseDown = true;
  }
  const onMouseUp = () => {
    terrainManager.isMouseDown = false;
    isReverse = false;
  }
  const onKeyDown = (event) => {
    if (event.code.toString() == "ShiftLeft") {
      isReverse = true;
    }
  }
  const onKeyUp = (event) => {
    if (event.code.toString() == "ShiftLeft") {
      isReverse = false;
    }
  }


  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    terrainManager.terrainMesh = ref.current;
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
  }, []);

  useFrame((_, delta) => {
    if (terrainManager.mode == "edit") {
      camRef.current.enabled = false;
    }
    else {
      camRef.current.enabled = true;
    }
    matRef.current.wireframe = terrainManager.wireFrame;
    matRef.current.color = new Color(terrainManager.color);
    lightRef.current.position.set(
      -terrainManager.mapSize / 1.6,
      terrainManager.mapSize / 1.6,
      -terrainManager.mapSize / 2
    );
    lightRef.current.distance = terrainManager.mapSize * 2;
    if (lightRef.current.distance <= 100) {
      lightRef.current.intensity = lightRef.current.distance / 4;
    }
    else if (lightRef.current.distance > 100) {
      lightRef.current.intensity = lightRef.current.distance / 16;
    }
    else if (lightRef.current.distance > 300) {
      lightRef.current.intensity = lightRef.current.distance / 24;
    }
    else {
      lightRef.current.intensity = lightRef.current.distance / 32;
    }
  })

  return (
    <>
      <OrbitControls makeDefault={true} ref={camRef} />
      <axesHelper />
      <gridHelper visible={isGrid} ref={gridRef} args={[terrainManager.mapSize * 2, Number(terrainManager.mapResolution / 2)]} />
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[terrainManager.mapSize, terrainManager.mapSize, terrainManager.mapResolution, terrainManager.mapResolution]} />
        <meshStandardMaterial ref={matRef} wireframe={true} side={DoubleSide} />
      </mesh>

      <SpotLight
        ref={lightRef}
        angle={MathUtils.degToRad(45)}
        color={'#fadcb9'}
        volumetric={false}
      />
    </>
  )
}

export const TerrainMakerCanvas = () => {
  return (
    <>
      <Canvas shadows>
        <Environment preset="dawn" background blur={0.7} resolution={512}>
        </Environment>
        <TerrainMakeComponent />
      </Canvas>
    </>
  )
}