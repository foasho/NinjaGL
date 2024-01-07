import React, { memo, useEffect, useRef, useState } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { useGLTF } from '@react-three/drei';
import { Group, Material, Mesh, MeshStandardMaterial, TextureLoader } from 'three';
import { useSnapshot } from 'valtio';

import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

const _LandScape = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [landScape, setLandScape] = useState<IObjectManagement | null>(null);

  useEffect(() => {
    const update = () => {
      const _landScape = oms.current.find((om) => om.type == 'landscape');
      if (_landScape && _landScape !== landScape) setLandScape(_landScape);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [landScape, offOMsChanged, oms, onOMsChanged]);

  return <>{landScape && <MyLandScape {...landScape} />}</>;
};

const MyLandScape = ({ ...om }: IObjectManagement) => {
  const { nodes, materials } = useGLTF(om.args.url) as any;

  if (nodes) {
    nodes.traverse((child) => {
      // Only Recieve Shadow
      child.receiveShadow = true;
    });
  }

  // actionTypeに応じた変形や色付けなどを行う。
  const ActionLandScape = () => {};

  return (
    <LandScapeProvider om={om}>
      <mesh geometry={nodes.Plane.geometry} material={nodes.Plane.material} rotation={[-Math.PI / 2, 0, 0]}>
        {/** ベースマテリアル */}
        {/** Blendingマテリアル */}
      </mesh>
    </LandScapeProvider>
  );
};

const LandScapeContext = React.createContext<{}>({});
const LandScapeProvider = ({ om, children }: { om: IObjectManagement; children: React.ReactNode }) => {
  const mode = useRef<'edit' | 'view'>('view');
  const actionType = useRef<"normal"|"flat"|"paint"|"smooth">('normal'); // normal, flat, paint, smooth 
  const power = useRef(0.1);
  const isWF = useRef(false);
  const radius = useRef(10);
  const color = useRef('#00ff00');
  const { currentId } = useSnapshot(editorStore);
  const { getOMById, onOMIdChanged, offOMIdChanged } = useNinjaEditor();
  const ref = useRef<Group>(null);

  useEffect(() => {
    if (currentId === om.id) {
      mode.current = 'edit';
    } else {
      mode.current = 'view';
    }
    const update = async () => {
      const ls = getOMById(om.id);
      if (ref.current && ls) {
        if (ls.args.zPos) {
          ref.current.position.z = ls.args.zPos;
        }
        // baseマテリアルの設定
        if (ls.args.base){
          // ベースがカラーの場合
          if (ls.args.base == "color"){
            const color = ls.args.color;
            (ref.current.children[0] as Mesh).material = new MeshStandardMaterial({color:color});
          }
          // ベースが画像の場合
          if (ls.args.base == "image"){
            const url = ls.args.url;
            const tex = new TextureLoader().load(url); 
            (ref.current.children[0] as Mesh).material = new MeshStandardMaterial({map:tex});
          }
        }
      }
    };
    update();
    onOMIdChanged(om.id, update);
    return () => {
      offOMIdChanged(om.id, update);
    };
  }, [currentId, getOMById, offOMIdChanged, onOMIdChanged, om.id]);

  return (
    <LandScapeContext.Provider value={{
      mode,

    }}>
      <group ref={ref}>{children}</group>
    </LandScapeContext.Provider>
  );
};


export const LandScape = memo(_LandScape);
