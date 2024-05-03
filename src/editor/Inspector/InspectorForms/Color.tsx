import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const Color = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const om = editor.getOMById(id);
  const { t } = useTranslation();

  const [color, setColor] = useState<string>("#FFFFFF");

  useEffect(() => {
    if (om && om.args.color) setColor(om.args.color);
  }, [om]);

  /**
   * 色属性の変更
   */
  const changeColor = (e) => {
    if (id) {
      editor.setArg(id, "color", e.target.value);
    }
    setColor(e.target.value);
  };

  return (
    <div className='mt-3'>
      <div className='text-sm font-bold'>{t("color")}</div>
      <div className='flex items-center pt-0.5 leading-[30px]'>
        {/* <input
          type={"color"}
          value={color}
          onChange={(e) => changeColor(e)}
          onFocus={() => (editorStore.editorFocus = true)}
          onBlur={() => (editorStore.editorFocus = false)}
          defaultValue={"#ffffff"}
        />
        <input type={"text"} value={color} /> */}
        <input
          type={"color"}
          value={color}
          onChange={(e) => changeColor(e)}
          onFocus={() => (editorStore.editorFocus = true)}
          onBlur={() => (editorStore.editorFocus = false)}
          className='h-7 w-7 cursor-pointer rounded-full border-none bg-transparent p-0 shadow-lg outline-none'
        />
        <input
          type={"text"}
          value={color}
          onChange={(e) => {
            // HEXのみを許可
            if (e.target.value.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)) {
              changeColor(e);
            }
          }}
          className='mx-auto w-3/4 rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-sm text-[#f2f2f2] shadow-lg outline-none'
        />
      </div>
    </div>
  );
};
