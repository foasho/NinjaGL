import React, { useContext, useEffect, useState } from "react";
import { Euler, Vector3 } from "three";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";

export interface IStaticObjectsProps { }

export const StaticObjects = () => {
  const engine = useContext(NinjaEngineContext);
  const [staticObjects, setStaticObjects] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setStaticObjects(engine.getStaticObjects());
    const handleObjectChanged = () => {
      setStaticObjects(engine.getLights());
    }
    engine.onObjectChanged(handleObjectChanged);
    return () => {
      engine.onObjectChanged(handleObjectChanged);
    }
  }, [engine]);
  return (
    <>
      {staticObjects.map((om, index) => {
        return <StaticObject om={om} key={index} />
      })}
    </>
  )
}

const StaticObject = ({ om }) => {
  useEffect(() => {
    if (om.object) {
      // posistion, rotation, scale
      if (om.args.position) {
        om.object.position.copy(om.args.position);
      }
      if (om.args.rotation) {
        om.object.rotation.copy(om.args.rotation);
      }
      if (om.args.scale) {
        om.object.scale.copy(om.args.scale);
      }
    }
    // layerNum
    if (om.layerNum) {
      om.object.layers.set(om.layerNum);
    }
    // Animationがあればmiserにセット
    if (om.args.defaultAnimation){
      const animation = om.animations.find((anim) => anim.name == om.args.defaultAnimation);
      if (animation && om.mixer){
        om.mixer.clipAction(animation).play();
      }
    }
  }, [om.object]);

  return (
    <>
      {om.object &&
        <primitive 
          object={om.object}
        />
      }
    </>
  )
}