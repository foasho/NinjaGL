import React from 'react';

import { useAnimations } from '@react-three/drei';
import { Object3D } from 'three';

import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export type AnimationHelperProps = {
  id: string;
  object: Object3D;
  visible?: boolean;
  onClick?: (e) => void;
  onPointerMissed?: (e) => void;
  initSelectAnimation?: string;
};
export const AnimationHelper = ({
  id,
  object,
  visible = true,
  onClick = () => {},
  onPointerMissed = () => {},
  initSelectAnimation = 'Idle',
}: AnimationHelperProps) => {
  const animations = object.animations;
  const { ref, actions } = useAnimations(animations);
  const { getOMById, onOMIdChanged, offOMIdChanged } = useNinjaEditor();
  const [defaultAnimation, setDefaultAnimation] = React.useState<string>(initSelectAnimation);
  const [animationLoop, setAnimationLoop] = React.useState<boolean>(true);

  const animationStop = () => {
    if (actions && actions[defaultAnimation]) {
      actions[defaultAnimation]!.stop();
    }
  };

  const animationAllStop = () => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        if (defaultAnimation !== key) actions[key]!.stop();
      });
    }
  };

  React.useEffect(() => {
    const init = () => {
      const _om = getOMById(id);
      if (_om) {
        if (_om.args.defaultAnimation) {
          setDefaultAnimation(_om.args.defaultAnimation);
        }
        if (_om.args.animationLoop !== undefined) {
          setAnimationLoop(_om.args.animationLoop);
        }
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  });

  React.useEffect(() => {
    if (actions && actions[defaultAnimation]) {
      animationAllStop();
      actions[defaultAnimation]!.play();
    }
    if (!animationLoop) {
      animationStop();
    }
  }, [actions, defaultAnimation, animationLoop]);

  return <primitive ref={ref} visible={visible} onClick={onClick} onPointerMissed={onPointerMissed} object={object} />;
};
