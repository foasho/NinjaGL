import { useContext, useEffect, useState } from "react"
import { NinjaEditorContext } from "../NinjaEditorManager"
import Select from 'react-select';
import styles from "@/App.module.scss";
import { SkeletonUtils } from "three-stdlib";
import Swal from "sweetalert2";
import { reqApi } from "@/services/ServciceApi";
import { useTranslation } from "react-i18next";
import { convertObjectToFile } from "@ninjagl/core";
import { useSnapshot } from "valtio";
import { globalPlayerStore } from "../Store";
import { useSession } from "next-auth/react";
import { b64EncodeUnicode } from "@/commons/functional";
import { AnimationClip, MathUtils } from "three";

interface IPlayerInspectorProps {
  onSave: (animMapper: { [key: string]: string }) => void;
}
export const PlayerInspector = (props:IPlayerInspectorProps) => {
  const { data: session } = useSession();
  const playerState = useSnapshot(globalPlayerStore);
  const [selectedOption, setSelectedOption] = useState<{ value: string, label: string }>(null);
  const editor = useContext(NinjaEditorContext);
  const [playerType, setPlayerType] = useState<{ value: string, label: string }>({ value: "avatar", label: "操作プレイヤー" });
  const [idleOption, setIdleOption] = useState<{ value: string, label: string }>(null);
  const [walkOption, setWalkOption] = useState<{ value: string, label: string }>(null);
  const [runOption, setRunOption] = useState<{ value: string, label: string }>(null);
  const [jumpOption, setJumpOption] = useState<{ value: string, label: string }>(null);
  const [actionOption, setActionOption] = useState<{ value: string, label: string }>(null);
  const [customActions, setCustomActions] = useState<{ value: string, label: string, keyInputValue: string }[]>([]);
  const { t } = useTranslation();

  const options: { value: string, label: string }[] = [];
  globalPlayerStore.animations.map((anim, idx) => {
    options.push({
      value: idx.toString(),
      label: anim.name ? anim.name : `未設定${idx + 1}`
    });
  });

  const typeOptions: { value: string, label: string }[] = [
    { value: "avatar", label: "操作プレイヤー" },
    { value: "other", label: "他者プレイヤー" },
    { value: "npc", label: "NPC (敵など)" }
  ];

  useEffect(() => {
    const opt = options.find((opt) => opt.value === playerState.type);
    setPlayerType(opt);
  }, [playerState.type]);

  /**
   * アニメーションを変更
   * @param selected 
   */
  const onHandleChange = (selected: { value: string, label: string }) => {
    setSelectedOption(selected);
    editor.setSelectPlayerAnimation(selected.label);
  }

  /**
   * 種別の変更1
   * @param selected 
   */
  const onHandleChangeType = (selected: { value: "avatar"|"other"|"npc", label: string }) => {
    setPlayerType(selected);
    globalPlayerStore.type = selected.value;
  }

  const onHandleChangeIdle = (selected: { value: string, label: string }) => {
    setIdleOption(selected);
  }
  const onHandleChangeWalk = (selected: { value: string, label: string }) => {
    setWalkOption(selected);
  }
  const onHandleChangeRun = (selected: { value: string, label: string }) => {
    setRunOption(selected);
  }
  const onHandleChangeJump = (selected: { value: string, label: string }) => {
    setJumpOption(selected);
  }
  const onHandleChangeAction = (selected: { value: string, label: string }) => {
    setActionOption(selected);
  }

  /**
   * 保存する
   */
  const onSave = async () => {
    // 最低限typeが選択されていればOK
    if (playerState.type) {
      const animMapper: {[key: string]: string} = {};
      if (idleOption){
        animMapper.idle = idleOption.label;
      }
      if (walkOption){
        animMapper.walk = walkOption.label;
      }
      if (runOption){
        animMapper.run = runOption.label;
      }
      if (jumpOption){
        animMapper.jump = jumpOption.label;
      }
      if (actionOption){
        animMapper.action = actionOption.label;
      }
      customActions.map((option) => {
        animMapper[option.keyInputValue] = option.label;
      });
      props.onSave(animMapper);
    }
    else {
      Swal.fire({
        icon: 'error',
        title: t("error"),
        text: t("leastSelect"),
      });
    }
  }

  return (
    <div className={styles.inspector}>
      <div className={styles.playerInspector}>
        <div className={styles.selectAnim}>
          <div className={styles.title}>
            {t("animations")}
          </div>
          <div className={styles.select}>
            <Select
              options={options}
              value={selectedOption}
              onChange={onHandleChange}
              styles={normalStyles}
            />
          </div>
        </div>
        <div className={styles.selectType}>
          <div className={styles.title}>
            {t("type")}
          </div>
          <div className={styles.select}>
            <Select
              options={typeOptions}
              value={playerType}
              onChange={onHandleChangeType}
              styles={darkThemeStyles}
            />
          </div>
        </div>
        <div className={styles.motionMapper}>
          <div className={styles.title}>
            {t("motionSelect")}
          </div>
          <div className={styles.mappers}>
            <div className={styles.idle}>
              <div className={styles.name}>
                {t("idle")}
              </div>
              <div>
                <Select
                  options={options}
                  value={idleOption}
                  onChange={onHandleChangeIdle}
                  styles={darkThemeStyles}
                />
              </div>
            </div>
            <div className={styles.walk}>
              <div className={styles.name}>
                {t("walk")}
              </div>
              <div>
                <Select
                  options={options}
                  value={walkOption}
                  onChange={onHandleChangeWalk}
                  styles={darkThemeStyles}
                />
              </div>
            </div>
            <div className={styles.run}>
              <div className={styles.name}>
                {t("run")}
              </div>
              <div>
                <Select
                  options={options}
                  value={runOption}
                  onChange={onHandleChangeRun}
                  styles={darkThemeStyles}
                />
              </div>
            </div>
            <div className={styles.jump}>
              <div className={styles.name}>
                {t("jump")}
              </div>
              <div>
                <Select
                  options={options}
                  value={jumpOption}
                  onChange={onHandleChangeJump}
                  styles={darkThemeStyles}
                />
              </div>
            </div>
            <div className={styles.action1}>
              <div className={styles.name}>
                {t("action")}
              </div>
              <div>
                <Select
                  options={options}
                  value={actionOption}
                  onChange={onHandleChangeAction}
                  styles={darkThemeStyles}
                />
              </div>
            </div>
            <div className={styles.addAction}>
              <a className={styles.btn}>
                {t("addAction")}
              </a>
            </div>
          </div>
        </div>
        <div className={styles.save}>
          <a className={styles.btn} onClick={() => onSave()}>
            {t("saveAvatar")}
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * 選択肢のダークテーマスタイル
 */
const darkThemeStyles = {
  singleValue: (provided) => ({
    ...provided,
    color: '#43D9D9',
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: '#111',
    borderColor: '#555'
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#333',
  }),
  option: (styles, { isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor:
        isSelected
          ? '#555'
          : isFocused
            ? '#444'
            : 'transparent',
      color: isSelected ? '#fff' : '#fff',
    };
  },
};
const normalStyles = {
  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: '#111',
    borderColor: '#555'
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#333',
  }),
  option: (styles, { isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor:
        isSelected
          ? '#555'
          : isFocused
            ? '#444'
            : 'transparent',
      color: isSelected ? '#fff' : '#fff',
    };
  },
};