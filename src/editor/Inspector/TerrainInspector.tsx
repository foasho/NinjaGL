import styles from "@/App.module.scss";
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";
import { GiFlatPlatform, GiMountainCave, GiMountaintop, GiPaintBrush } from "react-icons/gi";
import { useSnapshot } from "valtio";
import { globalTerrainStore } from "../Store";
import { isNumber } from "@/commons/functional";

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
  button?: number;
}


export const TerrainInspector = ({ onSave }) => {
  const terrainState = useSnapshot(globalTerrainStore);
  const { t } = useTranslation();

  const changeWF = () => {
    globalTerrainStore.wireFrame = !terrainState.wireFrame;
  }

  const changePower = (e: any) => {
    if (isNumber(e.target.value)){
      globalTerrainStore.power = Number(e.target.value);
    }
  }

  const changeRadius = (e: any) => {
    if (isNumber(e.target.value)) globalTerrainStore.radius = Number(e.target.value);
  }

  const changeMapSize = (e) => {
    if (
      e.target.value && Number(e.target.value) > 0 &&
      e.target.value && Number(e.target.value) < 4096
    ) {
      if (isNumber(e.target.value)) globalTerrainStore.mapSize = Number(e.target.value);
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
      if (isNumber(e.target.value)) globalTerrainStore.mapResolution = Number(e.target.value);
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
    globalTerrainStore.color = e.target.value;
  }

  const changeBrush = (brushType: "normal" | "flat" | "paint") => {
    globalTerrainStore.brush = brushType;
  }

  return (
    <div className={styles.terrainui}>
      <div className={styles.mode}>
        <div className={styles.title}>{t("mode")}</div>
        <div className={styles.select}>
          <span className={terrainState.mode == "view" ? styles.active : styles.disable}>
            {t("view")}
          </span>
          <span className={terrainState.mode == "edit" ? styles.active : styles.disable}>
            {t("edit")}
          </span>
        </div>
      </div>
      <div className={styles.type}>
        <div className={styles.title}>{t("brushType")}</div>
        <div className={styles.select}>
          <div
            className={(terrainState.brush == "normal" ? styles.active : styles.disable) + ` ${styles.brush}`}
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
            className={(terrainState.brush == "flat" ? styles.active : styles.disable) + ` ${styles.brush}`}
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
            className={(terrainState.brush == "paint" ? styles.active : styles.disable) + ` ${styles.brush}`}
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
            // checked={terrainState.wireFrame} 
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
            value={terrainState.power}
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
            value={terrainState.radius}
            onInput={(e) => changeRadius(e)}
            min={0.1}
            max={terrainState.mapSize/4}
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
            value={terrainState.color}
            onInput={(e) => changeColor(e)}
          />
          <input 
            type={"text"} 
            min={1} 
            max={4096} 
            // value={terrainState.mapSize} 
            placeholder={terrainState.mapSize?.toString()}
            // onChange={(e) => changeMapSize(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changeMapSize(e);
              }
            }}
          />
          <input 
            type={"text"} 
            min={4} 
            max={4096} 
            // value={terrainState.mapResolution} 
            placeholder={terrainState.mapResolution?.toString()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changeMapResolution(e);
              }
            }}
          />
        </div>
      </div>
      <div className={styles.save}>
        <a className={styles.btn} onClick={() => onSave()} >
          {t("saveTerrain")}
        </a>
      </div>
    </div>
  )
}