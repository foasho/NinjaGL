import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import type { languages } from 'monaco-editor'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DoubleSide, Mesh, ShaderMaterial, Matrix3, Matrix4, ShaderMaterialParameters, Uniform, Vector2, Vector3, Vector4 } from 'three';
import { Canvas, useFrame, extend, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls, Sky, SoftShadows, shaderMaterial } from '@react-three/drei';
import path from 'path';
import { GLTFLoader } from 'three-stdlib/loaders/GLTFLoader';
import Select from 'react-select';

interface IShaderEditor {
  shaderPath?: string;
}
export const ShaderEditor = (props: IShaderEditor) => {
  const fragmentRef = useRef(null);
  const vertexRef = useRef(null);
  const [objectType, setObjectType] = useState<"box"|"plane"|"sphere"|"gltf">("box");
  const [uploadModel, setUploadModel] = useState<string>("");
  const [fragmentCode, setFragmentCode] = useState<string>(initCodeFragment);
  const [vertexCode, setVertexCode] = useState<string>(initCodeVertex);
  const [fileName, setFileName] = useState<string>(null);
  const { t } = useTranslation();
  const [mode, setMode] = useState<"Fragment"|"Vertex">("Fragment");
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [separate, setSeparate] = useState<{editorWidth: string, previewWidth: string}>({editorWidth: "50%", previewWidth: "50%"});

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco?.languages.register({ id: "glsl" });
    monaco?.languages.setMonarchTokensProvider("glsl", glslLanguage);
  }

  const handleEditorDidMount = (editor, ref) => {
    ref.current = editor;
  }
 
  /**
   * ファイルを保存する
   */
  const saveCodeFile = async() => {
    if (!fileName){
      // 新規作成の場合は、ファイル名を名付ける
    }
  }

  /**
   * 保存
   */
  const onSave = () => {
    toast(t("completeSave"), {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    if (fileName){
    }
    else {
      
    }
    setFragmentCode(fragmentRef.current.getValue());
    setVertexCode(vertexRef.current.getValue());
  }

  const onPreview = () => {
    setShowPreview(!showPreview);
  }

  /**
   * モードチェンジ
   */
  const changeMode = () => {
  let currentCode;
  if (mode === "Fragment") {
    if (fragmentRef.current) {
      currentCode = fragmentRef.current.getValue();
    } else {
      currentCode = initCodeFragment;
    }
    setFragmentCode(currentCode);
    setMode("Vertex");
  } else {
    if (vertexRef.current) {
      currentCode = vertexRef.current.getValue();
    } else {
      currentCode = initCodeVertex;
    }
    setVertexCode(currentCode);
    setMode("Fragment");
  }
};

  /**
   * リサイザーをつかむ
   */
  const onMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  const onMouseMove = (event) => {
    const separation = event.clientX;
    const totalWidth = window.innerWidth;
    const newEditorWidth = `${(separation / totalWidth) * 100}%`;
    const newPreviewWidth = `${100 - (separation / totalWidth) * 100}%`;
    setSeparate({
        editorWidth: newEditorWidth,
        previewWidth: newPreviewWidth
    });
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  /**
   * キーボードショートカット
   * @param event 
   */
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      onSave();
    }
  };


  /**
   * ファイル指定して起動する場合は、初期Codeはそのファイルを読み込む
   */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (props.shaderPath){
      const fileName = path.basename(props.shaderPath);
      let _mode: "Vertex"|"Fragment" = "Vertex";
      if (fileName.includes(".frag")){
        _mode = "Fragment";
      }
      const fetchData = async () => {
        try {
          const scriptPath = `${props.shaderPath}`;
          const response = await fetch(props.shaderPath, { signal });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const jsonData = await response.json();
          if (_mode == "Fragment"){
            setMode(_mode);
            setFragmentCode(jsonData);
          }
          else{
            setMode(_mode);
            setVertexCode(jsonData);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };
      fetchData();
    }

    return () => {
      controller.abort();
    };
  }, [props.shaderPath]);

  let filename = t("nonNameShader");
  if (props.shaderPath){
    filename = path.basename(props.shaderPath);
  }

  const options: { value: string, label: string }[] = [
    { value: "box", label: "立方体" },
    { value: "sphere", label: "球体" },
    { value: "plane", label: "平面" },
    { value: "gltf", label: "" }
  ];

  const onChangeObjectType = (option) => {
    setObjectType(option.value);
  }

  return (
    <div className={styles.shaderEditor}>
      <div className={styles.navigation}>
        <div className={`${styles.mode} ${styles.navItem}`} onClick={() => changeMode()}>
          {mode}
        </div>
        <div className={`${styles.filename} ${styles.navItem}`}>
          {filename}
          {mode == "Fragment"? ".frag": ".vertex"}
        </div>
        <div className={`${styles.mode} ${styles.save}`} onClick={() => onSave()}>
          Save
        </div>
        <div className={`${styles.preview} ${styles.navItem}`} onClick={() => onPreview()}>
          Preview
        </div>
        <div className={`${styles.type} ${styles.navItem}`}>
          <Select
              options={options}
              value={options.find(op => op.value == objectType)}
              onChange={onChangeObjectType}
              styles={darkThemeStyles}
            />
        </div>
      </div>
      <div className={styles.editor}>
        <div 
          className={styles.monaco} 
          style={{width: showPreview?separate.editorWidth: "100%"}}
          onKeyDown={handleKeyDown}
        >
          <div style={{ display: mode=="Fragment"?"block": "none", height: "100%" }}>
            <MonacoEditor
              language="glsl"
              theme="vs-dark"
              value={fragmentCode}
              beforeMount={(monaco) => handleEditorWillMount(monaco)}
              onMount={(editor) => handleEditorDidMount(editor, fragmentRef)}
              options={{
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                automaticLayout: true,
              }}
            />
          </div>
          <div style={{ display: mode=="Vertex"?"block": "none", height: "100%" }}>
            <MonacoEditor
              language="glsl"
              theme="vs-dark"
              value={vertexCode}
              beforeMount={(monaco) => handleEditorWillMount(monaco)}
              onMount={(editor) => handleEditorDidMount(editor, vertexRef)}
              options={{
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                automaticLayout: true,
              }}
            />
          </div>
        </div>
        {showPreview &&
          <>
            <div 
              className={styles.resizer} 
              style={{ left: separate.editorWidth }}
              onMouseDown={onMouseDown}
            ></div>
            <div className={styles.preview} style={{ width: separate.previewWidth }}>
              <Canvas shadows>
                <SoftShadows/>
                <mesh castShadow receiveShadow scale={[10, 10, 10]} rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]}>
                  <planeBufferGeometry/>
                  <meshStandardMaterial side={DoubleSide} color={0xf2f2f2} />
                </mesh>
                <ShaderViewer vertexCode={vertexCode} fragmentCode={fragmentCode} objectType={objectType}/>
                <Environment preset='city' blur={0.7} />
                <OrbitControls/>
                <Sky/>
              </Canvas>
            </div>
          </>
        }
      </div>
    </div>
  )
}

interface IShaderViewer {
  objectType: "box" | "plane" | "sphere" | "gltf";
  vertexCode: string;
  fragmentCode: string;
  url?: string;
}
/**
 * シェーダビューア
 * @returns 
 */
const ShaderViewer = (props: IShaderViewer) => {
  const ref = useRef<Mesh>();
  const CustomShaderMaterial = createShaderMaterial(props.vertexCode, props.fragmentCode);
  const shaderRef = useRef<ShaderMaterial>(CustomShaderMaterial);
  
  let geometry;
  let obj;
  switch (props.objectType) {
    case 'box':
      geometry = <boxGeometry args={[1, 1, 1]} />;
      break;
    case 'plane':
      geometry = <planeGeometry args={[1, 1]} />;
      break;
    case 'sphere':
      geometry = <sphereGeometry args={[1, 32, 32]} />;
      break;
    case 'gltf':
      if (!props.url) {
        obj = <mesh></mesh>;
      }
      else {
        // 美しくないので後で直す
        // const gltf: any = useLoader(GLTFLoader, props.url);
        // obj = (
        //   <>
        //     <primitive object={gltf.scene}/>
        //     <primitive object={CustomShaderMaterial}/>
        //   </>
        // )
      }
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }

  useFrame((state, delta) => {
    // if (shaderRef.current){
    //   shaderRef.current.uniforms.speed.value = 2.0;
    //   shaderRef.current.uniforms.amplitude.value = 0.5;
    //   shaderRef.current.uniforms.time.value = state.clock.getElapsedTime();
    //   shaderRef.current.uniforms.direction.value = new Vector3(0, 1, 1); // 波の進行方向を横向きに変更する
    //   shaderRef.current.needsUpdate = true;
    // }
  })

  
  return (
    <>
        <mesh castShadow>
          {(!obj)?
            <>
                {geometry}
                <primitive object={CustomShaderMaterial} />
            </>
            :
            <>
              {obj}
            </>
          }
      </mesh>
    </>
  )
}

/**
 * 変数名から型を推定
 */
const getDefaultInitialValue = (type: string) => {
  switch (type) {
    case 'float':
      return 0.0;
    case 'int':
    case 'bool':
      return 0;
    case 'vec2':
      return new Vector2();
    case 'vec3':
      return new Vector3();
    case 'vec4':
      return new Vector4();
    case 'mat3':
      return new Matrix3();
    case 'mat4':
      return new Matrix4();
    case 'sampler2D':
      return null; // テクスチャが未指定の場合、Three.jsはデフォルトの白いテクスチャを使用します。
    default:
      return undefined;
  }
}


/**
 * シェーダコードからuniformを取得する
 * @param shaderCode 
 * @returns 
 */
const extractVariables = (shaderCode, initialValues = {}) => {
  const regex = /(\w+)\s+(\w+)\s+(\w+);/g;
  let variables = { attributes: {}, varyings: {}, uniforms: {} };
  let match;

  while ((match = regex.exec(shaderCode)) !== null) {
    if (match[1] === 'attribute') {
      variables.attributes[match[3]] = { type: match[2] };
    } else if (match[1] === 'varying') {
      variables.varyings[match[3]] = { type: match[2] };
    } else if (match[1] === 'uniform') {
      variables.uniforms[match[3]] = {
        type: match[2],
        value:
          initialValues.hasOwnProperty(match[3])
            ? initialValues[match[3]]
            : getDefaultInitialValue(match[2]),
      };
    }
  }

  return variables;
}

/**
 *  任意のシェーダマテリアル
 * @param vertexShader 
 * @param fragmentShader 
 * @returns 
 */
const createShaderMaterial = (vertexShader: string, fragmentShader: string): ShaderMaterial => {
  const vertexVariables = extractVariables(vertexShader);
  const fragmentVariables = extractVariables(fragmentShader);

  let uniforms = { ...vertexVariables.uniforms, ...fragmentVariables.uniforms };
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true, // 透明化するために必要
    uniforms: uniforms,
  });
  return material;
}


// 頂点シェーダーのサンプル
const initCodeVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// フラグメントシェーダーのサンプル
const initCodeFragment = `
varying vec2 vUv;
uniform float time;

void main() {
  vec2 uv = vUv;

  // 波紋エフェクトの中心
  vec2 center = vec2(0.5, 0.5);

  // エフェクトの距離と強度を計算
  float dist = distance(uv, center);
  float strength = 0.3 * sin(2.0 * 3.141592 * dist - time * 3.0) / dist;

  // 色を計算
  vec3 color = vec3(0.0, 0.0, 1.0) * strength + vec3(0.0, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`;


/**
 * 選択肢のダークテーマスタイル
 */
const darkThemeStyles = {
  singleValue: (provided) => ({
    ...provided,
    color: '#43D9D9',
    fontSize: '10px',
    paddingLeft: "15px"
  }),
  input: (styles) => ({
    ...styles,
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: '#111',
    borderColor: '#555',
    height: 'auto',
    minHeight: '30px',
    width: '120px',
    lineHeight: '1',
    alignItems: 'center',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0', // これを追加
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#333',
    width: '180px',
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
      height: 'auto',
      minHeight: '30px',
      fontSize: '10px',
    };
  },
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: '0',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: '0', // これを追加
  }),
};

/**
 * GLSL言語エディタの設定
 */
const glslLanguage: languages.IMonarchLanguage = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: 'invalid',
  tokenPostfix: '.glsl',

  keywords: [
    'void', 'bool', 'int', 'float', 'uint', 'double', 'vec2', 'vec3', 'vec4', 'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4', 'dvec2', 'dvec3', 'dvec4',
    'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow',
    'sampler2DShadow', 'samplerCubeShadow', 'sampler1DArray', 'sampler2DArray', 'sampler1DArrayShadow', 'sampler2DArrayShadow', 'isampler1D', 'isampler2D', 'isampler3D', 'isamplerCube', 'isampler1DArray',
    'isampler2DArray', 'usampler1D', 'usampler2D', 'usampler3D', 'usamplerCube', 'usampler1DArray', 'usampler2DArray', 'sampler2DRect', 'sampler2DRectShadow', 'isampler2DRect', 'usampler2DRect', 'samplerBuffer',
    'isamplerBuffer', 'usamplerBuffer', 'sampler2DMS', 'isampler2DMS', 'usampler2DMS', 'sampler2DMSArray', 'isampler2DMSArray', 'usampler2DMSArray', 'struct', 'uniform', 'layout', 'in', 'out', 'inout',
    'attribute', 'varying', 'const', 'if', 'else', 'switch', 'case', 'default', 'while', 'do', 'for', 'continue', 'break', 'return', 'discards', 'beginInvocationInterlock', 'endInvocationInterlock',
    'subroutine', 'lowp', 'mediump', 'highp', 'precision', 'invariant', 'discard', 'mat2x2', 'mat3', 'mat3x3', 'mat4', 'mat4x4', 'dmat2', 'dmat2x2', 'dmat2x3', 'dmat2x4', 'dmat3', 'dmat3x2', 'dmat3x3', 
    'dmat3x4', 'dmat4', 'dmat4x2', 'dmat4x3', 'dmat4x4', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4', 'dvec2', 'dvec3', 'dvec4', 'bvec2', 'bvec3', 'bvec4', 'float', 'double',
    'bool', 'int', 'uint', 'true', 'false', 'mix', 'step', 'smoothstep', 'length', 'distance', 'dot', 'cross', 'normalize', 'faceforward', 'reflect', 'refract', 'matrixCompMult', 'outerProduct', 'transpose',
  ],

  operators: [
    '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '++', '--',
    '+', '-', '*', '/', '%', '<', '>', '<=', '>=', '==', '!=', '&&', '||',
    '!', '~', '&', '|', '^', '<<', '>>', '>>>',
  ],

  brackets: [
    { open: '(', close: ')',token: 'delimiter.parenthesis' },
    { open: '{', close: '}',token: 'delimiter.curly' },
    { open: '[', close: ']',token: 'delimiter.square' },
  ],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // C style block comments are supported
  comments: [
    ['\\/\\*', '\\*\\/', 'comment'],
    ['\\/\\/', '$', 'comment']
  ],

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': { token: 'keyword.$0' },
          '@default': 'identifier',
        }
      }],
      [/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'delimiter.operator',
          '@default': ''
        }
      }],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
      [/"/, 'string', '@string'],

      // characters
      [/'[^\\']'/, 'string'],
      // [/(')(@escapes)(')/, ['string','string.escape','string']],
      [/'/, 'string.invalid']
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string: [
      [/[^\\"]+/,  'string'],
      // [/@escapes/, 'string.escape'],
      // [/\\./,      'string.escape.invalid'],
      [/"/,        'string', '@pop']
    ],
  },
};