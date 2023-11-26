import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { globalStore } from '../Store/Store';
import { MyLights } from '../ViewPort/MainViewItems/Lights';
import { MyEnviroment } from '../ViewPort/MainViewItems/MyEnvironment';
import { MyTexts } from '../ViewPort/MainViewItems/MyTexts';
import { StaticObjects } from '../ViewPort/MainViewItems/Objects';
import { Avatar } from '../ViewPort/MainViewItems/Player';
import { MySky } from '../ViewPort/MainViewItems/Sky';
import { Terrain } from '../ViewPort/MainViewItems/Terrain';
import { ThreeObjects } from '../ViewPort/MainViewItems/Three';

/**
 * カメラプレビュー画面
 */
export const CameraPreview = () => {
  const { getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const om = state.currentId ? getOMById(state.currentId) : null;
  const cpos: Vector3 = om && om.args.position ? om.args.position : new Vector3(0, 0, 5);
  const crot: Euler = om && om.args.rotation ? om.args.rotation : new Euler(0, 0, 0);
  const fov = om && om.args.fov ? om.args.fov : 50;
  const near = om && om.args.near ? om.args.near : 0.1;
  const far = om && om.args.far ? om.args.far : 1000;

  return (
    <>
      {om && om.type == 'camera' && (
        <div className='absolute bottom-2 left-2 z-20 bg-white'>
          <Canvas
            className='h-[200px] w-[300px]'
            camera={{
              fov: fov,
              near: near,
              far: far,
              position: cpos,
              rotation: crot,
            }}
          >
            <MyLights />
            <StaticObjects />
            <Terrain />
            <Avatar />
            <MySky />
            <ThreeObjects />
            <MyEnviroment />
            <MyTexts />
            <CameraPreviewFrame />
          </Canvas>
        </div>
      )}
    </>
  );
};

const CameraPreviewFrame = () => {
  const { getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const om = state.currentId ? getOMById(state.currentId) : null;
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (om) {
      const cpos: Vector3 = om && om.args.position ? om.args.position : new Vector3(0, 0, 5);
      const crot: Euler = om && om.args.rotation ? om.args.rotation : new Euler(0, 0, 0);
      camera.position.copy(cpos.clone());
      camera.rotation.copy(crot.clone());
    }
  });

  return <></>;
};
