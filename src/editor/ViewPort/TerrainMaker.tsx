import { useEffect, useState, useRef, useLayoutEffect } from 'react';

import { Material } from '@gltf-transform/core';
import { useInputControl, convertObjectToBlob } from '@ninjagl/core';
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera as DPerspectiveCamera,
  SpotLight,
} from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useSession } from 'next-auth/react';
import { Perf } from 'r3f-perf';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
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
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { TerrainInspector } from '../Inspector/TerrainInspector';
import { globalTerrainStore, globalStore } from '../Store/Store';

const TerrainMakeComponent = ({ meshRef, object }) => {
  const [isMounted, setIsMounted] = useState(false);
  const terrainState = useSnapshot(globalTerrainStore);
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
        globalTerrainStore.mode = 'edit';
      } else {
        globalTerrainStore.mode = 'view';
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

  const calculateNewTarget = (camera, currentTarget, distance) => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    const newPosition = new Vector3().addVectors(camera.position, direction.multiplyScalar(distance));
    return newPosition;
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

    // カメラ処理
    if (input.dash && (input.forward || input.backward || input.right || input.left) && cameraRef.current) {
      const st = (terrainState.mapSize / 2) * delta;
      const cameraDirection = new Vector3();
      cameraRef.current.getWorldDirection(cameraDirection);
      const cameraPosition = cameraRef.current.position.clone();

      if (input.forward) {
        cameraPosition.add(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.backward) {
        cameraPosition.sub(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.right) {
        const cameraRight = new Vector3();
        cameraRight.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
      }
      if (input.left) {
        const cameraLeft = new Vector3();
        cameraLeft.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
      }

      cameraRef.current.position.copy(cameraPosition);
      if (ref.current) {
        ref.current.target.copy(cameraPosition.add(cameraDirection));
      }
    } else {
      if (ref.current && cameraRef.current) {
        cameraRef.current.position.copy(ref.current.object.position);
        cameraRef.current.rotation.copy(ref.current.object.rotation);
        cameraRef.current.lookAt(ref.current.target);

        // 新しいターゲット位置を計算して更新します
        const cameraSpeed = 5;
        const distance = cameraSpeed * 10; // カメラとターゲットの一定距離を指定
        const newTarget = calculateNewTarget(cameraRef.current, ref.current.target, distance);
        ref.current.target.copy(newTarget);
      }
    }
  });

  return (
    <>
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      {isMounted && (
        <OrbitControls
          ref={ref}
          args={[cameraRef.current!, gl.domElement]}
          camera={cameraRef.current!}
          makeDefault={true}
          enabled={terrainState.mode === 'view'}
        />
      )}
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
      <SpotLight
        ref={lightRef}
        angle={MathUtils.degToRad(45)}
        color={'#fadcb9'}
        volumetric={false}
        // shadowCameraFov={undefined}
        // shadowCameraLeft={undefined}
        // shadowCameraRight={undefined}
        // shadowCameraTop={undefined}
        // shadowCameraBottom={undefined}
        // shadowCameraNear={undefined}
        // shadowCameraFar={undefined}
        // shadowBias={undefined}
        // shadowMapWidth={undefined}
        // shadowMapHeight={undefined}
      />
      <mesh ref={mouseCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[terrainState.radius]} />
        <meshBasicMaterial transparent={true} opacity={0.3} color={0x000000} />
      </mesh>
      <Perf position={'bottom-right'} />
    </>
  );
};

export const TerrainMakerCanvas = () => {
  const terrainState = useSnapshot(globalTerrainStore);
  const [ready, setReady] = useState(false);
  const state = useSnapshot(globalStore);
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
        globalTerrainStore.type = 'edit';
      }
    } else {
      if (terrainState.type == 'edit') {
        meshRef.current = undefined;
        globalTerrainStore.type = 'create';
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
    const obj3d = new Object3D();
    obj3d.add(meshRef.current.clone());
    const blob = await convertObjectToBlob(obj3d);
    // @ts-ignore
    Swal.fire({
      title: t('inputFileName'),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '実行',
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr: string) => {
        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage(t('leastInput'));
        }
        if (session) {
          const formData = new FormData();
          formData.append('file', blob);
          const keyPath = `users/${b64EncodeUnicode(session.user!.email as string)}/terrains/${inputStr}.ter`;
          formData.append('filePath', keyPath);
          try {
            const response = await fetch('/api/storage/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Error uploading file');
            }
            // @ts-ignore
            Swal.fire({
              title: t('completeSave'),
              text: t('saveSuccess') + `\npersonal/terrains/${inputStr}.ter`,
            });
          } catch (error) {
            console.error('Error:', error.message);
          }
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${inputStr}.ter`;
          link.click();
          link.remove();
        }
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      },
    });
  };

  return (
    <>
      {ready && (
        <>
          <Canvas shadows>
            {globalTerrainStore.type == 'create' && <TerrainMakeComponent meshRef={meshRef} object={undefined} />}
            {globalTerrainStore.type == 'edit' && (
              <TerrainMakeComponent
                meshRef={meshRef}
                object={state.currentId ? editor.getOMById(state.currentId)!.object : undefined}
              />
            )}
            <Environment preset='dawn' background blur={0.7} resolution={512} />
          </Canvas>
          <div>
            <TerrainInspector onSave={onSave} />
          </div>
        </>
      )}
    </>
  );
};
