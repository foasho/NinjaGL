import styles from "@/App.module.scss";
import { useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import Swal from 'sweetalert2';
import { reqApi } from "@/services/ServciceApi";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { GiFlatPlatform, GiMountainCave, GiMountaintop, GiPaintBrush } from "react-icons/gi";

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
  button?: number;
}


export const TerrainInspector = () => {
  const editor = useContext(NinjaEditorContext);
  const terrainManager = editor.terrainManager;
  const [mode, setMode] = useState<"view" | "edit">(terrainManager.mode);
  const [brush, setBrush] = useState<"normal" | "flat" | "paint">(terrainManager.brush);
  const [wf, setWF] = useState<boolean>(terrainManager.wireFrame);
  const [power, setPower] = useState<number>(terrainManager.power);
  const [radius, setRadius] = useState<number>(terrainManager.radius);
  const [mapSize, setMapSize] = useState<number>(terrainManager.mapSize);
  const [mapResolution, setMapResolution] = useState<number>(terrainManager.mapResolution);
  const [color, setColor] = useState<string>(terrainManager.color);
  const { t } = useTranslation();

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
          title: t("tooLarge")
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
          title: t("tooLarge")
        }
      )
    }
  }

  const changeColor = (e) => {
    setColor(e.target.value);
    terrainManager.changeColor(e.target.value);
  }

  const changeBrush = (brushType: "normal" | "flat" | "paint") => {
    setBrush(brushType);
    terrainManager.changeBrush(brushType);
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
      title: t("inputFileName"),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '実行',
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage(t("leastInput"));
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
          title: t("completeSave")
          , text: result.value
        });
      }
    });
  }

  return (
    <div className={styles.terrainui}>
      <div className={styles.mode}>
        <div className={styles.title}>{t("mode")}</div>
        <div className={styles.select}>
          <span className={mode == "view" ? styles.active : styles.disable}>
            {t("view")}
          </span>
          <span className={mode == "edit" ? styles.active : styles.disable}>
            {t("edit")}
          </span>
        </div>
      </div>
      <div className={styles.type}>
        <div className={styles.title}>{t("brushType")}</div>
        <div className={styles.select}>
          <div
            className={(brush == "normal" ? styles.active : styles.disable) + ` ${styles.brush}`}
            onClick={() => changeBrush("normal")}
          >
            <div className={styles.icon}>
              <GiMountaintop/>
            </div>
            <div className={styles.name}>
              {t("brushNormal")}
            </div>
          </div>
          <div 
            className={(brush == "flat" ? styles.active : styles.disable) + ` ${styles.brush}`}
            onClick={() => changeBrush("flat")}
          >
            <div className={styles.icon}>
              <GiFlatPlatform/>
            </div>
            <div className={styles.name}>
              {t("brushFlat")}
            </div>
          </div>
          <div 
            className={(brush == "paint" ? styles.active : styles.disable) + ` ${styles.brush}`}
            onClick={() => changeBrush("paint")}
          >
            <div className={styles.icon}>
              <GiPaintBrush/>
            </div>
            <div className={styles.name}>
              {t("brushPaint")}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.wire}>
        <div className={styles.title}>
          {t("wireFrame")}
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
          {t("brushStrength")}
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
        {t("brushRange")}
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
          <div>{t("size")}</div>
          <div></div>
          <div>{t("resolution")}</div>
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
          {t("updateTerrain")}
        </a>
      </div>
      <div className={styles.save}>
        <a className={styles.btn} onClick={() => saveTerrain()} >
          {t("saveTerrain")}
        </a>
      </div>
    </div>
  )
}