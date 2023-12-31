import { useEffect, useState, useRef, useLayoutEffect } from 'react';

import { Material } from '@gltf-transform/core';
import { useInputControl } from '@ninjagl/core';
import { Environment, GizmoHelper, GizmoViewport, SpotLight } from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
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
  BufferAttribute,
  GLBufferAttribute,
  Object3D,
  PerspectiveCamera,
  Quaternion,
} from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { b64EncodeUnicode } from '@/commons/functional';
import { TerrainInspector } from '@/editor/Inspector/TerrainInspector';
import { landScapeStore, editorStore } from '@/editor/Store/Store';
import { TerrainDomTunnel } from '@/helpers/LandScapeTunnel';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

const TerrainMakeCanvas = ({ meshRef, object }) => {
  const [isMounted, setIsMounted] = useState(false);
  const terrainState = useSnapshot(landScapeStore);
  /**
   * 初期値
   */
  const lightRef = useRef<SL>(null);
  const gridRef = useRef<GridHelper>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const mouseCircleRef = useRef<Mesh>(null);
  const raycaster = new Raycaster();
  const { mouse, gl, camera } = useThree();
  const { input } = useInputControl({});
  const isMouseDown = useRef(false);
  const isReverse = useRef(false);
  // // ブラシ用
  // const [brushPosition, setBrushPosition] = useState(new Vector3());
  // const [brushColor] = useState(new Color(1, 0, 0));
  // const [brushSize] = useState(terrainState.radius);

  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);

  /**
   * キーボード操作
   * @param event
   */
  const keyDown = (event: KeyboardEvent) => {
    if (event.code.toString() == 'KeyE') {
      if (terrainState.mode == 'view') {
        landScapeStore.mode = 'edit';
      } else {
        landScapeStore.mode = 'view';
      }
    }
    if (
      event.code.toString() == 'ShiftLeft' ||
      event.code.toString() == 'ShiftRight' ||
      event.code.toString() == 'KeyR' ||
      event.code.toString() == 'Shift'
    ) {
      isReverse.current = true;
    }
  };
  const keyUp = (event: KeyboardEvent) => {
    if (
      event.code.toString() == 'ShiftLeft' ||
      event.code.toString() == 'ShiftRight' ||
      event.code.toString() == 'KeyR' ||
      event.code.toString() == 'Shift'
    ) {
      isReverse.current = false;
    }
  };

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      const initCameraPosition = new Vector3(
        -terrainState.mapSize / 3,
        terrainState.mapSize / 2,
        -terrainState.mapSize,
      );
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
    }
  }, [terrainState.mapSize, terrainState.type]);

  useEffect(() => {
    if (terrainState.type == 'edit' && object) {
      // 回転があれば、考慮する
      if (object.rotation) {
        const q = new Quaternion().setFromEuler(object.rotation);
        object.applyQuaternion(q);
        object.rotation.set(0, 0, 0);
      }
      meshRef.current = object;
    }
    if (cameraRef && cameraRef.current) {
      camera.far = terrainState.mapSize * 3;
      cameraRef.current.far = camera.far;
    }
  }, [terrainState.mapSize, terrainState.type]);

  useEffect(() => {
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    document.addEventListener('pointermove', onMouseMove, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    return () => {
      document.removeEventListener('pointermove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
    };
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

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  /**
   * 範囲内の頂点を取得
   * @param intersects
   * @param radius
   * @returns
   */
  const getVertexes = (intersects: Intersection[], radius: number): { vertexIndexes: number[]; values: number[] } => {
    const nearVertexIntexes: number[] = []; // 範囲内の頂点のIndex
    const values: number[] = []; // 中心からの距離
    if (intersects.length > 0 && intersects[0].object) {
      const object: Mesh = intersects[0].object as Mesh;
      const geometry = object.geometry;
      const stride = geometry.attributes.position.itemSize;
      let position: Vector3;
      if (intersects.length > 0) {
        position = intersects[0].point;
        if (position) {
          if (geometry.attributes.position instanceof GLBufferAttribute)
            return {
              vertexIndexes: [],
              values: [],
            };
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
      values: values,
    };
  };

  /**
   * マウスを動かしたとき
   * @param event
   * @returns
   */
  const onMouseMove = () => {
    if (!meshRef.current || !cameraRef.current) {
      return;
    }
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (isMouseDown.current && terrainState.mode == 'edit') {
      if (terrainState.brush == 'normal' || terrainState.brush == 'flat') {
        const { vertexIndexes, values } = getVertexes(intersects, terrainState.radius);
        if (intersects.length > 0 && intersects[0]) {
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;
          vertexIndexes.map((index, i) => {
            const value = values[i];
            if (terrainState.brush == 'normal') {
              let position = object.geometry.attributes.position;
              if (position instanceof GLBufferAttribute) return;
              if (terrainState.type == 'create') {
                position.setZ(index, position.getZ(index) + terrainState.power * value * (isReverse.current ? -1 : 1));
              } else {
                position.setY(index, position.getY(index) + terrainState.power * value * (isReverse.current ? -1 : 1));
              }
              position.needsUpdate = true;
            } else if (terrainState.brush == 'flat') {
              let position = object.geometry.attributes.position;
              if (position instanceof GLBufferAttribute) return;
              if (terrainState.type == 'create') {
                position.setZ(index, intersectPosition.z);
              } else {
                position.setY(index, intersectPosition.y);
              }
              position.needsUpdate = true;
            }
          });
        }
      } else if (terrainState.brush == 'paint') {
        if (intersects.length > 0 && intersects[0]) {
          if (terrainState.type == 'create') {
            const radius = terrainState.radius;
            const intersectPosition = intersects[0].point;
            const object: Mesh = intersects[0].object as Mesh;
            if (!object) return;
            const cloneGeometry = object.geometry.clone();
            if (!cloneGeometry.attributes.color) {
              const count = cloneGeometry.attributes.position.count;
              const buffer = new BufferAttribute(new Float32Array(count * 3), 3);
              cloneGeometry.setAttribute('color', buffer);
            }
            if (
              cloneGeometry.attributes.color instanceof GLBufferAttribute ||
              cloneGeometry.attributes.position instanceof GLBufferAttribute
            )
              return;
            const numVertices = cloneGeometry.attributes.color.array;
            let colors = new Float32Array(numVertices);
            const color = new Color(terrainState.color);
            const vertex = new Vector3();
            const positionArray = Array.from(cloneGeometry.attributes.position.array);
            for (let i = 0; i <= positionArray.length - 3; i += 3) {
              vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
              if (terrainState.type == 'create') vertex.applyMatrix4(meshRef.current.matrixWorld); // Consider rotation
              const distance = vertex.distanceTo(intersectPosition);
              if (distance <= radius) {
                colors.set(color.toArray(), i);
              }
            }
            cloneGeometry.setAttribute('color', new BufferAttribute(colors, 3));
            object.geometry.copy(cloneGeometry);
          } else {
            const radius = terrainState.radius;
            const intersectPosition = intersects[0].point;
            const object: Mesh = intersects[0].object as Mesh;
            if (!object) return;

            object.traverse((node: Object3D) => {
              if (node instanceof Mesh && node.isMesh) {
                if (node.geometry) {
                  const geometry = node.geometry;

                  if (!geometry.attributes.color) {
                    const count = geometry.attributes.position.count;
                    const buffer = new BufferAttribute(new Float32Array(count * 3), 3);
                    geometry.setAttribute('color', buffer);
                  }

                  const numVertices = geometry.attributes.color.array;
                  let colors = new Float32Array(numVertices);
                  let originalColors = Array.from(geometry.attributes.color.array) as number[];

                  const color = new Color(terrainState.color);
                  const vertex = new Vector3();
                  const positionArray = Array.from(geometry.attributes.position.array) as number[];

                  for (let i = 0; i <= positionArray.length - 3; i += 3) {
                    vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
                    vertex.applyMatrix4(meshRef.current.matrixWorld);
                    const distance = vertex.distanceTo(intersectPosition);

                    if (distance <= radius) {
                      const blendedColor = new Color()
                        .fromArray(originalColors.slice(i, i + 3))
                        .lerp(color, 1 - distance / radius);
                      colors.set(blendedColor.toArray(), i);
                    } else {
                      colors.set(originalColors.slice(i, i + 3), i);
                    }
                  }

                  geometry.setAttribute('color', new BufferAttribute(colors, 3));
                  const newMaterial = node.material.clone() as MeshStandardMaterial;
                  newMaterial.vertexColors = true;
                  newMaterial.color.set(0xffffff); // Set material color to white
                  node.material = newMaterial;
                }
              }
            });
          }
        }
      }
    }
    // Mouse circle
    if (intersects.length > 0 && mouseCircleRef.current) {
      const raduis = terrainState.radius;
      mouseCircleRef.current.geometry = new CircleGeometry(raduis);
      const intersectPosition = intersects[0].point;
      const mouseCirclePos = new Vector3().addVectors(intersectPosition, new Vector3(0, 0.01, 0));
      mouseCircleRef.current.position.copy(mouseCirclePos);
    }
  };

  const onMouseDown = () => {
    isMouseDown.current = true;
  };
  const onMouseUp = () => {
    isMouseDown.current = false;
  };

  useFrame((_, delta) => {
    if (meshRef.current && matRef.current && lightRef.current) {
      lightRef.current.position.set(-terrainState.mapSize / 1.6, terrainState.mapSize / 1.6, -terrainState.mapSize / 2);
      lightRef.current.distance = terrainState.mapSize * 2;
      if (lightRef.current.distance <= 100) {
        lightRef.current.intensity = lightRef.current.distance / 4;
      } else if (lightRef.current.distance > 100) {
        lightRef.current.intensity = lightRef.current.distance / 16;
      } else if (lightRef.current.distance > 300) {
        lightRef.current.intensity = lightRef.current.distance / 24;
      } else {
        lightRef.current.intensity = lightRef.current.distance / 32;
      }
      if (terrainState.type == 'create' && matRef.current && matRef.current instanceof MeshStandardMaterial) {
        matRef.current.wireframe = terrainState.wireFrame;
      }
    }
  });

  return (
    <>
      <axesHelper />
      <gridHelper ref={gridRef} args={[terrainState.mapSize * 2, Number(terrainState.mapResolution / 2)]} />
      {terrainState.type == 'create' ? (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <planeGeometry
            args={[terrainState.mapSize, terrainState.mapSize, terrainState.mapResolution, terrainState.mapResolution]}
          />
          <meshStandardMaterial
            ref={matRef}
            wireframe={terrainState.wireFrame}
            side={DoubleSide}
            vertexColors={true}
            color={0xffffff}
          />
        </mesh>
      ) : (
        <>
          {meshRef && meshRef.current && (
            <>
              <primitive object={meshRef.current} receiveShadow castShadow />
            </>
          )}
        </>
      )}

      <GizmoHelper alignment='top-right' margin={[75, 75]}>
        <GizmoViewport labelColor='white' axisHeadScale={1} />
      </GizmoHelper>
      <SpotLight ref={lightRef} angle={MathUtils.degToRad(45)} color={'#fadcb9'} volumetric={false} />
      <mesh ref={mouseCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[terrainState.radius]} />
        <meshBasicMaterial transparent={true} opacity={0.3} color={0x000000} />
      </mesh>
    </>
  );
};

export const TerrainMakerCanvas = () => {
  const terrainState = useSnapshot(landScapeStore);
  const [ready, setReady] = useState(false);
  const state = useSnapshot(editorStore);
  const editor = useNinjaEditor();
  const meshRef = useRef<Mesh>();
  // const [type, setType] = useState<"create" | "edit">("create");
  const { data: session } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (state.currentId) {
      const om = editor.getOMById(state.currentId);
      if (om && om.type == 'terrain') {
        if (meshRef.current) {
          if (meshRef.current.geometry) {
            meshRef.current.geometry.dispose();
          }
          if (meshRef.current.material) {
            if (meshRef.current.material instanceof Material) {
              (meshRef.current.material as Material).dispose();
            } else if (meshRef.current.material instanceof Array) {
              meshRef.current.material.forEach((m) => {
                if (m instanceof Material) {
                  m.dispose();
                }
              });
            }
          }
          meshRef.current = undefined;
        }
        landScapeStore.type = 'edit';
      }
    } else {
      if (terrainState.type == 'edit') {
        meshRef.current = undefined;
        landScapeStore.type = 'create';
      }
    }
    setReady(true);
  }, [state.currentId]);

  useEffect(() => {
    terrainState.init();
  }, []);

  /**
   * 地形データを送信/保存する
   */
  const onSave = async () => {
    if (!meshRef.current) return;
    if (!session) return;
    const saveDir = `users/${b64EncodeUnicode(session.user!.email as string)}/terrains`;
  };

  return (
    <>
      {ready && (
        <>
          <Canvas shadows>
            {landScapeStore.type == 'create' && <TerrainMakeCanvas meshRef={meshRef} object={undefined} />}
            {landScapeStore.type == 'edit' && (
              <TerrainMakeCanvas
                meshRef={meshRef}
                object={state.currentId ? editor.getOMById(state.currentId)!.object : undefined}
              />
            )}
            <Environment preset='dawn' background blur={0.7} resolution={512} />
          </Canvas>
          <div>
            <TerrainDomTunnel.Out />
            <TerrainInspector onSave={onSave} />
          </div>
        </>
      )}
    </>
  );
};