import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { Canvas } from "@react-three/fiber";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "../canvas-items/Avatar";
import { SkyComponents } from "../canvas-items/Sky";
import { StaticObjects } from "../canvas-items/StaticObjects";
import { System } from "../canvas-items/System";
import { Terrain } from "../canvas-items/Terrain";
import { NinjaUI } from "./NinjaUI";
import { LoadProcessing } from "../ui-items/LoadProcessing";
import { Lights } from "../canvas-items/Lights";
import { INinjaGLProps } from "./NinjaGL";
import { ThreeObjects } from "../canvas-items/ThreeObjects";
import { Cameras } from "../canvas-items/Camera";
import { JSONTree } from 'react-json-tree';
import { MyEnvirments } from "../canvas-items/MyEnvirments";
import { MyEffects } from "../canvas-items/MyEffects";
import { MyTexts } from "../canvas-items/MyText";
import { MyText3Ds } from "../canvas-items/MyText3D";
import { loadNJCFileFromURL } from "./NinjaFileControl";

export interface ILoadingState {
  loadingPercentages: number;
  isNowLoading: boolean;
  loadCompleted: boolean;
}

export const NinjaCanvas = (props: INinjaGLProps) => {
  const engine = useContext(NinjaEngineContext);
  const [ready, setReady] = useState(false);
  const loadingRef = useRef<ILoadingState>({
    loadingPercentages: 0,
    isNowLoading: false,
    loadCompleted: false
  });
  /**
   * ロード中のコールバック
   * @param itemsLoaded 
   * @param itemsTotal 
   */
  const onLoadingCallback = (
    itemsLoaded: number, 
    itemsTotal: number
  ) => {
    console.info(`<< Loading: ${itemsLoaded} / ${itemsTotal} >>`);
    loadingRef.current.loadingPercentages = itemsLoaded / itemsTotal;
  }
  useEffect(() => {
    let isMounted = true;
    if (!engine) return;
    const fetchEngine = async () => {
      // if (props.njcPath) {
      //   loadingRef.current.loadingPercentages = 0;
      //   loadingRef.current.isNowLoading = true;
      //   loadingRef.current.loadCompleted = false;
      //   // ロード時間を計測する
      //   const startTime = new Date().getTime();
      //   const data = await loadNJCFileFromURL(props.njcPath, onLoadingCallback);
      //   const endTime = new Date().getTime();
      //   console.info(`<< LoadedTime: ${endTime - startTime}ms >>`);
      //   if (isMounted) {
      //     await engine.setNJCFile(data);
      //     loadingRef.current.isNowLoading = false;
      //     loadingRef.current.loadCompleted = true;
      //     setReady(true);
      //   }
      // }
    }
    // fetchEngine();
    return () => {
      // isMounted = false;
      // setReady(false);
    }
  }, [
    props.njcPath, 
    // engine
  ]);


  return (
    <>
      {/* <Canvas 
        id="ninjagl" 
        shadows 
        dpr={engine&&engine.config.dpr? engine.config.dpr: 1}
        gl={{ 
          antialias: engine? engine.config.antialias: false, 
          alpha: engine? engine.config.alpha: false, 
          logarithmicDepthBuffer: engine? engine.config.logarithmicDepthBuffer: false,
        }}
        {...props.canvasProps}
      >
      {ready && engine &&
      <>
        <>
          <System />
          <Terrain />
          <Avatar />
          <StaticObjects/>
          <Lights/>
          <SkyComponents />
          <ThreeObjects/>
          <Cameras/>
          <MyEnvirments/>
          <MyEffects/>
          <MyTexts/>
          <MyText3Ds/>
        </>
        {props.children}
      </>
      }
      </Canvas> */}
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
      {ready &&
        <NinjaUI />
      }
      {!ready &&
        <LoadProcessing {...loadingRef.current} />
      }
      {engine && engine.config.isDebug &&
        <>
          <DebugComponent />
        </>
      }
    </>
  )
}

const DebugComponent = () => {
  const treeRef = useRef<any>({});
  const engine = useContext(NinjaEngineContext);
  useEffect(() => {
    const interval = setInterval(() => {
      myFrame(1000 / 5);
    }, 1000 / 5);
    return () => clearInterval(interval);
  }, [engine])

  const myFrame = (timeDelta: number) => {
    if (!engine) return;
    if (!treeRef.current) return;
    engine.debugFrameUpdate(timeDelta, {});
    treeRef.current = engine.getDebugTree();
  }

  return (
    <>
      <div style={{ position: "absolute", bottom: 0, zIndex: 9999  }}>
        <JSONTree data={treeRef} />;
      </div>
    </>
  )
}