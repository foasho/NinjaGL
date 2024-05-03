import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const DirectionalLightParams = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [shadowCameraSize, setShadowCameraSize] = useState<number>(80);
  const [bias, setBias] = useState<number>(-0.0001);
  const [normalBias, setNormalBias] = useState<number>(0.05);
  const [mapSizeHeight, setMapSizeHeight] = useState<number>(1024);
  const [mapSizeWidth, setMapSizeWidth] = useState<number>(1024);

  useEffect(() => {
    if (om && om.args.shadowCameraSize) setShadowCameraSize(om.args.shadowCameraSize);
    if (om && om.args.bias) setBias(om.args.bias);
    if (om && om.args.normalBias) setNormalBias(om.args.normalBias);
    if (om && om.args.mapSizeHeight) setMapSizeHeight(om.args.mapSizeHeight);
    if (om && om.args.mapSizeWidth) setMapSizeWidth(om.args.mapSizeWidth);
  }, [om]);

  /**
   * ShadowCameraSizeの変更
   */
  const changeShadowCameraSize = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "shadowCameraSize", Number(targetValue));
      setShadowCameraSize(Number(targetValue));
    }
  };

  /**
   * biasの変更
   */
  const changeBias = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "bias", Number(targetValue));
      setBias(Number(targetValue));
    }
  };

  /**
   * normalBiasの変更
   */
  const changeNormalBias = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "normalBias", Number(targetValue));
      setNormalBias(Number(targetValue));
    }
  };

  /**
   * mapSizeHeightの変更
   */
  const changeMapSizeHeight = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "mapSizeHeight", Number(targetValue));
      setMapSizeHeight(Number(targetValue));
    }
  };

  /**
   * mapSizeWidthの変更
   */
  const changeMapSizeWidth = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "mapSizeWidth", Number(targetValue));
      setMapSizeWidth(Number(targetValue));
    }
  };

  return (
    <>
      <div>
        <div>
          {t("shadowCameraSize")}: {shadowCameraSize}
        </div>
        <div>
          <input
            type={"range"}
            min={4}
            max={256}
            step={4}
            value={shadowCameraSize}
            onChange={(e) => changeShadowCameraSize(e)}
          />
        </div>
      </div>
      <div>
        <div>
          {t("bias")}: {bias}
        </div>
        <div>
          <input type={"range"} min={-0.001} max={0} step={0.00001} value={bias} onChange={(e) => changeBias(e)} />
        </div>
      </div>
      <div>
        <div>
          {t("normalBias")}: {normalBias}
        </div>
        <div>
          <input
            type={"range"}
            min={0.01}
            max={0.1}
            step={0.01}
            value={normalBias}
            onChange={(e) => changeNormalBias(e)}
          />
        </div>
      </div>
      <div>
        <div>
          {t("mapSizeHeight")}: {mapSizeHeight}
        </div>
        <div>
          <input
            type={"range"}
            min={512}
            max={4096}
            step={64}
            value={mapSizeHeight}
            onChange={(e) => changeMapSizeHeight(e)}
          />
        </div>
      </div>
      <div>
        <div>
          {t("mapSizeWidth")}: {mapSizeWidth}
        </div>
        <div>
          <input
            type={"range"}
            min={512}
            max={4096}
            step={64}
            value={mapSizeWidth}
            onChange={(e) => changeMapSizeWidth(e)}
          />
        </div>
      </div>
    </>
  );
};
