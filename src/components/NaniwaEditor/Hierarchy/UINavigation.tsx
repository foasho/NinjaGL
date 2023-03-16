import { IObjectManagement, IUIManagement } from "@/engine/Core/NaniwaProps";
import { useState, useRef, useContext, useEffect } from "react"
import styles from "@/App.module.scss";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { BsBox } from "react-icons/bs";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Swal from "sweetalert2";

/**
 * UI表示コンポネント
 * @returns 
 */
export const UINavigation = () => {
    const[uis, setUIs] = useState<IUIManagement[]>([]);
    return (
        <>
            <div>
              <div className={styles.title}>
                UIナビゲーター
              </div>
              <div className={styles.tree}>
                {uis.map((ui, idx) => {
                  return (
                    <UIItem ui={ui} index={idx} isSelect={false} />
                  )
                })}
              </div>
            </div>
        </>
    )
}

interface IUIItem {
    index: number;
    ui: IUIManagement;
    isSelect: boolean;
  }
const UIItem = (prop: IUIItem) => {
    const ref = useRef<HTMLDivElement>();
    const editor = useContext(NaniwaEditorContext);
    let lineStyle = styles.lightLine;
    if (prop.index % 2 !== 0) {
      lineStyle = styles.darkLine;
    }
    const [name, setName] = useState<string>("名称未設定UI");
    let typeIcon = (<BsBox />); // デフォルトObject型
  
    let visibleIcon = (<AiFillEye />);
    if (prop.ui.visiableType == "none") {
      visibleIcon = (<AiFillEyeInvisible />);
    }
    useEffect(() => {
      if (prop.ui.name) {
        setName(prop.ui.name);
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
          <div className={styles.name} onDoubleClick={changeName}>
            {name}
          </div>
          <div className={styles.visible}>
            {visibleIcon}
          </div>
        </div>
      </>
    )
  }