import styles from "@/App.module.scss";
import { IObjectManagement } from "@/core/utils/NinjaProps"
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
  const [isSelect, setIsSelect] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(true);
  const { t } = useTranslation();
  const { om } = prop;
  const id = om.id;
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
  if (!visible) {
    visibleIcon = (<AiFillEyeInvisible />);
  }

  useEffect(() => {
    if (prop.om.name) {
      setName(prop.om.name);
    }
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
        editor.setName(id, result.value);
        setName(result.value);
      }
    });
  }

  /**
   * 表示非表示切り替え
   */
  const changeVisible = () => {
    editor.setVisible(id, !visible);
    setVisible(!visible);
  }

  /**
   * 選択/非選択を切り替える
   */
  const onSelectObject = () => {
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
        <div className={styles.name} onClick={onSelectObject} onDoubleClick={changeName}>
          {name}
        </div>
        <div className={styles.visible} onClick={() => changeVisible()}>
          {visibleIcon}
        </div>
      </div>
    </>
  )
}