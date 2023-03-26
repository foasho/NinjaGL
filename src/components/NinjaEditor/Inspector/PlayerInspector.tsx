import { useContext, useEffect, useState } from "react"
import { NinjaEditorContext } from "../NinjaEditorManager"
import Select from 'react-select';
import styles from "@/App.module.scss";
import { GiPoolDive } from "react-icons/gi";
import Swal from "sweetalert2";
import { reqApi } from "@/services/ServciceApi";
import { useTranslation } from "react-i18next";
import { convertObjectToBlob } from "@/engine/Core/NinjaExporter";

export const PlayerInspector = () => {
  const [selectedOption, setSelectedOption] = useState<{ value: string, label: string }>(null);
  const editor = useContext(NinjaEditorContext);
  const [playerManager, setPlayerManager] = useState(editor.playerManager);
  const [playerType, setPlayerType] = useState<{ value: string, label: string }>({ value: "avatar", label: "操作プレイヤー" });
  const [idleOption, setIdleOption] = useState<{ value: string, label: string }>(null);
  const [walkOption, setWalkOption] = useState<{ value: string, label: string }>(null);
  const [runOption, setRunOption] = useState<{ value: string, label: string }>(null);
  const [jumpOption, setJumpOption] = useState<{ value: string, label: string }>(null);
  const [actionOption, setActionOption] = useState<{ value: string, label: string }>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 10);
    return () => clearInterval(interval);
  }, [playerManager])

  const myFrame = () => {
    if (editor.getPlayerManager().object != playerManager.object) {
      setPlayerManager(editor.getPlayerManager());
    }
  }

  const options: { value: string, label: string }[] = [];
  playerManager.animations.map((anim, idx) => {
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

  const onHandleChange = (selected: { value: string, label: string }) => {
    setSelectedOption(selected);
    editor.setSelectPlayerAnimation(selected.label);
  }

  const onHandleChangeType = (selected: { value: string, label: string }) => {
    setPlayerType(selected);
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
    if (playerType) {
      //ファイル名の確認
      const target = playerManager.object;
      target.animations = playerManager.animations;
      const file = await convertObjectToBlob(target);
      Swal.fire({
        title: t("inputFileName"),
        input: 'text',
        showCancelButton: true,
        confirmButtonText: t("confirmSave"),
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return Swal.showValidationMessage(t("leastInput"));
          }

          const formData = new FormData();
          formData.append('file', file, `${inputStr}.avt`);
          return await reqApi({
            route: "uploadgltf",
            method: "POST",
            formData: formData,
            contentType: "form"
          }).then((res) => {
            if (res.status == 200) {
              return res.data;
            }
          });
        },
        allowOutsideClick: function () {
          return !Swal.isLoading();
        }
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: t("completeSave")
            , text: result.value
          });
        }
      });
    }
  }

  return (
    <>
      {playerManager.object &&
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
      }
    </>
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