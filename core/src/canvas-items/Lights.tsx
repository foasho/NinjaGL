import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import React, { useContext, useEffect, useState, useRef } from "react"
import { MathUtils, Vector2 } from "three";
import { ShaderMaterial } from "three";

const Light = (om: IObjectManagement) => {
  const ref = useRef<any>();
  let light = undefined;
  let color: string = (om.args.color) ? om.args.color : '#fadcb9';
  if (om.args.type == "spot") {
    light = (
      <>
        <spotLight 
          ref={ref}
          castShadow
          color={color}
        />
      </>
    )
  }
  else if (om.args.type == "point") {
    light = (
      <>
        <pointLight
          castShadow
          color={color}
          layers={om.layerNum}
          ref={ref}
        />
      </>
    )
  }
  else if (om.args.type == "ambient") {
    light = (
      <>
        <ambientLight
          color={color}
          layers={om.layerNum}
          ref={ref}
        />
      </>
    )
  }
  else if (om.args.type == "directional") {
    light = (
      <>
        <directionalLight
          castShadow
          color={color}
          layers={om.layerNum}
          ref={ref}
        />
      </>
    )
  }

  useEffect(() => {
    if (ref.current) {
      if (om.layerNum){
        ref.current.layers.set(om.layerNum);
      }
      if (om.args.position) ref.current.position.copy(om.args.position);
      if (om.args.rotation) ref.current.rotation.copy(om.args.rotation);
      if (om.args.scale) ref.current.scale.copy(om.args.scale);
      if (om.args.castShadow) ref.current.castShadow = om.args.castShadow;
      if (om.args.receiveShadow) ref.current.receiveShadow = om.args.receiveShadow;
      if (om.args.intensity) ref.current.intensity = om.args.intensity;
      if (om.args.distance) ref.current.distance = om.args.distance;
      if (om.args.angle) ref.current.angle = om.args.angle;
      if (om.args.penumbra) ref.current.penumbra = om.args.penumbra;
    }
  }, [light]);

  return (
    <>
      {light}
    </>
  )
}

export const Lights = () => {
  const engine = useContext(NinjaEngineContext);
  const [lights, setLights] = useState(engine.getLights());

  useEffect(() => {
    setLights(engine.getLights());
    const handleLightsChanged = () => {
      setLights(engine.getLights());
    }
    engine.onLightsChanged(handleLightsChanged);
    return () => {
      engine.offLightsChanged(handleLightsChanged);
    }
  }, [engine]);
  
  return (
    <>
      {lights.map((light) => {
        return <Light {...light} key={light.id} />
      })}
    </>
  )
}