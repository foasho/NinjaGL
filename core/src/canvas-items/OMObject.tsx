import * as React from "react";
import { IObjectManagement } from "../utils/NinjaProps";
import { Color, Object3D } from "three";
import { Cloud, MeshReflectorMaterial, Sky, Text3D } from "@react-three/drei";
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
          <primitive object={om.object as Object3D} />
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
      {/** Sky */}
      {om.type === "sky" && (
        <SkyComponent om={om} />
      )}
      {/** Cloud */}
      {om.type === "cloud" && (
        <CloudComponent om={om} />
      )}
      {/** Text */}
      {om.type === "text" && (
        <OMText om={om} />
      )}
      {/** Text3D */}
      {om.type === "text3d" && (
        <OMText3D om={om} />
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
  const ref = React.useRef<any>();
  let light: any = undefined;
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

  React.useEffect(() => {
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
  const ref = React.useRef<any>();
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
  
  React.useEffect(() => {
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
const OMText = ({ om }) => {
  const ref = React.useRef<any>();
  React.useEffect(() => {
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
    }
  }, [])
  return (
    <>
      {/** @ts-ignore */}
      <Text font={""} ref={ref}>
        {om.args.content as string}
      </Text>
    </>
  )
}

/**
 * ------
 * Text3D
 * ------
 */
const OMText3D = ({ om }) => {
  const ref = React.useRef<any>();
  React.useEffect(() => {
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
    }
  }, [])
  return (
    <>
      {/** @ts-ignore */}
      <Text3D font={""} ref={ref}>
        {om.args.content}
      </Text3D>
    </>
  )
}

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
const CloudComponent = ({ om:cloud }: { om: IObjectManagement }) => {
  return (
    <Cloud 
      opacity={cloud.args.opacity ? cloud.args.opacity : 0.5}
      speed={cloud.args.speed ? cloud.args.speed : 0.4}
      width={cloud.args.width ? cloud.args.width : 10}
      depth={cloud.args.depth ? cloud.args.depth : 1.5}
      segments={cloud.args.segments ? cloud.args.segments : 20}
    />
  )
}
