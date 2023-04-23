import styles from "@/App.module.scss";
import { IObjectManagement } from "ninja-core";
import { useRef, useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import Select from 'react-select';
import { reqApi } from "@/services/ServciceApi";
import { showLoDViewDialog } from "../Dialogs/LoDViewDialog";
import { Euler, Vector3, MathUtils, MeshStandardMaterial, AnimationClip } from "three";
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
  const [receiveShadow, setReceiveShadow] = useState<boolean>(false);
  const [helper, setHelper] = useState<boolean>(false);
  const [visibleType, setVisibleType] = useState<{ value: "none"|"auto"|"force"; label: string; }>();
  const [materialType, setMaterialType] = useState<{ value: "standard"|"phong"|"toon"|"shader"|"reflection"; label: string;}>();
  const [materialColor, setMaterialColor] = useState<string>();
  // Environmentの設定
  const [background, setBackground] = useState<boolean>(true);
  const [blur, setBlur] = useState<number>(0.5);
  const [environmentPreset, setEnvironmentPreset] = useState<{ value: "forest"|"sunset"|"dawn"|"night"; label: string; }>();
  // Lightformerの設定
  const [form, setForm] = useState<{ value: "circle"|"ring"|"rect", label: string}>();
  const [intensity, setIntensity] = useState<number>();
  // Animationsの設定
  const [defalutAnim, setDefalutAnim] = useState<{ value: string, label: string }>();
  const [animLoop, setAnimLoop] = useState<boolean>(true);
  // Colorの設定
  const [color, setColor] = useState<string>();
  const id = state.currentId;
  const selectOM = editor.getOMById(id);
  const [position, setPosition] = useState<Vector3>(selectOM?.object?.position ? selectOM.object.position.clone() : new Vector3());
  const [rotation, setRotation] = useState<Euler>(selectOM?.object?.rotation);
  const [scale, setScale] = useState<Vector3>(selectOM?.object?.scale);
  // const [offset, setOffset] = useState<Vector3>();
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
  const materialOptions: {value: "standard"|"phong"|"toon"|"shader"|"reflection", label: string}[] = [
    { value: "standard", label: t("StandardMaterial") },
    { value: "phong", label: t("PhongMaterial") },
    { value: "toon", label: t("ToonMaterial") },
    { value: "shader", label: t("ShaderMaterial") },
    { value: "reflection", label: t("reflection") }
  ];

  // Environmentの選択肢
  const environmentOptions: {value: "sunset"|"dawn"|"night"|"forest", label: string}[] = [
    { value: "sunset", label: t("sunset") },
    { value: "dawn", label: t("dawn") },
    { value: "night", label: t("night") },
    { value: "forest", label: t("forest") }
  ];

  // Formの選択肢
  const formOptions: {value: "circle"|"ring"|"rect", label: string}[] = [
    { value: "circle", label: t("circle") },
    { value: "ring", label: t("ring") },
    { value: "rect", label: t("rect") }
  ];

  /**
   * 選択中Objectをdeleteする
   * @param id 
   */
  const deleteObject = (id: string) => {
    const did = id;
    const dtype = selectOM.type;
    globalStore.currentId = null;
    editor.deleteOM(did, dtype);
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key == "Delete"){
        deleteObject(id);
      }
    }
    const init = async () => {
      // DelKeyを押したときに選択中のオブジェクトを削除する
      if (selectOM){
        if (selectOM.args.position) setPosition(selectOM.args.position);
        if (selectOM.args.rotation) setRotation(selectOM.args.rotation);
        if (selectOM.args.scale) setScale(selectOM.args.scale);
        if (selectOM.args.backgroud !== undefined) setBackground(selectOM.args.backgroud);
        if (selectOM.args.helper !== undefined) setHelper(selectOM.args.helper);
        if (selectOM.args.visibleType !== undefined) setVisibleType(visibleTypeOptions.find((option) => option.value == selectOM.args.visibleType));
        if (selectOM.args.materialData !== undefined){
          setMaterialType(materialOptions.find((option) => option.value == selectOM.args.materialData.type))
        }
        else {
          setMaterialType(materialOptions.find((option) => option.value == "standard"))
          setMaterialColor("#ffffff");
        };
        if (selectOM.args.materialData !== undefined && selectOM.args.materialData.value) setMaterialColor(selectOM.args.materialData.value);
        if (selectOM.args.blur) setBlur(selectOM.args.blur);
        if (selectOM.args.preset) setEnvironmentPreset(environmentOptions.find((option) => option.value == selectOM.args.preset));
        if (selectOM.args.form) setForm(selectOM.args.form);
        if (selectOM.args.intensity) setIntensity(selectOM.args.intensity);
        if (selectOM.args.defaultAnim) setDefalutAnim(selectOM.args.defaultAnim);
        if (selectOM.args.animLoop !== undefined) setAnimLoop(selectOM.args.animLoop);
        if (selectOM.args.color) setColor(selectOM.args.color);
        // if (selectOM.args.offset) setOffset(selectOM.args.offset);
      };
    }
    init();
    editor.onOMIdChanged(id, init);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      editor.offOMIdChanged(id, init);
      document.removeEventListener("keydown", onKeyDown);
    }
  }, [id, globalStore.editorFocus, globalStore.pivotControl]);

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
    const newRotation: Euler = selectOM.args.rotation? selectOM.args.rotation.clone(): new Euler();
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
   * マテリアル(種別/色)の変更
   */
  const changeMaterial = (type: "shader"|"standard"|"phong"|"toon"|"reflection", value: any) => {
    if (type !== "shader" && value){
      editor.setMaterialData(id, type, value);
      setMaterialColor(value);
      setMaterialType(materialOptions.find((option) => option.value == type));
    }
  }

  /**
   * 色属性の変更
   */
  const changeColor = (e) => {
    editor.setColor(id, e.target.value);
    setColor(e.target.value);
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
  const onCheckReceiveShadow = () => {
    editor.setReceiveShadow(id, !receiveShadow);
    setReceiveShadow(!receiveShadow);
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

  /**
   * Formの変更
   */
  const changeForm = (selectForm) => {
    editor.setForm(id, selectForm.value);
    setForm(selectForm);
  }

  /**
   * Intensityの変更
   */
  const changeIntensity = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue)){
      editor.setIntensity(id, Number(targetValue));
      setIntensity(Number(targetValue));
    }
  }

  /**
   * デフォルトアニメーションの変更
   */
  const changeDefaultAnimation = (selectDefaultAnimation) => {
    editor.setDefaultAnimation(id, selectDefaultAnimation.value);
    setDefalutAnim(selectDefaultAnimation);
  }

  /**
   * アニメーションループの切り替え
   */
  const onCheckAnimationLoop = () => {
    editor.setAnimationLoop(id, !animLoop);
    setAnimLoop(!animLoop);
  }

  /**
   * Offsetを変更
   */
  const changeOffset = (e, xyz: "x" | "y" | "z") => {
    const targetValue = e.target.value;
    const newOffset: Vector3 = selectOM.args.offset? selectOM.args.offset.clone(): new Vector3();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        newOffset.setX(Number(targetValue));
      }
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        newOffset.setY(Number(targetValue));
      }
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        newOffset.setZ(Number(targetValue));
      }
    }
    // editor.setOffset(id, newOffset); // 表示がないので特になし
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
          selectOM.type == "terrain" ||
          selectOM.type == "camera" ||
          selectOM.type == "lightformer"
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
                type="text" 
                placeholder={position?(position.x).toFixed(2): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changePosition(e, "x");
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
                type="text" 
                placeholder={position?position.y.toFixed(2): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changePosition(e, "y");
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
                type="text" 
                placeholder={position?position.y.toFixed(2): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changePosition(e, "z");
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
                type="text" 
                placeholder={rotation?MathUtils.radToDeg(rotation.x).toFixed(1): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeRotation(e, "x");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation?rotation.clone(): new Euler(0, 0, 0);
                    newRotation.set(e.target.value, newRotation.y, newRotation.z);
                    setRotation(newRotation);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                // value={rotation? MathUtils.radToDeg(rotation.y).toFixed(1): ""}
                type="text" 
                placeholder={rotation? MathUtils.radToDeg(rotation.y).toFixed(1): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeRotation(e, "y");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation?rotation.clone(): new Euler(0, 0, 0);
                    newRotation.set(newRotation.x, e.target.value, newRotation.z);
                    setRotation(newRotation);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                // value={rotation?MathUtils.radToDeg(rotation.z).toFixed(1): ""}
                type="text" 
                placeholder={rotation?MathUtils.radToDeg(rotation.z).toFixed(1): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeRotation(e, "z");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newRotation = rotation?rotation.clone(): new Euler(0, 0, 0);
                    newRotation.set(newRotation.x, rotation.y, e.target.value);
                    setRotation(newRotation);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
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
                // value={scale?(scale.x).toFixed(1): ""}
                type="text" 
                placeholder={scale?(scale.x).toString(): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeScale(e, "x");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale?scale.clone(): new Vector3(1, 1, 1);
                    newScale.set(e.target.value, newScale.y, newScale.z);
                    setScale(newScale);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
               />
              <input 
                // value={scale?(scale.y).toFixed(1): ""}
                type="text" 
                placeholder={scale?scale.y.toString(): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeScale(e, "y");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale?scale.clone(): new Vector3(1, 1, 1);
                    newScale.set(newScale.x, e.target.value, newScale.z);
                    setScale(newScale);
                  } 
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input 
                // value={scale?(scale.z).toFixed(1): ""}
                type="text" 
                placeholder={scale?(scale.z).toString(): "0"}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    changeScale(e, "z");
                  }
                }}
                onInput={(e: any) => {
                  if (isNumber(e.target.value)){
                    const newScale = scale?scale.clone(): new Vector3(1, 1, 1);
                    newScale.set(newScale.x, newScale.y, e.target.value);
                    setScale(newScale);
                  }
                }}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
            </div>
          </div>
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
      }

      {selectOM && (
        selectOM.type == "object" ||
        selectOM.type == "three"
      ) && 
      <>
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
                value={materialType}
                onChange={(select) => changeMaterial(select.value, materialColor)}
                styles={normalStyles}
                />
            </div>
          </div>
          {materialType && materialType.value !== "shader" &&
          <div className={styles.color}>
            <div className={styles.name}>
              {t("color")}
            </div>
            <div className={styles.pallet}>
              <input 
                type={"color"} 
                value={materialColor} 
                onChange={(e) => changeMaterial(materialType.value, e.target.value)}
                onFocus={() => globalStore.editorFocus = true}
                onBlur={() => globalStore.editorFocus = false}
              />
              <input type={"text"} value={materialColor} />
            </div>
          </div>
          }

          {/** シェーダ対応準備中 */}
          {/* {(materialType && materialType.value === "shader") &&
            <div className={styles.shader}>
              <div className={styles.attachBox}>
                Here Attach Script
              </div>
            </div>
          } */}
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
      </>
      }

      {selectOM && (
        selectOM.type == "light" || 
        selectOM.type == "three" || 
        selectOM.type == "object" || 
        selectOM.type == "avatar"
      ) && 
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
          <div className={styles.castShadow}>
              <div className={styles.title}>
                {t("receiveshadow")}
              </div>
              <div className={styles.input}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={receiveShadow} 
                  onInput={() => onCheckReceiveShadow()}
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


      {selectOM && selectOM.type == "avatar" &&
      <>
        {/* オフセットは現在自動で設定されます。 */}
        {/* <div className={styles.offset}>
          <div className={styles.title}>
            {t("offset")}
          </div>
          <div className={styles.name}>
            <div>X</div>
            <div>Y</div>
            <div>Z</div>
          </div>
          <div className={styles.inputContainer}>
            <input 
              type="text" 
              placeholder={offset?offset.x.toString(): "0"}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  changeOffset(e, "x");
                }
              }}
              onInput={(e: any) => {
                if (isNumber(e.target.value)){
                  const newOffset = offset?offset.clone(): new Vector3(1, 1, 1);
                  newOffset.set(e.target.value, newOffset.y, newOffset.z);
                  setOffset(newOffset);
                }
              }}
              onFocus={() => globalStore.editorFocus = true}
              onBlur={() => globalStore.editorFocus = false}
              />
            <input 
              // value={scale?(scale.y).toFixed(1): ""}
              type="text" 
              placeholder={offset?offset.y.toString(): "0"}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  changeOffset(e, "y");
                }
              }}
              onInput={(e: any) => {
                if (isNumber(e.target.value)){
                  const newOffset = offset?offset.clone(): new Vector3(1, 1, 1);
                  newOffset.set(newOffset.x, e.target.value, newOffset.z);
                  setOffset(newOffset);
                } 
              }}
              onFocus={() => globalStore.editorFocus = true}
              onBlur={() => globalStore.editorFocus = false}
            />
            <input 
              // value={scale?(scale.z).toFixed(1): ""}
              type="text" 
              placeholder={offset?offset.z.toString(): "0"}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  changeOffset(e, "z");
                }
              }}
              onInput={(e: any) => {
                if (isNumber(e.target.value)){
                  const newOffset = offset?offset.clone(): new Vector3(1, 1, 1);
                  newOffset.set(newOffset.x, newOffset.y, e.target.value);
                  setOffset(newOffset);
                }
              }}
              onFocus={() => globalStore.editorFocus = true}
              onBlur={() => globalStore.editorFocus = false}
            />
          </div>
        </div> */}
      </>
      }

      {(
        selectOM && selectOM.type == "object"
      ) && 
      <>
        <div className={styles.animations}>
          {selectOM.animations && selectOM.animations.length > 0 &&
            <>
              <div className={styles.title}>
                {t("animations")}
                </div>
              <div className={styles.input}>
                <Select
                  options={
                    selectOM.animations.map((anim: AnimationClip) => {
                      return {value: anim.name, label: anim.name}
                    })
                  }
                  value={defalutAnim}
                  onChange={(select) => changeDefaultAnimation(select)}
                  styles={normalStyles}
                />
              </div>
            </>
        }
        </div>
        <div className={styles.animLoop}>
          <div className={styles.title}>
              {t("animationLoop")}
          </div>
          <div className={styles.input}>
            <input 
              type="checkbox" 
              className={styles.checkbox} 
              checked={background} 
              onInput={() => onCheckAnimationLoop()}
            />
            <span className={styles.customCheckbox}></span>
          </div>
        </div>
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

      {selectOM && selectOM.type == "lightformer" &&
      <>
        <div className={styles.form}>
          <div className={styles.title}>
            {t("form")}
          </div>
          <div className={styles.input}>
            <Select
              options={formOptions}
              value={form}
              onChange={(select) => changeForm(select)}
              styles={normalStyles}
            />
          </div>
        </div>
      </>
      }

      {selectOM && (
        selectOM.type == "lightformer" ||
        selectOM.type == "light"
        ) &&
      <>
        <div className={styles.color}>
          <div className={styles.name}>
            {t("color")}
          </div>
          <div className={styles.pallet}>
            <input 
              type={"color"} 
              value={color} 
              onChange={(e) => changeColor(e)}
              onFocus={() => globalStore.editorFocus = true}
              onBlur={() => globalStore.editorFocus = false}
            />
            <input type={"text"} value={color} />
          </div>
        </div>
        <div className={styles.intensity}>
          <div className={styles.name}>
            {t("intensity")}: {intensity}
          </div>
          <div className={styles.range}>
            <input
              type={"range"}
              min={0}
              max={10}
              step={0.01}
              value={intensity}
              onChange={(e) => changeIntensity(e)}
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