import { useState, useEffect, useRef } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { useHelper } from '@react-three/drei';
import { BoxHelper, Euler, Matrix4, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { PivotControls } from './PivoitControl';

/**
 * アバターデータ
 */
export const Avatar = () => {
  const state = useSnapshot(globalStore);
  const { oms, getOMById, setPosition, setRotation, setScale } = useNinjaEditor();
  const [avatar, setAvatar] = useState<IObjectManagement | null>(null);
  const id = avatar ? avatar.id : null;
  const ref = useRef<any>();
  const [helper, setHelper] = useState<boolean>(true);
  const editorData = useRef<{
    focus: boolean;
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
  }>({
    focus: false,
    position: new Vector3(),
    rotation: new Euler(),
    scale: new Vector3(),
  });

  useEffect(() => {
    const om = oms.find((om) => om.type == 'avatar');
    if (om) {
      setAvatar(om);
    }
  }, []);

  const onDragStart = () => {
    globalStore.pivotControl = true;
  };
  const onDragEnd = () => {
    // globalStore.pivotControl = false;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    if (id) {
      setPosition(id, position);
      setScale(id, scale);
      setRotation(id, rotation);
    }
    globalStore.pivotControl = true;
  };

  useHelper(globalStore.currentId == id && helper && ref, BoxHelper);

  return (
    <>
      {avatar && (
        <>
          {!state.editorFocus && (
            <PivotControls
              object={globalStore.currentId == id ? ref : undefined}
              visible={id == state.currentId}
              disableAxes={!(id == state.currentId)}
              disableSliders={!(id == state.currentId)}
              disableRotations={!(id == state.currentId)}
              depthTest={false}
              lineWidth={2}
              anchor={[0, 0, 0]}
              onDrag={(e) => onDrag(e)}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
              userData={editorData.current}
            />
          )}
          <mesh ref={ref}>
            <primitive
              object={avatar.object!}
              onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
              onPointerMissed={(e) => e.type === 'click' && (globalStore.currentId = null)}
            />
          </mesh>
        </>
      )}
    </>
  );
};
