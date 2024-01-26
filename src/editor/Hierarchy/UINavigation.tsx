import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsFiletypeCss } from "react-icons/bs";
import { IUIManagement } from "@ninjagl/core";
import Swal from "sweetalert2";
import { useSnapshot } from "valtio";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { globalUIStore } from "../Store/Store";

/**
 * UI表示コンポネント
 * @returns
 */
export const UINavigation = () => {
  const { ums } = useNinjaEditor();
  const { t } = useTranslation();
  useEffect(() => {}, []);
  return (
    <>
      <div className='rounded-sm border-1 border-white p-1'>
        <div>
          {/* {ums.map((ui, idx) => {
            return <UIItem ui={ui} index={idx} isSelect={false} key={idx} />;
          })} */}
        </div>
      </div>
    </>
  );
};

interface IUIItem {
  index: number;
  ui: IUIManagement;
  isSelect: boolean;
}
const UIItem = (prop: IUIItem) => {
  const ref = useRef<HTMLDivElement>(null);
  const uistore = useSnapshot(globalUIStore);
  const { t } = useTranslation();
  let lineBgStyle = "bg-[#797272]";
  if (prop.index % 2 !== 0) {
    lineBgStyle = "bg-[#4b4848]";
  }
  const [name, setName] = useState<string>(prop.ui.name || (t("nonNameUI") as string));
  let typeIcon = <BsFiletypeCss className='mx-1 inline' />;

  const onClickItem = () => {
    if (uistore.currentId === prop.ui.id) {
      globalUIStore.currentId = null;
      return;
    }
    globalUIStore.currentId = prop.ui.id;
  };

  const changeName = async () => {
    // @ts-ignore
    Swal.fire({
      title: t("changeName"),
      input: "text",
      showCancelButton: true,
      confirmButtonText: t("change"),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage(t("leastInput"));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      },
    }).then((result) => {
      if (result.value) {
        prop.ui.name = result.value;
        setName(result.value);
      }
    });
  };

  let selectStyle = "";
  if (prop.ui.id === uistore.currentId) {
    selectStyle = "border-color-cyber border-1";
  }

  return (
    <>
      <div ref={ref} className={`text-xs ${lineBgStyle} ` + selectStyle} onClick={onClickItem}>
        <div onDoubleClick={changeName}>
          {typeIcon}
          {name}
        </div>
      </div>
    </>
  );
};
