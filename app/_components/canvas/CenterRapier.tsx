import { useMemo, useRef } from 'react';

import { type Vector } from '@dimforge/rapier3d';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { BallCollider, Physics, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { MathUtils, Vector3 } from 'three';

import { Apple } from './Rapiers/Apple';
import { Bomb } from './Rapiers/Bomb';
import { Coin } from './Rapiers/Coin';
import { OculusRift } from './Rapiers/OculusRift';
import { OculusTouch } from './Rapiers/OculusTouch';
import { Shuriken } from './Rapiers/Shuriken';
import { Star } from './Rapiers/Star';
import { XBox } from './Rapiers/XBox';

export const CenterRapier = () => {
  return (
    <Physics gravity={[0, 0, 0]}>
      <Pointer />
      <Connector>
        <Apple>
          <MeshTransmissionMaterial distortionScale={0} temporalDistortion={0} />
        </Apple>
        <pointLight intensity={4} distance={2.5} color='#43D9D9' />
      </Connector>
      <Connector>
        <Coin color='#FFBD4D' />
      </Connector>
      <Connector>
        <Coin>
          <MeshTransmissionMaterial distortionScale={0} temporalDistortion={0} />
        </Coin>
      </Connector>
      <Connector>
        <Star color='#FFBD4D' />
      </Connector>
      <Connector>
        <XBox>
          <meshPhongMaterial color='#D3D3D3' specular={'#171717'} shininess={30} emissive={1.0} />
        </XBox>
      </Connector>
      <Connector>
        <XBox>
          <meshPhongMaterial color='#123242' specular={'#171717'} shininess={30} emissive={1.0} />
        </XBox>
      </Connector>
      <Connector>
        <Shuriken />
      </Connector>
      <Connector>
        <Shuriken>
          <meshPhongMaterial color='#2EA9DF' specular={'#171717'} shininess={30} emissive={1.0} />
        </Shuriken>
      </Connector>
      <Connector>
        <Shuriken>
          <meshPhongMaterial color='#123242' specular={'#171717'} shininess={30} emissive={1.0} />
        </Shuriken>
      </Connector>
      <Connector>
        <Shuriken>
          <MeshTransmissionMaterial distortionScale={0} temporalDistortion={0} />
        </Shuriken>
      </Connector>
      <Connector>
        <OculusTouch />
      </Connector>
      <Connector>
        <OculusTouch>
          <meshPhongMaterial color='#F2F2F2' specular={'#171717'} shininess={30} emissive={1.0} />
        </OculusTouch>
      </Connector>
      <Connector>
        <OculusRift />
      </Connector>
      <Connector>
        <OculusRift>
          <meshPhongMaterial color='#8B81C3' specular={'#171717'} shininess={30} emissive={1.0} />
        </OculusRift>
      </Connector>
      <Connector>
        <Bomb />
      </Connector>
      <Connector>
        <Bomb>
          <meshPhongMaterial color='#DB4D6D' specular={'#171717'} shininess={30} emissive={1.0} />
        </Bomb>
      </Connector>
    </Physics>
  );
};

type ConnectorProps = {
  position?: Vector3 | [number, number, number];
  children?: React.ReactNode;
  vec?: Vector3;
  r?: (n: number) => number;
};
const Connector = ({ position, children, vec = new Vector3(), r = MathUtils.randFloatSpread }: ConnectorProps) => {
  const api = useRef<RapierRigidBody>(null);
  const pos: Vector3 | [number, number, number] = useMemo(() => position || [r(10), r(10), r(10)], []);

  useFrame(() => {
    if (api.current) {
      const moveVec = vec.copy(api.current.translation() as Vector3);
      const negateMoveVec = moveVec.negate().multiplyScalar(0.2);
      api.current.applyImpulse(negateMoveVec as Vector, false);
    }
  });

  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[0.5]} />
      {children}
    </RigidBody>
  );
};

/**
 * マウスの位置を追従するポインターコライダー
 */
const Pointer = ({ vec = new Vector3(), scale = 0.5 }: { vec?: Vector3; scale?: number }) => {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (ref.current) {
      ref.current.setNextKinematicTranslation(
        vec.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0),
      );
    }
  });

  return (
    <RigidBody ref={ref} position={[0, 0, 0]} type='kinematicPosition' colliders={false}>
      <BallCollider args={[scale]} />
    </RigidBody>
  );
};
