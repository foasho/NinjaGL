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
  GridHelper,
  SpotLight as SL,
  Color,
  DoubleSide,
  MathUtils,
  CircleGeometry,
  WebGLRenderTarget,
  BufferAttribute,
  GLBufferAttribute,
  Material
} from "three";
import { useInputControl } from "@/core/utils/InputControls";
import { CameraControl } from "./MainViewer";
import { useSnapshot } from "valtio";
import { globalTerrainStore } from "../Store";
import { Perf } from "r3f-perf";

const TerrainMakeComponent = () => {
  const terrainState = useSnapshot(globalTerrainStore);
  /**
   * 初期値
   */
  const ref = useRef<Mesh>();
  const lightRef = useRef<SL>();
  const gridRef = useRef<GridHelper>();
  const matRef = useRef<MeshStandardMaterial>();
  const mouseCircleRef = useRef<Mesh>();
  const raycaster = new Raycaster();
  const { mouse, gl, camera } = useThree();
  const input = useInputControl("desktop");
  const isMouseDown = useRef(false);
  // ブラシ用
  const [brushPosition, setBrushPosition] = useState(new Vector3());
  const [brushColor] = useState(new Color(1, 0, 0));
  const [brushSize] = useState(terrainState.radius);

  useEffect(() => {
    console.log("TerrainMakeComponent");
  }, [
    terrainState.type,
    terrainState.radius, 
    terrainState.power, 
    terrainState.mode, 
    terrainState.wireFrame,
    terrainState.brush,
    terrainState.mapSize,
    terrainState.mapResolution,
    terrainState.color,
  ]);

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
          if (geometry.attributes.position instanceof GLBufferAttribute) return;
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
    if (!ref.current) {
      return;
    };
    const intersects = raycaster.intersectObject(ref.current);
    if (terrainState.isMouseDown && terrainState.mode == "edit") {
      if (terrainState.brush == "normal" || terrainState.brush == "flat"){
        const { vertexIndexes, values } = getVertexes(intersects, terrainState.radius);
        if (intersects.length > 0 && intersects[0]) {
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;
          vertexIndexes.map((index, i) => {
            const value = values[i];
            if (terrainState.brush == "normal"){
              let position = object.geometry.attributes.position;
              if (position instanceof GLBufferAttribute) return;
              if (terrainState.type == "create"){
                position.setZ(
                  index,
                  (position.getZ(index) + (terrainState.power * value * (input.shift ? -1 : 1)))
                );
              }
              else {
                position.setY(
                  index,
                  (position.getY(index) + (terrainState.power * value * (input.shift ? -1 : 1)))
                );
              }
              position.needsUpdate = true;
            }
            else if (terrainState.brush == "flat") {
              let position = object.geometry.attributes.position;
              if (position instanceof GLBufferAttribute) return;
              if (terrainState.type == "create"){
                position.setZ(
                  index,
                  intersectPosition.z
                );
              }
              else {
                position.setY(
                  index,
                  intersectPosition.y
                );
              }
              position.needsUpdate = true;
            }
          });
        }
      }
      else if (terrainState.brush == "paint"){
        if (intersects.length > 0 && intersects[0]) {
          const radius = terrainState.radius;
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;
          const cloneGeometry = object.geometry.clone();
          if (!cloneGeometry.attributes.color) {
            const count = cloneGeometry.attributes.position.count;
            const buffer = new BufferAttribute( new Float32Array( count * 3 ), 3 );
            cloneGeometry.setAttribute("color", buffer);
          }
          if (
            cloneGeometry.attributes.color instanceof GLBufferAttribute ||
            cloneGeometry.attributes.position instanceof GLBufferAttribute
          ) return;
          const numVertices = cloneGeometry.attributes.color.array;
          let colors = new Float32Array(numVertices);
          const color = new Color(terrainState.color);
          const vertex = new Vector3();
          const positionArray = Array.from(cloneGeometry.attributes.position.array);
          for (let i = 0; i <= positionArray.length - 3; i += 3) {
            vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
            vertex.applyMatrix4(ref.current.matrixWorld); // Consider rotation
            const distance = vertex.distanceTo(intersectPosition);
            if (distance <= radius) {
              colors.set(color.toArray(), i);
            }
          }
          cloneGeometry.setAttribute("color", new BufferAttribute(colors, 3));
          object.geometry.copy(cloneGeometry);
        }
      }
    }
    if (intersects.length > 0 && mouseCircleRef.current){
      const raduis = terrainState.radius;
      mouseCircleRef.current.geometry = new CircleGeometry(raduis);
      const intersectPosition = intersects[0].point;
      const mouseCirclePos = new Vector3().addVectors(intersectPosition, new Vector3(0, 0.01, 0));
      mouseCircleRef.current.position.copy(mouseCirclePos);
    }
  }

  const onMouseDown = (e) => {
    isMouseDown.current = true;
  }
  const onMouseUp = () => {
    isMouseDown.current = false;
  }


  useEffect(() => {
    document.addEventListener("pointermove", onMouseMove, false);
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    // globalTerrainStore.terrainMesh = ref.current;
    return () => {
      document.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }, []);

  useFrame((_, delta) => {
    if (ref.current && matRef.current && lightRef.current) {
      lightRef.current.position.set(
        -terrainState.mapSize / 1.6,
        terrainState.mapSize / 1.6,
        -terrainState.mapSize / 2
      );
      lightRef.current.distance = terrainState.mapSize * 2;
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
      if (matRef.current && matRef.current instanceof MeshStandardMaterial){
        matRef.current.wireframe = terrainState.wireFrame;
      }
    }
  });

  console.log(terrainState);

  return (
    <>
      <OrbitControls />
      {/* <CameraControl cameraSpeed={terrainState.mapSize/2} cameraFar={4000} enable={terrainState.mode == "view"} /> */}
      <axesHelper />
      <gridHelper ref={gridRef} args={[terrainState.mapSize * 2, Number(terrainState.mapResolution / 2)]} />
      
      <mesh 
        ref={ref} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow 
        castShadow
      >
        <planeGeometry 
          args={
            [
              terrainState.mapSize, 
              terrainState.mapSize, 
              terrainState.mapResolution, 
              terrainState.mapResolution
            ]
          }
        />
        <meshStandardMaterial 
          ref={matRef} 
          wireframe={terrainState.wireFrame} 
          side={DoubleSide} 
          vertexColors={true} 
          color={0xffffff} 
        />
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
          <circleBufferGeometry args={[terrainState.radius]} />
          <meshBasicMaterial transparent={true} opacity={0.3} color={0x000000} />
        </mesh>
      <Perf position={"bottom-right"}/>
    </>
  )
}

export const TerrainMakerCanvas = () => {
  return (
    <Canvas shadows>
      <Environment preset="dawn" background blur={0.7} resolution={512}>
      </Environment>
      <TerrainMakeComponent />
    </Canvas>
  )
}