import { Environment, Lightformer } from "@react-three/drei";
import React from "react";
import { Vector3 } from "three";
import { useNinjaEngine } from "../hooks";
import { IObjectManagement } from "../utils";

/**
 * EnvironmentやLightformerなどの環境
 */
export const OMEnvirments = () => {
  const { oms } = useNinjaEngine();
  const environments = React.useMemo(() => {
    return oms.filter((om) => om.type === "environment");
  }, [oms]);
  const environment = environments.length > 0 ? environments[0] : null;
  const lightformers = React.useMemo(() => {
    return oms.filter((om) => om.type === "lightformer");
  }, [oms]);
  return (
    <>
      {environment && (
        <>
          <Environment
            resolution={512}
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
            frames={Infinity}
          >
            {lightformers.map((om) => {
              return <LightFormer om={om} key={om.id} />;
            })}
          </Environment>
        </>
      )}
      {!environment && lightformers.length > 0 && (
        <>
          <Environment frames={Infinity} resolution={512}>
            {lightformers.map((om, idx) => {
              return <LightFormer om={om} key={idx} />;
            })}
          </Environment>
        </>
      )}
    </>
  );
};

const LightFormer = ({ om }: { om: IObjectManagement }) => {
  return (
    // @ts-ignore
    <Lightformer
      form={om.args.form}
      intensity={om.args.intensity}
      color={om.args.color}
      position={om.args.position}
      rotation={om.args.rotation}
      // @ts-ignore
      scale={om.args.scale}
      onUpdate={(self) => {
        if (om.args.lookAt) {
          const newVector = new Vector3().copy(om.args.lookAt);
          self.lookAt(newVector);
        }
      }}
    />
  );
};
