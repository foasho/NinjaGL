import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { NinjaCanvas, NinjaGL } from "./hooks";
import { Canvas } from '@react-three/fiber';
import { NinjaCanvasItems } from './hooks/useNinjaEngine';

function Showcase () {
  const [scene, setScene] = React.useState('samplecamera.njc');
  React.useEffect(() => {
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

/**
 * Html entry point
 */
const container = document.getElementById('root')
const root = ReactDOM.createRoot(container as HTMLElement)
root.render(
  <Showcase />
)
