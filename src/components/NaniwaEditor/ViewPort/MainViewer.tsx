import { Environment, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";

export const MainViewer = () => {
  const camRef = useRef<any>();
  const editor = useContext(NaniwaEditorContext);
  const [oms, setOMs] = useState<IObjectManagement[]>([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const loader = new GLTFLoader();
    if (!editor.contentsSelect) {
      const file = e.dataTransfer.files[0];
      loader.load(URL.createObjectURL(file), (gltf) => {
        editor.setObjectManagement({
          id: gltf.scene.uuid,
          type: "object",
          visiableType: "auto",
          args: null,
          object: gltf.scene
        });
        setOMs([...editor.oms]);
      });
    }
    else {
      const type = editor.contentsSelectType;
      if (
        type == "gltf" ||
        type == "ter"
      ) {
        loader.load(
          editor.contentsSelectPath,
          async (gltf) => {
            const scene = gltf.scene || gltf.scenes[0] as Object3D;
            scene.traverse((node: Mesh) => {
              if ((node as Mesh).isMesh) {
                if (node.geometry) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              }
            });
            if (type == "gltf") {
              editor.setObjectManagement({
                id: scene.uuid,
                type: "object",
                visiableType: "auto",
                args: {
                  position: new Vector3(0, 0, 0),
                  rotation: new Euler(0, 0, 0)
                },
                object: scene
              });
              setOMs([...editor.oms]);
            }
            if (type == "ter") {
              editor.setObjectManagement({
                id: scene.uuid,
                type: "terrain",
                visiableType: "force",
                args: {},
                object: scene
              });
              setOMs([...editor.oms]);
            }
          },
          (xhr) => { },
          async (err) => {
            console.log("モデル読み込みエラ―");
            console.log(err);
          }
        )
      }
    }
  }

  const enabledCamera = (trig: boolean) => {
    if (camRef.current) {
      camRef.current.enabled = trig;
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <div style={{ height: "100%" }}>
      <Canvas
        id="mainviewcanvas"
        camera={{ position: [-3, 3, -6] }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0}
        />
        {/* <directionalLight /> */}
        <OrbitControls makeDefault={true} ref={camRef} />
        <gridHelper args={[4096, 4096]} />
        {oms.map(om => {
          if (om.type == "object") {
            return <MyObject om={om} onStopCamera={enabledCamera} isHelper={true} />
          }
          else if (om.type == "terrain") {
            return <MyTerrain om={om} isHelper={true} />
          }
        })}
      </Canvas>
    </div>
  )
}

interface IMyObject {
  om: IObjectManagement;
  onStopCamera: (value: boolean) => void;
  isHelper: boolean;
}

/**
 * 基本的なオブジェクトのみ
 * @param props 
 * @returns 
 */
const MyObject = (props: IMyObject) => {
  const itemsRef = useRef([]);
  const object: Object3D = props.om.object;
  object.traverse((node: any) => {
    if (node.isMesh && node instanceof Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  })

  const editor = useContext(NaniwaEditorContext);
  const [visible, setVisible] = useState<boolean>(false);
  const handleDrag = useRef<boolean>(false);
  // UUID
  const uuid = object.uuid;

  // Get Size
  const size = new Box3().setFromObject(object);
  let len = 1;
  if ((size.max.x - size.min.x) > len) {
    len = (size.max.x - size.min.x);
  }
  if ((size.max.y - size.min.y) > len) {
    len = (size.max.y - size.min.y);
  }
  if ((size.max.z - size.min.z) > len) {
    len = (size.max.z - size.min.z);
  }

  const onClick = (e, value: boolean) => {
    if (value) {
      // 選択できるのは１つのみにする
      if (!editor.selectedIds.includes(uuid)) {
        editor.selectObject(uuid);
        setVisible(true);
      }
    }
    else {
      if (e.type == "click" && !handleDrag.current) {
        editor.unSelectObject(uuid);
        setVisible(false);
      }
    }
  }

  const onDragStart = () => {
    handleDrag.current = true;
  }
  const onDragEnd = () => {
    handleDrag.current = false;
  }

  const onDrag = (e) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    if (editor.mode == "position") {
      editor.setPosition(uuid, position);
    }
    else if (editor.mode == "scale") {
      editor.setScale(uuid, scale);
    }
    editor.setRotation(uuid, rotation);
    handleDrag.current = true;
    itemsRef.current.map(item => {
      item.position.copy(position);
      item.rotation.copy(rotation);
      item.scale.copy(scale);
    })
  }

  const lineSegs = [];
  object.traverse((node) => {
    if (node instanceof Mesh) {
      // nodeの回転率を戻す
      node.updateMatrix();
      node.geometry.applyMatrix4(node.matrix);
      const wire = new WireframeGeometry(node.geometry);
      const colorMat = new LineBasicMaterial({ color: editor.wireFrameColor });
      const lineSeg = new LineSegments(wire, colorMat);
      lineSeg.rotation.copy(editor.getRotation(uuid));
      lineSeg.position.copy(editor.getPosition(uuid));
      lineSegs.push(lineSeg);
    }
  });

  return (
    <>
      <PivotControls
        scale={len}
        visible={visible}
        disableAxes={!visible}
        disableSliders={!visible}
        disableRotations={!visible}
        onDrag={(e) => onDrag(e)}
        onDragStart={() => onDragStart()}
        onDragEnd={() => onDragEnd()}
      >
        <primitive
          object={object}
          onClick={(e) => {
            onClick(e, true)
          }}
          onPointerMissed={(e) => {
            onClick(e, false)
          }}
        />
      </PivotControls>
      {lineSegs.map((lineSeg, index) => {
        return <primitive ref={el => (itemsRef.current[index] = el)} object={lineSeg} />
      })}
    </>
  )
}

interface IMyTerrain {
  om: IObjectManagement;
  isHelper: boolean;
}


/**
 * 地形データの選択
 */
const MyTerrain = (props: IMyTerrain) => {
  const object: Object3D = props.om.object;
  const uuid = object.uuid;
  const editor = useContext(NaniwaEditorContext);
  const [enabled, setEnabled] = useState<boolean>(true)
  const [helper, setHelper] = useState<boolean>(true)
  const onClick = (e, value: boolean) => {
    setEnabled(value);
    if (value) {
      editor.selectedIds.push(uuid);
    }
    else {
      editor.unSelectObject(uuid);
    }
  }

  const lineSegs = [];
  object.traverse((node) => {
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


  return (
    <>
      <Selection>
        <EffectComposer enabled={enabled} autoClear={false}>
          <Outline visibleEdgeColor={0x00ff00} hiddenEdgeColor={0x00ff00} edgeStrength={1000} />
        </EffectComposer>
        <Select enabled>
          <primitive
            object={object}
            onClick={(e) => {
              onClick(e, true)
            }}
            onPointerMissed={(e) => {
              onClick(e, false)
            }}
          />
        </Select>
      </Selection>
      {lineSegs.map((lineSeg) => {
        return <primitive object={lineSeg} />
      })}
    </>
  )
}