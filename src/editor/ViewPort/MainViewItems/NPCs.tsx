import React, { memo, useEffect, useRef, useState } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { Clone, useGLTF } from '@react-three/drei';
import { Euler, Group, Matrix4, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { PivotControls } from './PivoitControl';

export const NPCs = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [npcs, setNPCs] = useState<IObjectManagement[]>([]);

  useEffect(() => {
    const update = () => {
      const _npcs = oms.current.filter((om) => om.type === 'ai-npc');
      if (_npcs !== npcs) {
        setNPCs(_npcs);
        console.log('Update NPCs', _npcs);
      }
    };
    update();
    // onOMsChanged(update);
    return () => {
      // offOMsChanged(update);
    };
  }, [npcs]);

  return (
    <>
      {npcs.map((npc) => (
        <NPC {...npc} key={npc.id} />
      ))}
    </>
  );
};

const NPC = ({ ...om }: IObjectManagement) => {
  const ref = useRef<Group>(null);
  const state = useSnapshot(editorStore);
  const { scene } = useGLTF(om.args.url || '/models/ybot.glb') as GLTF;
  const editor = useNinjaEditor();

  // 操作系
  const onDragStart = () => {
    editorStore.pivotControl = true;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(om.id, position);
    editor.setScale(om.id, scale);
    editor.setRotation(om.id, rotation);
    editorStore.pivotControl = true;
  };

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        // transformsのコピー
        const _om = editor.getOMById(om.id) as IObjectManagement;
        if (_om && _om.args.position) ref.current.position.copy(_om.args.position);
        if (_om && _om.args.rotation) ref.current.rotation.copy(_om.args.rotation);
        if (_om && _om.args.scale) ref.current.scale.copy(_om.args.scale);
      }
    };
    update();
    editor.onOMIdChanged(om.id, update);
    return () => {
      editor.offOMIdChanged(om.id, update);
    };
  });

  console.log('NPCs');

  return (
    <>
      {!state.editorFocus && (
        <PivotControls
          // @ts-ignore
          object={state.currentId == om.id ? ref : null}
          visible={state.currentId == om.id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
        />
      )}
      <group ref={ref}>
        <Clone deep object={scene} />
      </group>
    </>
  );
};

// export const NPCs = memo(_NPCs);
