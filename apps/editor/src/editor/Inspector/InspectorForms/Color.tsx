import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const Color = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const om = id? editor.getOMById(id): null;
  const { t } = useTranslation();

  const [color, setColor] = useState<string>();

  useEffect(() => {
    if (om && om.args.color) setColor(om.args.color);
  }, [om]);

  /**
   * 色属性の変更
   */
  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (id) {
      editor.setArg(id, "color", e.target.value);
    }
    setColor(e.target.value);
  };

  return (
    <div>
      <div>{t("color")}</div>
      <div>
        <input
          type={"color"}
          value={color}
          onChange={(e) => changeColor(e)}
          onFocus={() => (editorStore.editorFocus = true)}
          onBlur={() => (editorStore.editorFocus = false)}
          defaultValue={"#ffffff"}
        />
        <input type={"text"} value={color} />
      </div>
    </div>
  );
};
