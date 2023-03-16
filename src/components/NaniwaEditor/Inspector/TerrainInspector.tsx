import styles from "@/App.module.scss";
import { useContext, useEffect, useState } from "react";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import Swal from 'sweetalert2';
import { reqApi } from "@/services/ServciceApi";
import axios from "axios";

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
  button?: number;
}


export const TerrainInspector = () => {
  const editor = useContext(NaniwaEditorContext);
  const terrainManager = editor.terrainManager;
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
    if (
      e.target.value && Number(e.target.value) > 0 &&
      e.target.value && Number(e.target.value) < 4096
    ) {
      setMapSize(Number(e.target.value));
    }
    else if (e.target.value && Number(e.target.value) >= 4096){
      Swal.fire(
        {
          icon: 'error',
          title: '値が大きすぎます'
        }
      )
    }
  }

  const changeMapResolution = (e) => {
    if (
      e.target.value && Number(e.target.value) > 0 &&
      e.target.value && Number(e.target.value) < 4096
    ) {
      setMapResolution(Number(e.target.value));
    }
    else if (e.target.value && Number(e.target.value) >= 4096){
      Swal.fire(
        {
          icon: 'error',
          title: '値が大きすぎます'
        }
      )
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

  /**
   * 地形データを送信/保存する
   */
  const saveTerrain = async () => {
    const file = await terrainManager.exportTerrainMesh();

    Swal.fire({
      title: 'ファイル名をいれてください',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '実行',
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        console.log(inputStr, 'preConfirm起動');

        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage('1文字以上いれてね');
        }

        const formData = new FormData();
        formData.append('file', file, `${inputStr}.ter`);
        return await reqApi({
          route: "uploadgltf",
          method: "POST",
          formData: formData,
          contentType: "form"
        }).then((res) => {
          if (res.status == 200) {
            return res.data;
          }
        });
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      }
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '保存しました!'
          , text: '結果:' + result.value
        });
      }
    });
  }

  return (
    <div className={styles.terrainui}>
      <div className={styles.mode}>
        <div className={styles.title}>モード</div>
        <div className={styles.select}>
          <span className={mode == "view" ? styles.active : styles.disable}>
            表示
          </span>
          <span className={mode == "edit" ? styles.active : styles.disable}>
            編集
          </span>
        </div>
      </div>
      <div className={styles.type}>
        <div className={styles.title}>ブラシ種別</div>
        <div className={styles.select}>
          <span>通常</span>
          <span>平坦化</span>
          <span>ペイント</span>
        </div>
      </div>
      <div className={styles.wire}>
        <div className={styles.title}>
          ワイヤーフレーム
        </div>
        <div className={styles.input}>
          <input 
            className={styles.checkbox} 
            type="checkbox" 
            onInput={() => changeWF()} 
            checked={wf} 
          />
        </div>
      </div>
      <div className={styles.range}>
        <div className={styles.title}>
          変形させる強さ
        </div>
        <div>
          <input
            className={styles.customRange}
            type={"range"}
            value={power}
            onInput={(e) => changePower(e)}
            min={0.01}
            max={0.29}
            step={0.01}
          />
        </div>
      </div>
      <div className={styles.range}>
        <div className={styles.title}>
          変形させる範囲
        </div>
        <div>
          <input
          className={styles.customRange}
            type={"range"}
            value={radius}
            onInput={(e) => changeRadius(e)}
            min={0.1}
            max={10.0}
            step={0.1}
          />
        </div>
      </div>
      <div className={styles.inputArea}>
        <div className={styles.name}>
          <div></div>
          <div>サイズ</div>
          <div></div>
          <div>解像度</div>
        </div>
        <div className={styles.inputContainer}>
          <input
            type={"color"}
            value={color}
            onInput={(e) => changeColor(e)}
          />
          <input type={"text"} min={1} max={4096} value={mapSize} onChange={(e) => changeMapSize(e)} />
          <input type={"text"} min={4} max={4096} value={mapResolution} onChange={(e) => changeMapResolution(e)} />
        </div>
      </div>
      <div className={styles.change}>
        <a className={styles.btn} onClick={() => updateMap()}>
          変更を反映
        </a>
      </div>
      <div className={styles.save}>
        <a className={styles.btn} onClick={() => saveTerrain()} >
          地形モデルを保存
        </a>
      </div>
    </div>
  )
}