import { IObjectManagement, IUIManagement } from '@ninjagl/core';
import { useState, useRef, useContext, useEffect } from 'react';
import styles from '@/App.module.scss';
import { BsBox } from 'react-icons/bs';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

/**
 * UI表示コンポネント
 * @returns
 */
export const UINavigation = () => {
  const [uis, setUIs] = useState<IUIManagement[]>([]);
  const { t } = useTranslation();
  return (
    <>
      <div>
        <div className={styles.tree}>
          {uis.map((ui, idx) => {
            return <UIItem ui={ui} index={idx} isSelect={false} key={idx} />;
          })}
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
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    lineStyle = styles.darkLine;
  }
  const [name, setName] = useState<string>(t('nonNameUI') as string);
  let typeIcon = <BsBox />; // デフォルトObject型

  let visibleIcon = <AiFillEye />;
  // if (prop.ui.visibleType == "none") {
  //   visibleIcon = (<AiFillEyeInvisible />);
  // }
  useEffect(() => {
    if (prop.ui.name) {
      setName(prop.ui.name);
    }
  }, []);

  const changeName = async () => {
    // @ts-ignore
    Swal.fire({
      title: t('changeName'),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: t('change'),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        //バリデーションを入れたりしても良い
        if (inputStr.length == 0) {
          return Swal.showValidationMessage(t('leastInput'));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      },
    }).then((result) => {
      if (result.value) {
        setName(result.value);
      }
    });
  };

  let className = `${styles.treeNode} ${lineStyle}`;
  if (prop.isSelect) {
    className += ` ${styles.select}`;
  }

  return (
    <>
      <div className={className} ref={ref}>
        <div className={styles.type}>{typeIcon}</div>
        <div className={styles.name} onDoubleClick={changeName}>
          {name}
        </div>
        <div className={styles.visible}>{visibleIcon}</div>
      </div>
    </>
  );
};
