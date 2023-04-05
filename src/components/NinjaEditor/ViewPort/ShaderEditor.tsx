import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import type { languages } from 'monaco-editor'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Mesh, ShaderMaterial, Uniform, Vector3 } from 'three';
import { Canvas, useFrame, extend, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls, Sky, shaderMaterial } from '@react-three/drei';
import path from 'path';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Select from 'react-select';

interface IShaderEditor {
  shaderPath?: string;
}
export const ShaderEditor = (props: IShaderEditor) => {
  const fragmentRef = useRef(null);
  const vertexRef = useRef(null);
  const [objectType, setObjectType] = useState<"box"|"plane"|"sphere"|"gltf">("box");
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
    const currentCode = mode === "Fragment" ? fragmentRef.current.getValue() : vertexRef.current.getValue();
    if (mode == "Fragment"){
      setFragmentCode(currentCode);
    }
    else {
      setVertexCode(currentCode);
    }
  }

  const onPreview = () => {
    setShowPreview(!showPreview);
  }

  /**
   * モードチェンジ
   */
  const changeMode = () => {
    if (mode == "Fragment"){
      setMode("Vertex");
      if (fragmentRef.current) setFragmentCode(fragmentRef.current.getValue())
    }
    else {
      setMode("Fragment");
      if (vertexRef.current) setVertexCode(vertexRef.current.getValue())
    }
  }

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
    { value: "plane", label: "平面" }
  ];

  const onChangeObjectType = (option) => {
    setObjectType(option.value);
  }

  return (
    <div className={styles.shaderEditor}>
      <div className={styles.navigation}>
        <div className={styles.mode} onClick={() => changeMode()}>
          {mode}
        </div>
        <div className={styles.filename}>
          {filename}
          {mode == "Fragment"? ".frag": ".vertex"}
        </div>
        <div className={styles.save} onClick={() => onSave()}>
          Save
        </div>
        <div className={styles.preview} onClick={() => onPreview()}>
          Preview
        </div>
        <div className={styles.preview}>
          <Select
            options={options}
            value={options.find(op => op.label == objectType)}
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
          {mode == "Fragment" ?
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
              
            />:
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
          }
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

/**
 * モデル読み込み
 * @param param0 
 * @returns 
 */
const Model = ({ url }): JSX.Element => {
  const gltf: any = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} />;
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
      const gltf: any = useLoader(GLTFLoader, props.url);
      return (
        <mesh>
          <primitive object={gltf.scene}/>
          <primitive object={CustomShaderMaterial}/>
        </mesh>
      )
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
      <mesh>
        {geometry}
        <primitive object={CustomShaderMaterial} />
      </mesh>
    </>
  )
}



/**
 * シェーダコードからuniformを取得する
 * @param shaderCode 
 * @returns 
 */
const extractUniforms = (shaderCode) => {
  const regex = /uniform\s+(\w+)\s+(\w+);/g;
  let uniforms = {};
  let match;
  while ((match = regex.exec(shaderCode)) !== null) {
    uniforms[match[2]] = { type: match[1], value: null };
  }
  return uniforms;
}

/**
 *  任意のシェーダマテリアル
 * @param vertexShader 
 * @param fragmentShader 
 * @returns 
 */
const createShaderMaterial = (vertexShader: string, fragmentShader: string): ShaderMaterial => {
  const vertexUniforms = extractUniforms(vertexShader);
  const fragmentUniforms = extractUniforms(fragmentShader);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { ...vertexUniforms, ...fragmentUniforms },
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
    fontSize: '16px',
    lineHeight: '1', // これを追加
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: '#111',
    borderColor: '#555',
    height: 'auto',
    minHeight: '40px',
    width: '180px',
    lineHeight: '1', // これを追加
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#333',
    width: '180px',
    lineHeight: '1', // これを追加
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
      minHeight: '40px',
      fontSize: '16px',
      lineHeight: '1', // これを追加
    };
  },
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