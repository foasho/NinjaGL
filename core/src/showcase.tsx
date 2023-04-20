import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { NinjaGL, 
  loadNJCFile, 
  InitMobileConfipParams, 
  NinjaEngine, 
  NinjaEngineContext, 
  loadNJCFileFromURL, 
  IConfigParams, 
  NJCFile, 
  NinjaCanvas 
} from "./index";
import { SkeletonUtils } from 'three-stdlib';

function Showcase () {
  const [scene, setScene] = React.useState(1);
  useEffect(() => {
    console.log('Showcase component mounted');
  }, []);
  const changeScene = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScene(Number(e.target.value));
  };
  return (
    <div style={{ height: "100%" }}>
     <NinjaGL njcPath='simple-thirdperson.njc'>
      <mesh>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshStandardMaterial attach="material" color="hotpink" />
      </mesh>
    </NinjaGL>
     <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}>
      <div style={{ color: "white" }}>
        <select
          value={scene}
          onChange={changeScene}
        >
          <option value="1">デフォルトシーン</option>
          <option value="2">サードパーソン</option>
          <option value="3">マルチプレイヤー</option>
        </select>
      </div>
     </div>
    </div>
  );
};

const DebugPlay = () => {

 const [engine, setEngine] = useState<NinjaEngine>();
  useEffect(() => {
    const load = async () => {
      const _njcFile = await loadNJCFileFromURL("simple-thirdperson.njc");
      // EditorからOMを取得してJSON化する
      const oms = [..._njcFile.oms];
      oms.map((om) => {
        const _om = { ...om };
        if (om.type == "avatar") {
          const target = SkeletonUtils.clone(_om.object);
          target.animations = om.animations;
          _om.object = target;
        }
        return _om;
      });
      const ums = [..._njcFile.ums];
      const tms = [..._njcFile.tms];
      const sms = [..._njcFile.sms];
      const config = _njcFile.config;
      // Configパラメータを設定する
      const _config: IConfigParams = {
        ...config,
        isDebug: true,
      }
      const _engine = new NinjaEngine();
      const njcFile = new NJCFile();
      // njcFile.setConfig(_config);
      njcFile.setConfig(InitMobileConfipParams);
      njcFile.setOMs(oms);
      njcFile.setUMs(ums);
      njcFile.setTMs(tms);
      njcFile.setSMs(sms);
      _engine.setNJCFile(njcFile).then(() => {
        // エンジンにセット
        setEngine(_engine);
      });
    };

    load();

    return () => {
      setEngine(undefined);
    }
  }, []);

  return (
    <>
      <div id="Ninjaviewer" style={{ height: "100%" }}>
        {engine &&
          <NinjaEngineContext.Provider value={engine}>
            <NinjaCanvas />
          </NinjaEngineContext.Provider>
        }
      </div>
    </>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* <Showcase /> */}
    <DebugPlay />
  </React.StrictMode>
);
