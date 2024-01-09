import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";

export const Effects = () => {
  return (
    <>
      <EffectComposer>
        <Noise opacity={0.02} />
        <Bloom luminanceThreshold={2.5} luminanceSmoothing={2.3} height={320} />
      </EffectComposer>
    </>
  );
};
