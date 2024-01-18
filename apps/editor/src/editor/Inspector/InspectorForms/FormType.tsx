import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { normalStyles } from "@/utils/styles";

interface FormSelectProps {
  value: "circle" | "ring" | "rect";
  label: string;
}

export const FormType = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = id ? editor.getOMById(id) : null;

  // Lightformerの設定
  const [form, setForm] = useState<FormSelectProps>();

  // Formの選択肢
  const formOptions: FormSelectProps[] = [
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
  const changeForm = (selectForm: FormSelectProps) => {
    if (id) editor.setArg(id, "form", selectForm.value);
    setForm(selectForm);
  };

  return (
    <div>
      <div>{t("form")}</div>
      <div>
        <Select
          options={formOptions}
          value={form}
          onChange={(select) => changeForm(select as FormSelectProps)}
          styles={normalStyles}
        />
      </div>
    </div>
  );
};
