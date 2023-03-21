import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, GizmoHelper, GizmoViewport, OrbitControls, SpotLight } from "@react-three/drei";
import { useContext, useEffect, useState, useRef } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import {
  Mesh,
  MeshStandardMaterial,
  Intersection,
  Vector3,
  Raycaster,
  Vector2,
  GridHelper,
  SpotLight as SL,
  Color,
  DoubleSide,
  MathUtils,
  Euler,
  SphereGeometry,
  CircleGeometry,
  Face,
  MeshBasicMaterial,
  BufferGeometry,
  ShaderMaterial,
  Matrix4,
  ShaderLib,
  WebGLRenderTarget,
  OrthographicCamera,
  DataTexture,
  RGBFormat,
  FloatType,
  RGBAFormat
} from "three";
import { useInputControl } from "@/engine/Core/InputControls";

const TerrainMakeComponent = () => {
  const editor = useContext(NinjaEditorContext);
  const terrainManager = editor.terrainManager;
  const input = useInputControl("desktop");
  /**
   * 初期値
   */
  const ref = useRef<Mesh>();
  const camRef = useRef<any>();
  const lightRef = useRef<SL>();
  const gridRef = useRef<GridHelper>();
  const matRef = useRef<MeshStandardMaterial>();
  const mouseCircleRef = useRef<Mesh>();
  const raycaster = new Raycaster();
  const { camera, mouse, gl } = useThree();
  camera.position.set(
    terrainManager.mapSize / 2,
    terrainManager.mapSize / 2,
    -terrainManager.mapSize / 2
  );
  terrainManager.camera = camera;
  let isReverse = useRef<boolean>(false);
  let isGrid = false;
  // ブラシ用
  const [renderTarget] = useState(() => new WebGLRenderTarget(terrainManager.mapSize, terrainManager.mapSize));
  const [texture] = useState(() => renderTarget.texture);
  const [brushPosition, setBrushPosition] = useState(new Vector3());
  const [brushColor] = useState(new Color(1, 0, 0));
  const [brushSize] = useState(terrainManager.radius);

  /**
   * 範囲内の頂点を取得
   * @param intersects 
   * @param radius 
   * @returns 
   */
  const getVertexes = (intersects: Intersection[], radius: number): { vertexIndexes: number[], values: number[] } => {
    const nearVertexIntexes: number[] = []; // 範囲内の頂点のIndex
    const values: number[] = [];       // 中心からの距離
    if (intersects.length > 0 && intersects[0].object) {
      const object: Mesh = intersects[0].object as Mesh;
      const geometry = object.geometry;
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
              nearVertexIntexes.push(i / stride);
              values.push(1 - v.distanceToSquared(position) / maxDistance);
            }
          }
        }
      }
    }
    return {
      vertexIndexes: nearVertexIntexes,
      values: values
    };
  }

  /**
   * マウスを動かしたとき
   * @param event 
   * @returns 
   */
  const onMouseMove = (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ref.current);
    if (terrainManager.isMouseDown && terrainManager.mode == "edit") {
      if (terrainManager.brush == "normal" || terrainManager.brush == "flat"){
        const { vertexIndexes, values } = getVertexes(intersects, terrainManager.radius);
        if (intersects.length > 0 && intersects[0]) {
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;
          vertexIndexes.map((index, i) => {
            const value = values[i];
            if (terrainManager.brush == "normal"){
              let position = object.geometry.attributes.position;
              position.setZ(
                index,
                (position.getZ(index) + (terrainManager.power * value * (isReverse.current ? -1 : 1)))
              );
              position.needsUpdate = true;
            }
            else if (terrainManager.brush == "flat") {
              let position = object.geometry.attributes.position;
              position.setZ(
                index,
                intersectPosition.z
              );
              position.needsUpdate = true;
            }
          });
        }
      }
      else if (terrainManager.brush == "paint"){
        console.log("check");
        // getFaces(intersects, terrainManager.radius);
        if (intersects.length > 0 && intersects[0]) {
          const intersectPosition = intersects[0].point;
          setBrushPosition(intersectPosition);
        }
      }
    }
    if (intersects.length > 0 && mouseCircleRef.current){
      const raduis = terrainManager.radius;
      mouseCircleRef.current.geometry = new CircleGeometry(raduis);
      const intersectPosition = intersects[0].point;
      const mouseCirclePos = new Vector3().addVectors(intersectPosition, new Vector3(0, 0.01, 0));
      mouseCircleRef.current.position.copy(mouseCirclePos);
    }
  }

  const onMouseDown = (e) => {
    terrainManager.isMouseDown = true;
  }
  const onMouseUp = () => {
    terrainManager.isMouseDown = false;
    isReverse.current = false;
  }
  const onKeyDown = (event) => {
    if (event.code.toString() == "ShiftLeft") {
      isReverse.current = true;
    }
  }
  const onKeyUp = (event) => {
    if (event.code.toString() == "ShiftLeft") {
      isReverse.current = false;
    }
  }


  useEffect(() => {
    document.addEventListener("pointermove", onMouseMove, false);
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    terrainManager.terrainMesh = ref.current;
    return () => {
      document.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
  }, []);

  useFrame((_, delta) => {
    if (isReverse.current) {
      // const st = 1;
      // var cameraDirection = new Vector3();
      // camera.getWorldDirection(cameraDirection);
      // var cameraPosition = camera.position.clone();
      // if (input.forward) {
      //   cameraPosition.add(cameraDirection.multiplyScalar(st));
      //   camera.position.copy(cameraPosition);
      // }
      // if (input.backward) {
      //   cameraPosition.sub(cameraDirection.multiplyScalar(st));
      //   camera.position.copy(cameraPosition);
      // }
      // if (input.right) {
      //   var cameraRight = new Vector3();
      //   cameraRight.crossVectors(cameraDirection, camera.up).normalize();
      //   cameraPosition.add(cameraRight.multiplyScalar(st));
      //   camera.position.copy(cameraPosition);
      //   var cameraTarget = cameraPosition.clone().add(cameraDirection);
      //   camera.lookAt(cameraTarget); // カメラの注視点を更新
      // }
      // if (input.left) {
      //   var cameraLeft = new Vector3();
      //   cameraLeft.crossVectors(cameraDirection, camera.up).normalize();
      //   cameraPosition.sub(cameraLeft.multiplyScalar(st));
      //   camera.position.copy(cameraPosition);
      //   camera.lookAt(cameraPosition.clone().add(cameraDirection));
      // }
    }
    if (terrainManager.mode == "edit") {
      camRef.current.enabled = false;
    }
    else {
      camRef.current.enabled = true;
    }
    // matRef.current.wireframe = terrainManager.wireFrame;
    // matRef.current.color = new Color(terrainManager.color);
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

    
    if (texture){
      texture.needsUpdate = true;
      gl.setRenderTarget(null);
    }
  });

  return (
    <>
      <OrbitControls 
        makeDefault={true} 
        ref={camRef}
      />
      <axesHelper />
      <gridHelper visible={isGrid} ref={gridRef} args={[terrainManager.mapSize * 2, Number(terrainManager.mapResolution / 2)]} />
      <mesh 
        ref={ref} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[terrainManager.mapSize, terrainManager.mapSize, terrainManager.mapResolution, terrainManager.mapResolution]} />
        <meshStandardMaterial ref={matRef} side={DoubleSide} />
      </mesh>
      <GizmoHelper alignment="top-right" margin={[75, 75]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
      <SpotLight
        ref={lightRef}
        angle={MathUtils.degToRad(45)}
        color={'#fadcb9'}
        volumetric={false}
      />
      <mesh ref={mouseCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleBufferGeometry args={[terrainManager.radius]} />
        <meshBasicMaterial transparent={true} opacity={0.3} color={0x000000} />
      </mesh>
    </>
  )
}

const TerrainMakerCanvas = () => {
  return (
    <Canvas shadows>
      <Environment preset="dawn" background blur={0.7} resolution={512}>
      </Environment>
      <TerrainMakeComponent />
    </Canvas>
  )
}

export const TerrainMaker = () => {
  const editor = useContext(NinjaEditorContext);
  const terrainManager = editor.terrainManager;
  return (
    <>
      {terrainManager &&
        <>
          <div style={{ height: "100%", width: "100%" }} onContextMenu={() => { return false }}>
            <TerrainMakerCanvas />
          </div>
        </>
      }
    </>
  )
}