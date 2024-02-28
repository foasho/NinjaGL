import { useTranslation } from "react-i18next";
import { Textarea } from "@nextui-org/react";
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
  const om = editor.getOMById(id);

  const updateSystem = (e: any) => {
    if (id && e.target.value) {
      editor.setArg(id, "system", e.target.value);
    }
  };

  return (
    <div className='mt-2'>
      <div className='text-sm font-bold'>{t("systemPropmt")}</div>
      <div className='flex w-full justify-between'>
        <Textarea
          label={"System (GPT-3.5)"}
          placeholder={om && om.args.system ? om.args.system : ""}
          onChange={updateSystem}
          w-full
        />
      </div>
    </div>
  );
};
