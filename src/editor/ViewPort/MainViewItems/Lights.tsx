import { IObjectManagement } from "@ninjagl/core";
import { 
  // PivotControls, 
  useHelper } from "@react-three/drei";
import { useContext, useEffect, useState, useRef } from "react";
import { Color, DirectionalLightHelper, DoubleSide, Euler, Mesh, PointLightHelper, SpotLightHelper, Vector3 } from "three";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { PivotControls } from "./PivoitControl";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

export const MyLights = () => {
  const editor = useContext(NinjaEditorContext);
  const [lights, setLights] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setLights(editor.getLights());
    const handleLightChanged = () => {
      console.log('handleLightChanged');
      setLights([...editor.getLights()]);
    }
    editor.onLightChanged(handleLightChanged);
    return () => {
      editor.offLightChanged(handleLightChanged);
    }
  }, [editor]);
  return (
    <>
      {lights.map((om) => {
        return <MyLight om={om} key={om.id}/>
      })}
    </>
  )
}


interface ILightProps {
  om       : IObjectManagement;
}
export const MyLight = (prop: ILightProps) => {
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const catchRef = useRef<Mesh>();
  const ref = useRef<any>();
  const { om } = prop;
  const id = om.id;

  const onDragStart = () => {
    globalStore.pivotControl = true;
  }
  const onDragEnd = () => {
  }

  const onDrag = (e) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
  };

  useEffect(() => {
    const init = () => {
      if (om.args.position){
        ref.current.position.copy(om.args.position.clone());
        catchRef.current.position.copy(ref.current.position.clone());
      }
      if (om.args.rotation){
        ref.current.rotation.copy(om.args.rotation.clone());
        catchRef.current.rotation.copy(om.args.rotation.clone());
      }
      if (om.args.scale){
        ref.current.scale.copy(om.args.scale.clone());
        catchRef.current.scale.copy(om.args.scale.clone());
      }
      if (om.args.color){
        ref.current.color.copy(new Color(om.args.color));
        ref.current.needsUpdate = true;
      }
      // I wanna remove helper
      catchRef.current.updateMatrix();
    }
    init();
    const handleIdChanged = () => {
      init();
    }
    editor.onOMIdChanged(id, handleIdChanged);
    return () => {
      editor.offOMIdChanged(id, handleIdChanged);
    }
  }, [om]);

  let _helperObject: any = DirectionalLightHelper;
  if (om.args.type == "spot"){
    _helperObject = SpotLightHelper;
  }
  else if (om.args.type == "point"){
    _helperObject = PointLightHelper;
  }
  useHelper((ref), _helperObject);
  
  return (
      <>
        {om.args.type == "spot" &&
          <>
            <spotLight 
              ref={ref}
              castShadow
            />
          </>
        }
        {om.args.type == "directional" &&
          <>
              <directionalLight 
                ref={ref}
                castShadow
              />
          </>
        }
        {om.args.type == "point" &&
          <>
            <pointLight
              ref={ref}
              position={[0, 5, 0]}
              castShadow
            />
          </>
        }

        {/* ヘルパーはやはり一緒にいれる */}
        {!state.editorFocus &&
          <PivotControls
            object={(state.currentId == id) ? catchRef : undefined}
            visible={(state.currentId == id)}
            depthTest={false}
            lineWidth={2}
            anchor={[0, 0, 0]}
            onDrag={(e) => onDrag(e)}
            onDragStart={() => onDragStart()}
            onDragEnd={() => onDragEnd()}
          />
        }
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            globalStore.currentId = id;
            globalStore.pivotControl = true;
          }}
          onPointerMissed={(e) => {
            if (e.type === 'click'){
              globalStore.currentId = null;
              globalStore.pivotControl = false;
            }
          }}
          ref={catchRef}
          // onContextMenu={(e) => {e.stopPropagation()}}
        >
          <boxBufferGeometry args={[1, 1, 1]}  />
          <meshStandardMaterial 
            wireframe={true} 
            visible={false} 
            color={0x00ff00}
          />
        </mesh>
      </>
  )
}