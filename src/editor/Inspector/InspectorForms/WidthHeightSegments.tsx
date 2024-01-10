import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const WidthHeightSegments = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [widthSegments, setWidthSegments] = useState<number>(12);
  const [heightSegments, setHeightSegments] = useState<number>(12);

  useEffect(() => {
    if (om && om.args.widthSegments) setWidthSegments(om.args.widthSegments);
    if (om && om.args.heightSegments) setHeightSegments(om.args.heightSegments);
  }, [om]);

  /**
   * WidthSegmentsの変更
   */
  const changeWidthSegments = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "widthSegments", Number(targetValue));
      setWidthSegments(Number(targetValue));
    }
  };

  /**
   * HeightSegmentsの変更
   */
  const changeHeightSegments = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, "heightSegments", Number(targetValue));
      setHeightSegments(Number(targetValue));
    }
  };

  return (
    <>
      <div>
        <div>
          {t("widthSegments")}: {widthSegments}
        </div>
        <div>
          <input type={"range"} min={1} max={100} step={1} value={widthSegments} onChange={(e) => changeWidthSegments(e)} />
        </div>
      </div>
      <div>
        <div>
          {t("heightSegments")}: {heightSegments}
        </div>
        <div>
          <input type={"range"} min={1} max={100} step={1} value={heightSegments} onChange={(e) => changeHeightSegments(e)} />
        </div>
      </div>
    </>
  );
};
