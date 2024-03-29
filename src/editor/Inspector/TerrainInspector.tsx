import { useTranslation } from "react-i18next";
import { GiFlatPlatform, GiMountaintop, GiPaintBrush } from "react-icons/gi";
import Swal from "sweetalert2";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";

import { landScapeStore } from "../Store/landscape";

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
  button?: number;
}

export const LandScapeInspector = ({ onSave }) => {
  const landScapeState = useSnapshot(landScapeStore);
  const { t } = useTranslation();

  const changeWF = () => {
    landScapeStore.wireFrame = !landScapeState.wireFrame;
  };

  const changePower = (e: any) => {
    if (isNumber(e.target.value)) {
      landScapeStore.power = Number(e.target.value);
    }
  };

  const changeRadius = (e: any) => {
    if (isNumber(e.target.value)) landScapeStore.radius = Number(e.target.value);
  };

  const changeMapSize = (e) => {
    if (e.target.value && Number(e.target.value) > 0 && e.target.value && Number(e.target.value) < 4096) {
      if (isNumber(e.target.value)) landScapeStore.mapSize = Number(e.target.value);
    } else if (e.target.value && Number(e.target.value) >= 4096) {
      // @ts-ignore
      Swal.fire({
        icon: "error",
        title: t("tooLarge"),
      });
    }
  };

  const changeMapResolution = (e) => {
    if (e.target.value && Number(e.target.value) > 0 && e.target.value && Number(e.target.value) < 4096) {
      if (isNumber(e.target.value)) landScapeStore.mapResolution = Number(e.target.value);
    } else if (e.target.value && Number(e.target.value) >= 4096) {
      // @ts-ignore
      Swal.fire({
        icon: "error",
        title: t("tooLarge"),
      });
    }
  };

  const changeMode = (mode: "view" | "edit") => {
    landScapeStore.mode = mode;
  };

  const changeColor = (e) => {
    landScapeStore.color = e.target.value;
  };

  const changeBrush = (brushType: "normal" | "flat" | "paint") => {
    landScapeStore.brush = brushType;
  };

  return (
    <div>
      <div>
        <div>{t("mode")}</div>
        <div>
          <span className={landScapeState.mode == "view" ? "" : ""} onClick={() => changeMode("view")}>
            {t("view")}
          </span>
          <span className={landScapeState.mode == "edit" ? "" : ""} onClick={() => changeMode("edit")}>
            {t("edit")}
          </span>
        </div>
      </div>
      <div>
        <div>{t("brushType")}</div>
        <div>
          <div className={(landScapeState.brush == "normal" ? "" : "") + ` `} onClick={() => changeBrush("normal")}>
            <div>
              <GiMountaintop />
            </div>
            <div>{t("brushNormal")}</div>
          </div>
          <div className={(landScapeState.brush == "flat" ? "" : "") + ` `} onClick={() => changeBrush("flat")}>
            <div>
              <GiFlatPlatform />
            </div>
            <div>{t("brushFlat")}</div>
          </div>
          <div className={(landScapeState.brush == "paint" ? "" : "") + ` `} onClick={() => changeBrush("paint")}>
            <div>
              <GiPaintBrush />
            </div>
            <div>{t("brushPaint")}</div>
          </div>
        </div>
      </div>
      <div>
        <div>{t("wireFrame")}</div>
        <div>
          <input
            type='checkbox'
            onInput={() => changeWF()}
            // checked={landScapeState.wireFrame}
          />
        </div>
      </div>
      <div>
        <div>{t("brushStrength")}</div>
        <div>
          <input
            type={"range"}
            value={landScapeState.power}
            onInput={(e) => changePower(e)}
            min={0.01}
            max={0.29}
            step={0.01}
          />
        </div>
      </div>
      <div>
        <div>{t("brushRange")}</div>
        <div>
          <input
            type={"range"}
            value={landScapeState.radius}
            onInput={(e) => changeRadius(e)}
            min={0.1}
            max={landScapeState.mapSize / 4}
            step={0.1}
          />
        </div>
      </div>
      <div>
        <div>
          <div></div>
          <div>{t("size")}</div>
          <div></div>
          <div>{t("resolution")}</div>
        </div>
        <div>
          <input type={"color"} value={landScapeState.color} onInput={(e) => changeColor(e)} />
          <input
            type={"text"}
            min={1}
            max={4096}
            // value={landScapeState.mapSize}
            placeholder={landScapeState.mapSize?.toString()}
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
            // value={landScapeState.mapResolution}
            placeholder={landScapeState.mapResolution?.toString()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changeMapResolution(e);
              }
            }}
          />
        </div>
      </div>
      <div>
        <a onClick={() => onSave()}>{t("saveTerrain")}</a>
      </div>
    </div>
  );
};
