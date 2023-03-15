import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react"
import { Box3, BoxHelper, Euler, LineBasicMaterial, LineSegments, Mesh, Object3D, Vector3, WireframeGeometry } from "three";
import { NaniwaEditorContext } from "../../NaniwaEditorManager";
import { PivotControls, useHelper } from "@react-three/drei";


/**
 * シーン上で構築される基本的なオブジェクト
 * @returns 
 */
export const StaticObjects = () => {
  const editor = useContext(NaniwaEditorContext);
  const [staticOMs, setStaticOMs] = useState<IObjectManagement[]>([]);
  const enabledCamera = (trig: boolean) => {
    editor.setEnabledCamera(trig);
  }
  useEffect(() => {
    setStaticOMs(editor.getStaticObjects())
  }, [])
  useFrame(() => {
    if (staticOMs.length !== editor.getStaticObjects().length){
      setStaticOMs(editor.getStaticObjects())
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
  const itemsRef = useRef([]);
  const pivotRef = useRef<any>();
  const object: Object3D = props.om.object;
  object.traverse((node: any) => {
    if (node.isMesh && node instanceof Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  })
  const ref = useRef();
  const editor = useContext(NaniwaEditorContext);
  const [visible, setVisible] = useState<boolean>(false);
  const handleDrag = useRef<boolean>(false);
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

  const onClick = (e, value: boolean) => {
    if (value) {
      // 選択できるのは１つのみにする
      if (editor.selectedId != id) {
        editor.selectObject(id);
        setVisible(true);
      }
    }
    else {
      if (e.type == "click" && !handleDrag.current) {
        editor.unSelectObject(id);
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
      editor.setPosition(id, position);
    }
    else if (editor.mode == "scale") {
      editor.setScale(id, scale);
    }
    editor.setRotation(id, rotation);
    handleDrag.current = true;
    itemsRef.current.map(item => {
      item.position.copy(position);
      item.rotation.copy(rotation);
      item.scale.copy(scale);
    })
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
  else if (props.om.physics == "aabb"){
    useHelper(ref, BoxHelper);
  }

  useFrame((_, delta) => {
    const isNowSelect = (editor.getSelectOM() == props.om)?true: false;
    if (visible != isNowSelect){
      setVisible(isNowSelect);
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
          ref={ref}
          onClick={(e) => {
            onClick(e, true)
          }}
          onPointerMissed={(e) => {
            onClick(e, false)
          }}
        />
      </PivotControls>
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