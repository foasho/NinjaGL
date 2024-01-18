import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

/**
 * ChatGPT用のシステム設定
 */
export const SystemContent = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = id ? editor.getOMById(id) : null;

  const updateSystem = (e: any) => {
    if (id && e.target.value) {
      editor.setArg(id, "system", e.target.value);
    }
  };

  return (
    <div className='mt-2'>
      <div className='text-sm font-bold'>{t("system")}</div>
      <div className='flex w-full justify-between'>
        <input
          type='text'
          placeholder={om && om.args.system ? om.args.system : ""}
          onChange={updateSystem}
          className='mr-0.5 w-[calc(100%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none'
        />
      </div>
    </div>
  );
};
