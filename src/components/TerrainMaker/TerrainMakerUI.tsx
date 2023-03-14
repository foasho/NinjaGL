import { useContext, useEffect, useState } from "react"
import { TerrainMakerContext } from "./TerrainMakerManager"

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
}

export const TerrainMakerUI = () => {
  const terrainManager = useContext(TerrainMakerContext);
  const [mode, setMode] = useState<"view" | "edit">(terrainManager.mode);
  const [wf, setWF] = useState<boolean>(terrainManager.wireFrame);
  const [power, setPower] = useState<number>(terrainManager.power);
  const [radius, setRadius] = useState<number>(terrainManager.radius);
  const [mapSize, setMapSize] = useState<number>(terrainManager.mapSize);
  const [mapResolution, setMapResolution] = useState<number>(terrainManager.mapResolution);
  const [color, setColor] = useState<string>(terrainManager.color);

  const keyDown = (event: HTMLElementEvent<HTMLInputElement>) => {
    if (event.code.toString() == "KeyE") {
      terrainManager.changeMode();
      setMode(terrainManager.mode);
    }
  }

  useEffect(() => {
    setMode(terrainManager.mode);
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    }
  }, []);

  const changeMode = () => {
    terrainManager.changeMode();
    setMode(terrainManager.mode);
  }

  const changeWF = () => {
    terrainManager.changeWireFrame();
    setWF(terrainManager.wireFrame);
  }

  const changePower = (e: any) => {
    terrainManager.changePower(Number(e.target.value));
    setPower(Number(e.target.value));
  }

  const changeRadius = (e: any) => {
    terrainManager.changeRaduis(Number(e.target.value));
    setRadius(Number(e.target.value));
  }

  const changeMapSize = (e) => {
    if (e.target.value && Number(e.target.value) > 0) {
      setMapSize(Number(e.target.value));
    }
  }

  const changeMapResolution = (e) => {
    if (e.target.value && Number(e.target.value) > 0) {
      setMapResolution(Number(e.target.value));
    }
  }

  const changeColor = (e) => {
    setColor(e.target.value);
    terrainManager.changeColor(e.target.value);
  }

  const updateMap = () => {
    terrainManager.changeMapSize(mapSize);
    terrainManager.changeMapResolution(mapResolution);
    terrainManager.reset();
  }

  return (
    <>
      <div style={{ position: "fixed", zIndex: 99999, width: "250px", top: "10px", right: "10px" }}>
        <div style={{ background: "#121212", color: "#ffffff", padding: "5px" }}>
          <div style={{ padding: "3px" }}>
            [ Eキーでモード切替 ]
          </div>
          <div style={{ padding: "3px" }}>
            <a onClick={() => changeMode()}>
              モード: {mode == "view" ? "表示" : "編集"}
            </a>
          </div>
          <div style={{ padding: "3px" }}>
            <a onClick={() => changeWF()}>
              ワイヤーフレーム: {wf.toString()}
            </a>
          </div>
          <div style={{ padding: "3px" }}>
            変形する強さ: {power}
          </div>
          <div style={{ padding: "3px" }}>
            <input type={"range"} value={power} onInput={(e) => changePower(e)} min={0.01} max={0.29} step={0.01} />
          </div>
          <div style={{ padding: "3px" }}>
            範囲: {radius}
          </div>
          <div style={{ padding: "3px" }}>
            <input type={"range"} value={radius} onInput={(e) => changeRadius(e)} min={0.1} max={10.0} step={0.1} />
          </div>
          <div style={{ padding: "3px" }}>
            色: {color}
          </div>
          <div style={{ padding: "3px" }}>
            <input type={"color"} value={color} onInput={(e) => changeColor(e)} />
          </div>
          <div style={{ padding: "3px", fontWeight: "bold", color: "#8888ff", cursor: "pointer" }}>
            <a onClick={() => terrainManager.exportTerrainMesh("terrain.glb")} >
              モデルを保存(.glb)
            </a>
          </div>
        </div>
      </div>
      <div style={{ position: "fixed", zIndex: 99999, width: "100px", top: "10px", left: "10px" }}>
        <div style={{ background: "#121212", color: "#ffffff", padding: "5px" }}>
          <div>
            半径サイズ
          </div>
          <div>
            <input style={{ width: "50px" }} type={"number"} min={1} value={mapSize} onChange={(e) => changeMapSize(e)} />
          </div>
          <div>
            解像度
          </div>
          <div>
            <input style={{ width: "50px" }} type={"number"} min={4} value={mapResolution} onChange={(e) => changeMapResolution(e)} />
          </div>
          <div style={{ paddingTop: "8px" }}>
            <button onClick={() => updateMap()}>変更を反映</button>
          </div>
        </div>
      </div>
    </>
  )
}