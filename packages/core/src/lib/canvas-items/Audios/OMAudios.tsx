import React, { Suspense } from "react";
import { PositionalAudio } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PositionalAudio as PositionalAudioImpl, Vector3 } from "three";
import { useNinjaEngine } from "../../hooks";
import { Loading3D } from "../Common/Loading3D";

export const OMAudios = () => {
  const { oms } = useNinjaEngine();
  const audios = React.useMemo(() => {
    if (!oms) return [];
    const audios = oms.filter((o) => o.type === "audio");
    return audios ? audios : [];
  }, [oms]);
  return (
    <>
      {audios.map((om) => (
        <>
          {om.args.url && (
            <OMAudio
              key={om.id}
              url={om.args.url}
              position={om.args.position || new Vector3()}
              distance={om.args.distance}
              maxVolume={om.args.volume}
            />
          )}
        </>
      ))}
    </>
  );
};

const OMAudio = ({
  url,
  position,
  distance = 25,
  maxVolume = 0.75,
  load = undefined,
}: {
  url: string;
  position: Vector3;
  distance?: number;
  maxVolume?: number;
  load?: any;
}) => {
  const ref = useRef<PositionalAudioImpl | any>(null);
  const { player, isSound } = useNinjaEngine();
  // let isTime = 0;

  useEffect(() => {
    if (!ref.current) return;
    if (isSound) {
      // 再生中でなければ再生
      if (!ref.current.isPlaying) {
        ref.current.play();
      }
    } else {
      // 再生中なら停止
      if (ref.current.isPlaying) {
        ref.current.pause();
      }
    }
  }, [isSound]);

  useFrame(() => {
    if (!isSound) return;
    if (ref.current) {
      if (!player.current) return;
      const d = position.distanceTo(player.current.position);
      if (d > distance) {
        ref.current.setVolume(0);
        if (ref.current.isPlaying) {
          ref.current.pause();
        }
      } else {
        if (!ref.current.isPlaying) {
          ref.current.play();
        }
        if (distance == d || distance == 0) {
          ref.current.setVolume(maxVolume);
          return;
        }
        const v = maxVolume * (1 - d / distance);
        if (v >= 0 && v <= 1) {
          ref.current.setVolume(v >= 1 ? 1 : v);
        }
      }
    }
  });

  return (
    <Suspense fallback={<Loading3D />}>
      {isSound && (
        <PositionalAudio
          ref={ref}
          url={url}
          position={position}
          distance={distance}
          loop={true}
        />
      )}
    </Suspense>
  );
};
