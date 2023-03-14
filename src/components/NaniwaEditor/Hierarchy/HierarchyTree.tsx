import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/core/NaniwaProps"
import { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { BsBox } from "react-icons/bs";
import { MdTerrain } from "react-icons/md";
import Swal from "sweetalert2";

interface IHierarchyTree {
  oms: IObjectManagement[];
}

export const HierarchyTree = (props: IHierarchyTree) => {

  return (
    <>
      <div>
        <div className={styles.title}>
          オブジェクト一覧
        </div>
        <div className={styles.tree}>
          {props.oms.map((om, idx) => {
            return (
              <TreeItem om={om} index={idx} />
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
}
const TreeItem = (prop: ITreeItem) => {
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    lineStyle = styles.darkLine;
  }
  const [name, setName] = useState<string>("未設定オブジェクト");
  let typeIcon = (<BsBox />);
  if (prop.om.type == "terrain") {
    typeIcon = (<MdTerrain />);
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

  return (
    <>
      <div className={`${styles.treeNode} ${lineStyle}`}>
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