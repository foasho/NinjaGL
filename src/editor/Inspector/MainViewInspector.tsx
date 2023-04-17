import styles from "@/App.module.scss";
import { IObjectManagement } from "ninja-core";
import { useRef, useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import Select from 'react-select';
import { reqApi } from "@/services/ServciceApi";
import { showLoDViewDialog } from "../Dialogs/LoDViewDialog";
import { Euler, Vector3, MathUtils, MeshStandardMaterial } from "three";
import { isNumber } from "@/commons/functional";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

export const MainViewInspector = () => {
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const [isPhysics, setIsPhysics] = useState<boolean>(false);
  const [isLod, setIsLod] = useState<boolean>(false);
  const [physics, setPhysics] = useState<{ value: string; label: string; }>();
  const [castShadow, setCastShadow] = useState<boolean>(true);
  const [receiveShadow, setreceiveShadow] = useState<boolean>(true);
  const [helper, setHelper] = useState<boolean>(false);
  const [background, setBackground] = useState<boolean>(true);
  const [visibleType, setVisibleType] = useState<{ value: "none"|"auto"|"force"; label: string; }>();
  const [materialType, setMaterialType] = useState<{ value: "standard"|"phong"|"tone"|"shader"; label: string;}>();
  const [color, setColor] = useState<string>();
  const [blur, setBlur] = useState<number>(0.5);
  const [environmentPreset, setEnvironmentPreset] = useState<{ value: "forest"|"sunset"|"dawn"|"night"; label: string; }>();
  const id = state.currentId;
  const selectOM = editor.getOMById(id);
  const [position, setPosition] = useState<Vector3>(selectOM?.object?.position ? selectOM.object.position.clone() : new Vector3());
  const [rotation, setRotation] = useState<Euler>(selectOM?.object?.rotation);
  const [scale, setScale] = useState<Vector3>(selectOM?.object?.scale);
  const { t } = useTranslation();

  
  // 物理判定選択肢
  const physicsOptions = [
    { value: "aabb", label: t("aabb") },
    { value: "along", label: t("along") }
  ];

  // 描画種別の選択肢
  const visibleTypeOptions: {value: "auto"|"force"|"none", label: string}[] = [
    { value: "auto", label: t("autoScaling") },
    { value: "force", label: t("visibleForce") },
    { value: "none", label: t("visibleNone") }
  ];

  // マテリアル種別の選択肢
  const materialOptions: {value: "standard"|"phong"|"tone"|"shader", label: string}[] = [
    { value: "standard", label: t("StandardMaterial") },
    { value: "phong", label: t("PhongMaterial") },
    { value: "tone", label: t("ToneMaterial") },
    { value: "shader", label: t("ShaderMaterial") }
  ];

  // Environmentの選択肢
  const environmentOptions: {value: "sunset"|"dawn"|"night"|"forest", label: string}[] = [
    { value: "sunset", label: t("sunset") },
    { value: "dawn", label: t("dawn") },
    { value: "night", label: t("night") },
    { value: "forest", label: t("forest") }
  ];

  /**
   * 選択中Objectをdeleteする
   * @param id 
   */
  const deleteObject = (id: string) => {
    editor.deleteOM(id);
  }

  useEffect(() => {
    if (selectOM){
      if (selectOM.args.backgroud !== undefined) setBackground(selectOM.args.backgroud);
      if (selectOM.args.helper !== undefined) setHelper(selectOM.args.helper);
      if (selectOM.args.visibleType !== undefined) setVisibleType(visibleTypeOptions.find((option) => option.value == selectOM.args.visibleType));
      if (selectOM.args.materialData !== undefined) setMaterialType(materialOptions.find((option) => option.value == selectOM.args.materialType));
      if (selectOM.args.materialData !== undefined && selectOM.args.materialData.value) setColor(selectOM.args.materialData.value);
      if (selectOM.args.blur) setBlur(selectOM.args.blur);
      if (selectOM.args.preset) setEnvironmentPreset(environmentOptions.find((option) => option.value == selectOM.args.preset));
    }
  }, [selectOM]);

  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 5);
    // DelKeyを押したときに選択中のオブジェクトを削除する
    const onKeyDown = (e) => {
      if (e.key == "Delete"){
        deleteObject(id);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(interval);
    };
  }, [id, globalStore.editorFocus, globalStore.pivotControl, position, rotation, scale, color]);

  const myFrame = () => {
    if (id && !globalStore.editorFocus){
      if (state.pivotControl){
        const position = editor.getPosition(id);
        position.x = parseFloat(position.x.toFixed(2));
        position.y = parseFloat(position.y.toFixed(2));
        position.z = parseFloat(position.z.toFixed(2));
        setPosition(position);
    
        const rotation = editor.getRotation(id);
        rotation.x = parseFloat(rotation.x.toFixed(2));
        rotation.y = parseFloat(rotation.y.toFixed(2));
        rotation.z = parseFloat(rotation.z.toFixed(2));
        setRotation(rotation);
    
        const scale = editor.getScale(id);
        scale.x = parseFloat(scale.x.toFixed(2));
        scale.y = parseFloat(scale.y.toFixed(2));
        scale.z = parseFloat(scale.z.toFixed(2));
        setScale(scale);
      }

      const materialData = editor.getMaterialData(id);
      if (materialData && materialData.type != "shader"){
        if (materialType?.value != materialData.type){
          setMaterialType(materialOptions.find((option) => option.value == materialData.type));
        }
        if (color != materialData.value){
          setColor(materialData.value);
        }
      }
    }
  }

  /**
   * 位置変更　Inspector -> Object
   * @param e 
   * @param xyz 
   */
  const changePosition = (e, xyz: "x" | "y" | "z") => { 
    const targetValue = e.target.value;
    const newPosition: Vector3 = selectOM.args.position? selectOM.args.position.clone(): new Vector3();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        newPosition.setX(Number(targetValue));
      }
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        newPosition.setY(Number(targetValue));
      }
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        newPosition.setZ(Number(targetValue));
      }
    }
    editor.setPosition(id, newPosition);
  }

  /**
   * 回転変更　Inspector -> Object
   * @param e 
   * @param xyz 
   */
  const changeRotation = (e, xyz: "x" | "y" | "z") => { 
    const targetValue = e.target.value;
    const newRotation: Euler = selectOM.args.rotation? selectOM.args.ratation.clone(): new Euler();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(Number(targetRad), newRotation.y, newRotation.z);
      }
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(newRotation.x, Number(targetRad), newRotation.z);
      }
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(newRotation.x, newRotation.y, Number(targetRad));
      }
    }
    editor.setRotation(id, newRotation);
  }

  /**
   * 拡大縮小変更　Inspector -> Object
   */
  const changeScale = (e, xyz: "x" | "y" | "z") => {
    const targetValue = e.target.value;
    const newScale: Vector3 = selectOM.args.scale? selectOM.args.scale.clone(): new Vector3();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        newScale.setX(Number(targetValue));
      }
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        newScale.setY(Number(targetValue));
      }
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        newScale.setZ(Number(targetValue));
      }
    }
    editor.setScale(id, newScale);
  }



  /**
   * 色の変更
   */
  const changeMaterial = (value: any) => {
    if (materialType.value !== "shader" && value){
      editor.setMaterialData(id, materialType.value, value);
      setColor(value);
    }
  }

  /**
   * 物理判定の有無
   * @param selectPhysics 
   */
  const onChangePhysics = (selectPhysics) => {
    setPhysics(selectPhysics);
  }

  /**
   * LoD対応
   */
  const onCheckLoD = async () => {
    // Lod処理の見直し
    // if (!isLod && selectOM.filePath ){
    //   const data = await reqApi({route: "createlod", queryObject: { 
    //     filePath: selectOM.filePath 
    //   }});
    //   if (data.status == 200){
    //     setIsLod(!isLod);
    //   }
    // }
    // else {
    //   setIsLod(!isLod);
    // }
  }

  /**
   * Lodを確認する
   */
  const onLoDView = async () => {
    if (selectOM.filePath && selectOM.filePath.length > 3){
      const data = await showLoDViewDialog(selectOM.filePath);
    }
  }

  /**
   * CastShadowを変更
   */
  const onCheckCastShadow = () => {
    editor.setCastShadow(id, !castShadow);
    setCastShadow(!castShadow);
  }

  /**
   * receiveShadowを変更
   */
  const onCheckreceiveShadow = () => {
    editor.setreceiveShadow(id, !receiveShadow);
    setreceiveShadow(!receiveShadow);
  }

  /**
   * Helper表示切り替え
   */
  const onCheckHelper = () => {
    editor.setHelper(id, !helper);
    setHelper(!helper);
  }

  /**
   * 描画種別の変更
   */
  const changeVisibleType = (selectVisibleType) => {
    editor.setVisibleType(id, selectVisibleType.value);
    setVisibleType(selectVisibleType);
  }

  /**
   * EnvironmentのPresetを変更
   */
  const changeEnvironmentPreset = (selectEnvironmentPreset) => {
    editor.setEnvironmentPreset(id, selectEnvironmentPreset.value);
    setEnvironmentPreset(selectEnvironmentPreset);
  }

  /**
   * EnvironmentのBlurの変更
   */
  const changeEnvironmentBlur = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue)){
      editor.setEnvironmentBlur(id, Number(targetValue));
      setBlur(Number(targetValue));
    }
  }

  /**
   * Helper表示切り替え
   */
  const onCheckEnvironmentBackGround = () => {
    editor.setEnvironmentBackground(id, !background);
    setBackground(!background);
  }

  return (
    <>
    <div className={styles.mainInspector}>
      {(
        selectOM &&
        (
          selectOM.type == "object" ||
          selectOM.type == "avatar" ||
          selectOM.type == "light" || 
          selectOM.type == "three" ||
          selectOM.type == "terrain"
        )
      ) &&
        
        <>
          <div className={styles.position}>
            <div className={styles.title}>
              {t("position")}
            </div>
            <div className={styles.name}>
              <div>X</div>
              <div>Y</div>
              <div>Z</div>
            </div>
            <div className={styles.inputContainer}>
              <input 
                value={position?.x}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changePosition({ target: { value: inputValue } }, "x");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newPosition = position.clone();
                    newPosition.setX(Number(e.target.value));
                    setPosition(newPosition);
                  }
                }} 
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                value={position?.y}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changePosition({ target: { value: inputValue } }, "y");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newPosition = position.clone();
                    newPosition.setY(Number(e.target.value));
                    setPosition(newPosition);
                  }
                }} 
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                value={position?.z}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changePosition({ target: { value: inputValue } }, "z");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newPosition = position.clone();
                    newPosition.setZ(Number(e.target.value));
                    setPosition(newPosition);
                  }
                }} 
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
            </div>
          </div>
          <div className={styles.rotation}>
            <div className={styles.title}>
              {t("rotation")}
            </div>
            <div className={styles.name}>
              <div>X</div>
              <div>Y</div>
              <div>Z</div>
            </div>
            <div className={styles.inputContainer}>
              <input 
                value={rotation?.x}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(1);
                    changeRotation({ target: { value: inputValue } }, "x");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation.clone();
                    newRotation.set(e.target.value, rotation.y, rotation.z);
                    setRotation(newRotation);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                value={rotation?.y}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(1);
                    changeRotation({ target: { value: inputValue } }, "y");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation.clone();
                    newRotation.set(rotation.x, e.target.value, rotation.z);
                    setRotation(newRotation);
                  }
                }}
              />
              <input 
                value={rotation?.z}
                type="text" 
                placeholder="0" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(1);
                    changeRotation({ target: { value: inputValue } }, "z");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation.clone();
                    newRotation.set(rotation.x, rotation.y, e.target.value);
                    setRotation(newRotation);
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.scale}>
            <div className={styles.title}>
              {t("scale")}
            </div>
            <div className={styles.name}>
              <div>X</div>
              <div>Y</div>
              <div>Z</div>
            </div>
            <div className={styles.inputContainer}>
              <input 
                value={scale?.x}
                type="text" 
                placeholder="1" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changeScale({ target: { value: inputValue } }, "x");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale.clone();
                    newScale.set(e.target.value, scale.y, scale.z);
                    setScale(newScale);
                  }
                }}
               />
              <input 
                value={scale?.y}
                type="text" 
                placeholder="1" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changeScale({ target: { value: inputValue } }, "y");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale.clone();
                    newScale.set(scale.x, e.target.value, scale.z);
                    setScale(newScale);
                  } 
                }}
              />
              <input 
                value={scale?.z}
                type="text" 
                placeholder="1" 
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const inputValue = parseFloat(e.target.value).toFixed(2);
                    changeScale({ target: { value: inputValue } }, "z");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale.clone();
                    newScale.set(scale.x, scale.y, e.target.value);
                    setScale(newScale);
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.material}>
            <div className={styles.title}>
              {t("materialConfig")}
            </div>
            <div className={styles.type}>
              <div className={styles.title}>
                {t("type")}
              </div>
              <div className={styles.input}>
                <Select
                  options={materialOptions}
                  // value={materialType}
                  onChange={(select) => setMaterialType(select)}
                  styles={normalStyles}
                  />
              </div>
            </div>
            {(materialType && materialType.value !== "shader") &&
              <div className={styles.color}>
                <div className={styles.name}>
                  {t("color")}
                </div>
                <div className={styles.pallet}>
                  <input 
                    type={"color"} 
                    value={color} 
                    onChange={(e) => changeMaterial(e.target.value)}
                    onFocus={() => globalStore.editorFocus = true}
                    onBlur={() => globalStore.editorFocus = false}
                  />
                  <input type={"text"} value={color} />
                </div>
              </div>
            }
            {(materialType && materialType.value === "shader") &&
              <div className={styles.shader}>
                <div className={styles.attachBox}>
                  Here Attach Script
                </div>
              </div>
            }
          </div>
          <div className={styles.physics}>
            <div className={styles.title}>
              {t("isPhysics")}
            </div>
            <div className={styles.input}>
              <input 
                type="checkbox" 
                className={styles.checkbox} 
                checked={isPhysics} 
                onInput={() => setIsPhysics(!isPhysics)}
              />
              <span className={styles.customCheckbox}></span>
            </div>
            {isPhysics &&
              <>
                <Select
                    options={physicsOptions}
                    value={physics}
                    onChange={onChangePhysics}
                    styles={normalStyles}
                />
              </>
            }
          </div>
          {
            (
              selectOM.type == "object"
            ) && 
            <div className={styles.lod}>
              <div className={styles.title}>
              {t("isLoD")}
              </div>
              <div className={styles.input}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={isLod} 
                  onInput={() => onCheckLoD()}
                />
                <span className={styles.customCheckbox}></span>
              </div>
              {isLod &&
                <a className={styles.lodbtn} onClick={() => onLoDView()}>
                  {t("chakeLoD")}
                </a>
              }
            </div>
          }

          {
            (selectOM.type == "light" || selectOM.type == "three" || selectOM.type == "object" || selectOM.type == "avatar") && 
            <>
              <div className={styles.castShadow}>
                  <div className={styles.title}>
                    {t("castshadow")}
                  </div>
                  <div className={styles.input}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox} 
                      checked={castShadow} 
                      onInput={() => onCheckCastShadow()}
                    />
                    <span className={styles.customCheckbox}></span>
                  </div>
              </div>
              <div className={styles.visibleType}>
                <div className={styles.title}>
                  {t("visibleType")}
                </div>
                <div className={styles.input}>
                  <Select
                    options={visibleTypeOptions}
                    value={visibleType}
                    onChange={(select) => changeVisibleType(select)}
                    styles={normalStyles}
                    />
                </div>
              </div>
            </>
          }

          <>
            <div className={styles.helper}>
              <div className={styles.title}>
                {t("helper")}
              </div>
              <div className={styles.input}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={helper} 
                  onInput={() => onCheckHelper()}
                />
                <span className={styles.customCheckbox}></span>
              </div>
            </div>
          </>

        </>
      }

      {selectOM && selectOM.type == "environment" &&
      <>
        <div className={styles.preset}>
          <div className={styles.title}>
            {t("preset")}
          </div>
          <div className={styles.input}>
            <Select
              options={environmentOptions}
              value={environmentPreset}
              onChange={(select) => changeEnvironmentPreset(select)}
              styles={normalStyles}
              />
          </div>
        </div>
        <div className={styles.backgroud}>
          <div className={styles.title}>
              {t("background")}
          </div>
          <div className={styles.input}>
            <input 
              type="checkbox" 
              className={styles.checkbox} 
              checked={background} 
              onInput={() => onCheckEnvironmentBackGround()}
            />
            <span className={styles.customCheckbox}></span>
          </div>
        </div>
        <div className={styles.blur}>
          <div className={styles.title}>
            {t("blur")}: {blur}
          </div>
          <div className={styles.input}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={blur}
              onChange={(e) => changeEnvironmentBlur(e)}
            />
          </div>
        </div>
      </>
      }

      </div>
    </>
  )
}


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