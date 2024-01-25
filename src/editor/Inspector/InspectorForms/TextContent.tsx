import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

/**
 * TextContent用のシステム設定
 */
export const TextContent = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const updateContent = (e: any) => {
    if (id && e.target.value) {
      editor.setArg(id, "content", e.target.value);
    }
  };

  return (
    <div className='mt-2'>
      <div className='text-sm font-bold'>{t("content")}</div>
      <div className='flex w-full justify-between'>
        <input
          type='text'
          placeholder={om && om.args.content ? om.args.content : "Text"}
          onChange={updateContent}
          className='mr-0.5 w-[calc(100%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none'
        />
      </div>
    </div>
  );
};
