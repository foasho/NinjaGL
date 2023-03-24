import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/Core/NinjaProps";
import { useRef, useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import Select from 'react-select';
import { reqApi } from "@/services/ServciceApi";
import { showLoDViewDialog } from "../Dialogs/LoDViewDialog";
import { Euler, Vector3 } from "three";
import { isNumber } from "@/commons/functional";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { useTranslation } from "react-i18next";

export const MainViewInspector = () => {
  const editor = useContext(NinjaEditorContext);
  const refPosX = useRef<HTMLInputElement>();
  const refPosY = useRef<HTMLInputElement>();
  const refPosZ = useRef<HTMLInputElement>();
  const refRotX = useRef<HTMLInputElement>();
  const refRotY = useRef<HTMLInputElement>();
  const refRotZ = useRef<HTMLInputElement>();
  const refScaX = useRef<HTMLInputElement>();
  const refScaY = useRef<HTMLInputElement>();
  const refScaZ = useRef<HTMLInputElement>();
  const [isFocus, setIsFocus] = useState<boolean>();
  const [isPhysics, setIsPhysics] = useState<boolean>(false);
  const [isLod, setIsLod] = useState<boolean>(false);
  const [color, setColor] = useState<string>();
  const [physics, setPhysics] = useState<{ value: string; label: string; }>();
  const [selectOM, setSelectOM] = useState<IObjectManagement>(null);
  const id = selectOM? selectOM.id: null;
  const { t, i18n } = useTranslation();

  editor.setFocus(id, isFocus);

  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 10);
    return () => clearInterval(interval);
  }, [selectOM, isFocus]);

  const myFrame = () => {
    if (id){
      const position = editor.getPosition(id);
      if (
        position && 
        (
          selectOM.type == "object" || 
          selectOM.type == "light" ||
          selectOM.type == "three"
        )
      ) {
        if (!isFocus){
          refPosX.current.value = position.x.toFixed(2).toString();
          refPosY.current.value = position.y.toFixed(2).toString();
          refPosZ.current.value = position.z.toFixed(2).toString();
        }
      }
      const rotation = editor.getRotation(id);
      if (
        rotation && (
          selectOM.type == "object" || 
          selectOM.type == "light" ||
          selectOM.type == "three"
        )
      ) {
        if (!isFocus){
          refRotX.current.value = radToDeg(rotation.x).toFixed(0).toString();
          refRotY.current.value = radToDeg(rotation.y).toFixed(0).toString();
          refRotZ.current.value = radToDeg(rotation.z).toFixed(0).toString();
        }
      }
      const scale = editor.getScale(id);
      if (scale && (
        selectOM.type == "object"|| 
        selectOM.type == "light" ||
        selectOM.type == "three"
      )) {
        if (!isFocus){
          refScaX.current.value = scale.x.toFixed(2).toString();
          refScaY.current.value = scale.y.toFixed(2).toString();
          refScaZ.current.value = scale.z.toFixed(2).toString();
        }
      }
    }
    if (selectOM != editor.getSelectOM()){
      setSelectOM(editor.getSelectOM());
    }
  }

  /**
   * 位置変更　Inspector -> Object
   * @param e 
   * @param xyz 
   */
  const changePosition = (e, xyz: "x" | "y" | "z") => { 
    const targetValue = e.target.value;
    const newPosition: Vector3 = selectOM.args.position.clone();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        newPosition.setX(Number(targetValue));
      }
      refPosX.current.value = targetValue;
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        newPosition.setY(Number(targetValue));
      }
      refPosX.current.value = targetValue;
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        newPosition.setZ(Number(targetValue));
      }
      refPosX.current.value = targetValue;
    }
    editor.setPosition(id, newPosition);
    // 変更後1秒
  }

  /**
   * 回転変更　Inspector -> Object
   * @param e 
   * @param xyz 
   */
  const changeRotation = (e, xyz: "x" | "y" | "z") => { 
    const targetValue = e.target.value;
    const newRotation: Euler = selectOM.args.rotation.clone();
    if (xyz == "x") {
      if (isNumber(targetValue)){
        const targetRad = degToRad(targetValue);
        newRotation.set(Number(targetRad), newRotation.y, newRotation.z);
      }
      refRotX.current.value = targetValue;
    }
    else if (xyz == "y") {
      if (isNumber(targetValue)){
        const targetRad = degToRad(targetValue);
        newRotation.set(newRotation.x, Number(targetRad), newRotation.z);
      }
      refRotY.current.value = targetValue;
    }
    else if (xyz == "z") {
      if (isNumber(targetValue)){
        const targetRad = degToRad(targetValue);
        newRotation.set(newRotation.x, newRotation.y, Number(targetRad));
      }
      refRotZ.current.value = targetValue;
    }
    editor.setRotation(id, newRotation);
  }

  const physicsOptions = [
    { value: "aabb", label: "無回転BOX(AABB)" },
    { value: "along", label: "形状に従う" }
  ]

  /**
   * 色の変更
   */
  const changeMaterial = (type: "color" | "texture", value: any) => {
    if (type == "color" && value){
      editor.setMaterial(id, type, value);
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
    if (!isLod && selectOM.filePath ){
      const data = await reqApi({route: "createlod", queryObject: { 
        filePath: selectOM.filePath 
      }});
      if (data.status == 200){
        setIsLod(!isLod);
      }
    }
    else {
      setIsLod(!isLod);
    }
  }

  /**
   * Lodを確認する
   */
  const onLoDView = async () => {
    console.log(selectOM.filePath);
    if (selectOM.filePath && selectOM.filePath.length > 3){
      const data = await showLoDViewDialog(selectOM.filePath);
    }
  }

  const focusChange = (flag: boolean) => {
    editor.setFocus(id, flag);
    setIsFocus(flag);
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
          selectOM.type == "three"
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
                ref={refPosX} 
                type="text" 
                placeholder="0" 
                onInput={(e) => changePosition(e, "x")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
              />
              <input 
                ref={refPosY} 
                type="text" 
                placeholder="0" 
                onChange={(e) => changePosition(e, "y")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
              />
              <input 
                ref={refPosZ} 
                type="text" 
                placeholder="0" 
                onChange={(e) => changePosition(e, "z")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
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
                ref={refRotX} 
                type="text" 
                placeholder="0" 
                onInput={(e) => changeRotation(e, "x")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
              />
              <input 
                ref={refRotY} 
                type="text" 
                placeholder="0" 
                onInput={(e) => changeRotation(e, "y")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
              />
              <input 
                ref={refRotZ} 
                type="text" 
                placeholder="0" 
                onInput={(e) => changeRotation(e, "z")} 
                onFocus={() => focusChange(true)}
                onBlur={() => focusChange(false)}
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
                ref={refScaX} 
                type="text" 
                placeholder="0" 
                value={selectOM.args.scale?.x}
               />
              <input 
                ref={refScaY} 
                type="text" 
                placeholder="0" 
                value={selectOM.args.scale?.y}
              />
              <input 
                ref={refScaZ} 
                type="text" 
                placeholder="0" 
                value={selectOM.args.scale?.z} 
              />
            </div>
          </div>
          <div className={styles.material}>
            <div className={styles.title}>
              {t("materialConfig")}
            </div>
            <div className={styles.type}>
              <div className={styles.name}>
              {t("type")}
              </div>
              <div>
              </div>
            </div>
            <div className={styles.color}>
              <div className={styles.name}>
                {t("color")}
              </div>
              <div className={styles.pallet}>
                <input 
                  type={"color"} 
                  value={color} 
                  onChange={(e) => changeMaterial("color", e.target.value)}
                  onFocus={() => focusChange(true)}
                  onBlur={() => focusChange(false)}
                />
                <input type={"text"} value={color} />
              </div>
            </div>
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
          {selectOM.type == "object" && 
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