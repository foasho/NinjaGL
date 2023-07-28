import styles from "@/App.module.scss";
import { IObjectManagement } from "@ninjagl/core"
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { BsBox, BsLightbulbFill, BsPersonFill } from "react-icons/bs";
import { MdTerrain } from "react-icons/md";
import Swal from "sweetalert2";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const HierarchyTree = () => {
  const { oms, getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const [selectOM, setSelectOM] = useState<IObjectManagement>();
  // const selectOM = getOMById(id!);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      const om = getOMById(id);
      if (om) {
        setSelectOM(om);
      }
    }
  }, [id]);

  return (
    <>
      <div>
        <div className={styles.title}>
          {t("objects")}
        </div>
        <div className={styles.tree}>
          {oms.map((om, idx) => {
            let isSelect = false;
            if (selectOM == om){
              isSelect = true;
            }
            return (
              <TreeItem om={om} index={idx} isSelect={isSelect} key={idx} />
            )
          })}
        </div>
      </div>
    </>
  )
}

interface ITreeItem {
  index: number;
  om: IObjectManagement;
  isSelect: boolean;
}
const TreeItem = (prop: ITreeItem) => {
  const state = useSnapshot(globalStore);
  const ref = useRef<HTMLDivElement>(null);
  const {
    onOMIdChanged,
    offOMIdChanged,
    setName,
    setVisible,
  } = useContext(NinjaEditorContext);
  const [visible, setLocalVisible] = useState<boolean>(true);
  const { t } = useTranslation();
  const { om } = prop;
  const id = om.id;
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    lineStyle = styles.darkLine;
  }
  let typeIcon = (<BsBox />); // デフォルトObject型
  if (prop.om.type == "terrain") {
    typeIcon = (<MdTerrain />);
  }
  else if (prop.om.type == "light"){
    typeIcon = (<BsLightbulbFill/>);
  }
  else if (prop.om.type == "avatar"){
    typeIcon = (<BsPersonFill/>);
  }

  let visibleIcon = (<AiFillEye />);
  if (!visible) {
    visibleIcon = (<AiFillEyeInvisible />);
  }

  useEffect(() => {

  }, []);

  /**
   * 名前を変更
   */
  const changeName = async () => {
    Swal.fire({
      title: '名前の変更',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '変更',
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage('1文字以上いれてね');
        }
        return inputStr
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      }
    }).then((result) => {
      if (result.value) {
        setName(id, result.value);
      }
    });
  }

  /**
   * 表示非表示切り替え
   */
  const changeVisible = () => {
    const changeVisible = !visible;
    if (!changeVisible) {
      state.hiddenList.includes(id) ? null : globalStore.hiddenList.push(id);
    }
    else {
      const index = state.hiddenList.indexOf(id);
      if (index !== -1) { 
        globalStore.hiddenList.splice(index, 1);
      }
    }
    setVisible(id, !visible);
    setLocalVisible(!visible);
  }

  /**
   * 選択/非選択を切り替える
   */
  const onSelectObject = () => {
    if (ref.current!.classList.contains(styles.select)){
      state.init();
    }
    else {
      globalStore.currentId = prop.om.id;
    }
  }

  let className = `${styles.treeNode} ${lineStyle}`;
  if (prop.isSelect){
    className += ` ${styles.select}`
  }

  return (
    <>
      <div className={className} ref={ref}>
        <div className={styles.type}>
          {typeIcon}
        </div>
        <div className={styles.name} onClick={onSelectObject} onDoubleClick={changeName}>
          {prop.om.name}
        </div>
        <div className={styles.visible} onClick={() => changeVisible()}>
          {visibleIcon}
        </div>
      </div>
    </>
  )
}