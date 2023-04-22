import { IObjectManagement } from "ninja-core";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { Box3, BoxHelper, Color, Euler, Group, LineBasicMaterial, LineSegments, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3, WireframeGeometry } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { useHelper } from "@react-three/drei";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";


/**
 * シーン上で構築される基本的なオブジェクト
 * @returns 
 */
export const StaticObjects = () => {
  const editor = useContext(NinjaEditorContext);
  const [staticOMs, setStaticOMs] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setStaticOMs(editor.getObjects());
    const handleObjectChanged = () => {
      setStaticOMs([...editor.getObjects()]);
    }
    editor.onObjectChanged(handleObjectChanged);
    return () => {
      editor.offObjectChanged(handleObjectChanged);
    }
  }, []);
  return (
    <>
      {staticOMs.map((om) => {
        if (om.type == "object") {
          return <StaticObject om={om} key={om.id} />
        }
      })}
    </>
  )
}

const StandardMaterial = new MeshStandardMaterial();

/**
 * 基本的なオブジェクトのみ
 * @param props 
 * @returns 
 */
const StaticObject = ({ om }) => {
  const state = useSnapshot(globalStore);
  const itemsRef = useRef([]);
  const object = om.object;
  object.traverse((node: any) => {
    if (node.isMesh && node instanceof Mesh) {
      node.castShadow = (om.args.castShadow == undefined) ? true : om.args.castShadow;
      node.receiveShadow = (om.args.recieveShadow == undefined) ? true : om.args.recieveShadow;
    }
  })
  const ref = useRef<Group|Object3D|Mesh>();
  const tempMaterialData = useRef<any>();
  const editor = useContext(NinjaEditorContext);
  const id = om.id;

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

  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
  }

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    globalStore.pivotControl = true;
  }

  useEffect(() => {
    const init = () => {
      if (ref.current) {
        ref.current.position.copy(editor.getPosition(id));
        ref.current.rotation.copy(editor.getRotation(id));
        ref.current.scale.copy(editor.getScale(id));
        const materialData = editor.getMaterialData(id);
        if (materialData) {
          ref.current.traverse((node: any) => {
            if (node.isMesh && node instanceof Mesh) {
              node.material = materialData.material;
            }
          })
        }
        if (om.args.defaultAnimation){
          const animation = om.animations.find((anim) => anim.name == om.args.defaultAnimation);
          if (animation && om.mixer){
            om.mixer.clipAction(animation).play();
          }
        }
      }
    }
    init();
    editor.onOMIdChanged(id, init);
    return () => {
      editor.offOMIdChanged(id, init);
    }
  }, []);
  
  // 美しくないので廃止
  // useFrame((_, delta) => {
  //   if (state.currentId == id && state.editorFocus && ref.current){
  //     const pos = editor.getPosition(id);
  //     ref.current.position.copy(pos);
  //     const rot = editor.getRotation(id);
  //     ref.current.rotation.copy(rot);
  //     const sca = editor.getScale(id);
  //     ref.current.scale.copy(sca);
  //     const materialData = editor.getMaterialData(id);
  //     if (materialData && tempMaterialData.current !== materialData) {
  //       tempMaterialData.current = materialData;
  //       ref.current.traverse((node: any) => {
  //         if (node.isMesh && node instanceof Mesh) {
  //           const material = StandardMaterial.clone();
  //           material.color.set(new Color(materialData.value));
  //           node.material = material;
  //         }
  //       })
  //     }

  //   }
  // });

  useHelper(((state.currentId == id) && om.physics == "aabb") && ref, BoxHelper);
  
  useFrame((_, delta) => {
    if (om.args.defaultAnimation && om.mixer){
      if (om.args.animationLoop){
        om.mixer.update(delta);
      }
    }
  });

  return (
    <>
      {!state.editorFocus &&
        <PivotControls 
          object={(state.currentId == id) ? ref : undefined}
          visible={(state.currentId == id)}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        />
      }
        <primitive
          visible={state.hiddenList.indexOf(id) == -1}
          ref={ref}
          onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
          onPointerMissed={(e) => e.type === 'click' && (globalStore.init())}
          object={object}
        />
    </>
  )
}