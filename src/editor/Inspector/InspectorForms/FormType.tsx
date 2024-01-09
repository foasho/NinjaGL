import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { normalStyles } from "@/utils/styles";

export const FormType = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  // Lightformerの設定
  const [form, setForm] = useState<{ value: "circle" | "ring" | "rect"; label: string }>();

  // Formの選択肢
  const formOptions: { value: "circle" | "ring" | "rect"; label: string }[] = [
    { value: "circle", label: t("circle") },
    { value: "ring", label: t("ring") },
    { value: "rect", label: t("rect") },
  ];

  useEffect(() => {
    if (om && om.args.form) setForm(formOptions.find((option) => option.value == om.args.form));
  }, [om]);

  /**
   * Formの変更
   */
  const changeForm = (selectForm) => {
    if (id) editor.setArg(id, "form", selectForm.value);
    setForm(selectForm);
  };

  return (
    <div>
      <div>{t("form")}</div>
      <div>
        <Select options={formOptions} value={form} onChange={(select) => changeForm(select)} styles={normalStyles} />
      </div>
    </div>
  );
};
