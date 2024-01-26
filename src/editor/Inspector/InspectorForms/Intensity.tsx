import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const Intensity = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [intensity, setIntensity] = useState<number>(1);

  useEffect(() => {
    if (om && om.args.intensity) setIntensity(om.args.intensity);
  }, [om]);

  /**
   * Intensityの変更
   */
  const changeIntensity = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "intensity", Number(targetValue));
      setIntensity(Number(targetValue));
    }
  };

  return (
    <>
      <div>
        <div>
          {t("intensity")}: {intensity}
        </div>
        <div>
          <input type={"range"} min={0} max={10} step={0.01} value={intensity} onChange={(e) => changeIntensity(e)} />
        </div>
      </div>
    </>
  );
};
