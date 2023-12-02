import { useEffect, useRef, useState } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { useTranslation } from 'react-i18next';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BsBox, BsLightbulbFill, BsPersonFill } from 'react-icons/bs';
import { MdTerrain } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useSnapshot } from 'valtio';

import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const HierarchyTree = () => {
  const { oms, getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const [selectOM, setSelectOM] = useState<IObjectManagement | null>(null);

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
        <div className='select-none pl-[10px] text-sm font-bold text-white'>{t('objects')}</div>
        <div className='m-0 h-[25vh] min-h-[100px] overflow-y-auto overflow-x-hidden rounded-sm border-1 border-[#6e6b6b] p-2'>
          {oms.map((om, idx) => {
            let isSelect = false;
            if (selectOM && selectOM == om) {
              isSelect = true;
            }
            return <TreeItem om={om} index={idx} isSelect={isSelect} key={idx} />;
          })}
        </div>
      </div>
    </>
  );
};

interface ITreeItem {
  index: number;
  om: IObjectManagement;
  isSelect: boolean;
}
const TreeItem = (prop: ITreeItem) => {
  const state = useSnapshot(globalStore);
  const ref = useRef<HTMLDivElement>(null);
  const { onOMIdChanged, offOMIdChanged, setName, setVisible } = useNinjaEditor();
  const [visible, setLocalVisible] = useState<boolean>(true);
  const { t } = useTranslation();
  const { om } = prop;
  const id = om.id;
  let lineStyle = 'text-white bg-[#797272]';
  if (prop.index % 2 !== 0) {
    lineStyle = 'text-gray-300 bg-[#4b4848]';
  }
  let className = `text-xs py-0.5 px-1.25 items-center ${lineStyle}`;
  if (prop.isSelect) {
    className += ' border border-[1.5px] border-[#43D9D9]';
  }
  let typeIcon = <BsBox />; // デフォルトObject型
  if (prop.om.type == 'terrain') {
    typeIcon = <MdTerrain />;
  } else if (prop.om.type == 'light') {
    typeIcon = <BsLightbulbFill />;
  } else if (prop.om.type == 'avatar') {
    typeIcon = <BsPersonFill />;
  }

  let visibleIcon = <AiFillEye />;
  if (!visible) {
    visibleIcon = <AiFillEyeInvisible />;
  }

  useEffect(() => {}, []);

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
        return inputStr;
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      },
    }).then((result) => {
      if (result.value) {
        setName(id, result.value);
      }
    });
  };

  /**
   * 表示非表示切り替え
   */
  const changeVisible = () => {
    const changeVisible = !visible;
    if (!changeVisible) {
      state.hiddenList.includes(id) ? null : globalStore.hiddenList.push(id);
    } else {
      const index = state.hiddenList.indexOf(id);
      if (index !== -1) {
        globalStore.hiddenList.splice(index, 1);
      }
    }
    setVisible(id, !visible);
    setLocalVisible(!visible);
  };

  /**
   * 選択/非選択を切り替える
   */
  const onSelectObject = () => {
    if (ref.current!.classList.contains('select')) {
      state.init();
    } else {
      globalStore.currentId = prop.om.id;
    }
  };

  return (
    <>
      <div className={className} ref={ref}>
        <div className='pr-0.75 inline-block align-middle text-sm'>{typeIcon}</div>
        <div
          className='pl-0.75 inline-block cursor-pointer select-none'
          onClick={onSelectObject}
          onDoubleClick={changeName}
        >
          {prop.om.name}
        </div>
        <div className='float-right inline-block cursor-pointer align-middle text-sm' onClick={() => changeVisible()}>
          {visibleIcon}
        </div>
      </div>
    </>
  );
};
