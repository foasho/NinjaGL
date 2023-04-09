import { IObjectManagement } from "@/core/utils/NinjaProps";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { Box3, BoxHelper, Euler, Group, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Vector3, WireframeGeometry } from "three";
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
  const enabledCamera = (trig: boolean) => {
    editor.setEnabledCamera(trig);
  }
  useEffect(() => {
    setStaticOMs(editor.getObjects())
  }, [])
  useFrame(() => {
    if (staticOMs.length !== editor.getObjects().length){
      setStaticOMs(editor.getObjects())
    }
  });
  return (
    <>
      {staticOMs.map(om => {
        if (om.type == "object") {
          return <StaticObject om={om} onStopCamera={enabledCamera} isHelper={true} />
        }
      })}
    </>
  )
}

interface IStaticObject {
  om: IObjectManagement;
  onStopCamera: (value: boolean) => void;
  isHelper: boolean;
}

/**
 * 基本的なオブジェクトのみ
 * @param props 
 * @returns 
 */
const StaticObject = (props: IStaticObject) => {
  const state = useSnapshot(globalStore);
  const itemsRef = useRef([]);
  const object: Object3D = props.om.object;
  object.traverse((node: any) => {
    if (node.isMesh && node instanceof Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  })
  const ref = useRef<Group|Object3D>();
  const editor = useContext(NinjaEditorContext);
  const handleDrag = useRef<boolean>(false);
  const editorData = useRef<{ 
    focus: boolean; 
    position: Vector3, 
    rotation: Euler, 
    scale: Vector3 
  }>({ 
    focus: false, 
    position: new Vector3(), 
    rotation: new Euler(), 
    scale: new Vector3() 
  });
  const id = props.om.id;

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
    globalStore.editorFocus = true;
  }
  const onDragEnd = () => {
  }

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    if (state.pivotControl){
      console.log(position);
      editor.setPosition(id, position);
      editor.setScale(id, scale);
      editor.setRotation(id, rotation);
    }
    globalStore.editorFocus = true;
  }

  const lineSegs = [];
  if (props.om.physics == "along"){
    object.traverse((node) => {
      if (node instanceof Mesh) {
        // nodeの回転率を戻す
        node.updateMatrix();
        node.geometry.applyMatrix4(node.matrix);
        const wire = new WireframeGeometry(node.geometry);
        const colorMat = new LineBasicMaterial({ color: editor.wireFrameColor });
        const lineSeg = new LineSegments(wire, colorMat);
        lineSeg.rotation.copy(editor.getRotation(id));
        lineSeg.position.copy(editor.getPosition(id));
        lineSegs.push(lineSeg);
      }
    });
  }
  else if (props.om.physics == "aabb" && (globalStore.currentId == id)){
  }
  useHelper(((globalStore.currentId == id) && props.om.physics != "none") && ref, BoxHelper);

  useFrame((_, delta) => {
    if (state.editorFocus && ref.current){
      const pos = editor.getPosition(id);
      ref.current.position.copy(pos);
      const rot = editor.getRotation(id);
      ref.current.rotation.copy(rot);
      const sca = editor.getScale(id);
      ref.current.scale.copy(sca);
    }
  });

  return (
    <>
      {!state.editorFocus &&
        <PivotControls 
          object={(globalStore.currentId == id) ? ref : undefined}
          visible={(globalStore.currentId == id)}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        />
      }
      <primitive
        object={object}
        ref={ref}
        onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
        onPointerMissed={(e) => (e.type === 'click' && !handleDrag.current) && (globalStore.init())}
      />
      {props.om.physics == "along" &&
        <>
          {lineSegs.map((lineSeg, index) => {
            return <primitive ref={el => (itemsRef.current[index] = el)} object={lineSeg} />
          })}
        </>
      }
    </>
  )
}