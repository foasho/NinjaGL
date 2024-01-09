import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const WidthHeight = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);

  useEffect(() => {
    if (om && om.args.width) setWidth(om.args.width);
    if (om && om.args.height) setHeight(om.args.height);
  }, [om]);

  /**
   * Widthの変更
   */
  const changeWidth = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "width", Number(targetValue));
      setWidth(Number(targetValue));
    }
  };

  /**
   * Heightの変更
   */
  const changeHeight = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "height", Number(targetValue));
      setHeight(Number(targetValue));
    }
  };

  return (
    <>
      <div>
        <div>
          {t("width")}: {width}
        </div>
        <div>
          <input type={"range"} min={0} max={100} step={0.1} value={width} onChange={(e) => changeWidth(e)} />
        </div>
      </div>
      <div>
        <div>
          {t("height")}: {height}
        </div>
        <div>
          <input type={"range"} min={0} max={100} step={0.1} value={height} onChange={(e) => changeHeight(e)} />
        </div>
      </div>
    </>
  );
};
