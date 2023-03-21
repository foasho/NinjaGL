import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/Core/NinjaProps"
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { BsBox, BsLightbulbFill, BsPersonFill } from "react-icons/bs";
import { MdTerrain } from "react-icons/md";
import Swal from "sweetalert2";
import { NinjaEditorContext } from "../NinjaEditorManager";

export const HierarchyTree = () => {
  const editor = useContext(NinjaEditorContext);
  const [oms, setOMs] = useState<IObjectManagement[]>([]);
  const [selectOM, setSelectOM] = useState<IObjectManagement>();
  const { t } = useTranslation();
  
  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 10);
    return () => clearInterval(interval);
  }, [oms, selectOM])

  const myFrame = () => {
    if (oms.length !== editor.getObjectManagements().length) {
      setOMs([...editor.getObjectManagements()]);
    }
    // selectOMが変わったら再レンダ
    if (selectOM !== editor.getSelectOM()){
      setSelectOM(editor.getSelectOM());
    }
  }

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
              <TreeItem om={om} index={idx} isSelect={isSelect} />
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
  const ref = useRef<HTMLDivElement>();
  const editor = useContext(NinjaEditorContext);
  const { t } = useTranslation();
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    lineStyle = styles.darkLine;
  }
  const [name, setName] = useState<string>(`${t("nonNameObject")}`);
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
  if (prop.om.visiableType == "none") {
    visibleIcon = (<AiFillEyeInvisible />);
  }
  useEffect(() => {
    if (prop.om.name) {
      setName(prop.om.name);
    }
  }, []);

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
        setName(result.value);
      }
    });
  }

  const onClick = () => {
    if (ref.current.classList.contains(styles.select)){
      editor.unSelectObject(prop.om.id);
    }
    else {
      editor.selectObject(prop.om.id);
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
        <div className={styles.name} onClick={onClick} onDoubleClick={changeName}>
          {name}
        </div>
        <div className={styles.visible}>
          {visibleIcon}
        </div>
      </div>
    </>
  )
}