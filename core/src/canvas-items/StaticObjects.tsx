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

interface IStaticObject {
  om: IObjectManagement;
}
const StaticObject = (props: IStaticObject) => {
  useEffect(() => {
    if (props.om.object) {
      // posistion, rotation, scale
      if (props.om.args.position) {
        props.om.object.position.copy(props.om.args.position);
      }
      if (props.om.args.rotation) {
        props.om.object.rotation.copy(props.om.args.rotation);
      }
      if (props.om.args.scale) {
        props.om.object.scale.copy(props.om.args.scale);
      }
    }
    // layerNum
    if (props.om.layerNum) {
      props.om.object.layers.set(props.om.layerNum);
    }
  }, [props.om.object]);

  return (
    <>
      {props.om.object &&
        <primitive 
          object={props.om.object}
        />
      }
    </>
  )
}