import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { NinjaCanvas, NinjaGL } from "./index";
import { Canvas } from '@react-three/fiber';
import { NinjaCanvasItems } from './hooks/useNinjaEngine';

function Showcase () {
  const [scene, setScene] = React.useState('samplecamera.njc');
  useEffect(() => {
    console.log('Showcase component mounted');
  }, []);
  const changeScene = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScene(e.target.value);
  };
  return (
    <div style={{ height: "100%" }}>
    <NinjaGL noCanvas={true} njcPath={scene}>
      <Canvas>
        <NinjaCanvasItems />
      </Canvas>
    </NinjaGL>
     <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}>
      <div style={{ color: "white" }}>
        <select
          value={'samplecamera.njc'}
          onChange={changeScene}
        >
          <option value='samplecamera.njc'>デフォルトシーン</option>
          <option value='thirdperson.njc'>サードパーソン</option>
          {/* <option value='samplemultiplayer.njc'>マルチプレイヤー</option> */}
        </select>
      </div>
     </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>
);
