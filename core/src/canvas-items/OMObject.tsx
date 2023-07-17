import React, { useEffect, useMemo, useRef, useState } from "react";
import { IObjectManagement } from "../utils/NinjaProps";
import { Color, Object3D, Texture } from "three";
import { MeshReflectorMaterial, Sky } from "@react-three/drei";
import { useNinjaEngine } from "../hooks/useNinjaEngine";

export const OMObjects = () => {
  const { oms } = useNinjaEngine();
  return (
    <>
      {oms.map((om) => (
        <OMObject om={om} key={om.id} />
      ))}
    </>
  )
}


/**
 * RenderOrder
 * [0] 
 */
export const OMObject = ({ om }: { om: IObjectManagement }) => {

  return (
    <>
      {/** 地形データ */}
      {om.type === "terrain" && (
        <mesh renderOrder={0}>
          <primitive object={om.object} />
        </mesh>
      )}
      {/** ライティング */}
      {om.type === "light" && (
        <Light om={om} />
      )}
      {/** Threeメッシュ */}
      {om.type === "three" && (
        <ThreeObject om={om} />
      )}
    </>
  )
}


/**
 * --------------------
 * Ligitingコンポネント
 * --------------------
 */
const Light = ({ om }: { om: IObjectManagement }) => {
  const ref = useRef<any>();
  let light = undefined;
  let color: string = (om.args.color) ? om.args.color : '#fadcb9';
  if (om.args.type == "spot") {
    light = (
      <>
        <spotLight 
          ref={ref}
          renderOrder={1}
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
          renderOrder={1}
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
          renderOrder={1}
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
          renderOrder={1}
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


/**
 * --------------------
 * Threeコンポネント
 * --------------------
 */
const ThreeObject = ({ om }: { om: IObjectManagement }) => {
  const ref = useRef<any>();
  const { setOMObjectById } = useNinjaEngine();
  // const matRef = useRef<any>();
  let geometry;
  let material;
  if (om.args.type == "plane") {
    geometry = (<planeGeometry />);
  }
  else if (om.args.type == "sphere") {
    geometry = (<sphereGeometry />);
  }
  else if (om.args.type == "box") {
    geometry = (<boxGeometry />);
  }
  else if (om.args.type == "cylinder") {
    geometry = (<cylinderGeometry />);
  }
  else if (om.args.type == "capsule") {
    geometry = (<capsuleGeometry />);
  }

  if (om.args.materialData) {
    const color = om.args.materialData.type != "shader" ? new Color(om.args.materialData.value): new Color(0xffffff);
    if (om.args.materialData.type == "standard") {
      material = (<meshStandardMaterial color={color} />);
    }
    else if (om.args.materialData.type == "phong") {
      material = (<meshPhongMaterial color={color} />);
    }
    else if (om.args.materialData.type == "toon") {
      material = (<meshToonMaterial color={color} />);
    }
    else if (om.args.materialData.type == "shader") {
      material = (<shaderMaterial />);
    }
    else if (om.args.materialData.type == "reflection") {
      material = (<MeshReflectorMaterial mirror={0} color={color}/>);
    }
  }
  let castShadow = true;
  if (om.args.castShadow != undefined) {
    castShadow = om.args.castShadow;
  }
  let receiveShadow = true;
  if (om.args.receiveShadow != undefined) {
    receiveShadow = om.args.receiveShadow;
  }
  
  useEffect(() => {
    if (ref.current) {
      setOMObjectById(om.id, ref.current as Object3D);
      if (ref.current) {
        if (om.args.position) {
          ref.current.position.copy(om.args.position);
        }
        if (om.args.rotation) {
          ref.current.rotation.copy(om.args.rotation);
        }
        if (om.args.scale) {
          ref.current.scale.copy(om.args.scale);
        }
        if (om.args.materialData){
          if (om.args.materialData.type !== "shader"){
            // @ts-ignore
          }
        }
      }
    }
  }, []);

  return (
    <>
      {geometry &&
      <mesh 
        ref={ref}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        {geometry}
        {material}
      </mesh>
      }
    </>
  )
}

/** ----
 * Text
 * -----
 */ 
const Text = () => {}


/**
 * ----
 * Sky
 * ----
 */

const SkyComponent = ({ om: sky }: { om: IObjectManagement }) => {
  return (
    <>
      <Sky
        distance={sky.args.distance ? sky.args.distance : 450000}
        sunPosition={sky.args.sunPosition ? sky.args.sunPosition : [0, 1, 0]}
        inclination={sky.args.inclination ? sky.args.inclination : 0}
        azimuth={sky.args.azimuth ? sky.args.azimuth : 0}
      />
    </>
  )
}

/**
 * ------
 * Cloud
 * ------
 */
const CloudComponent = ({ om:cloud }: { om: IObjectManagement }) => {}
