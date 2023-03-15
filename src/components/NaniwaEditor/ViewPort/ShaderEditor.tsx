import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor from "@monaco-editor/react";
import type { languages } from 'monaco-editor'

interface IShaderEditor {
  shaderPath?: number;
}
export const ShaderEditor = (props: IShaderEditor) => {

  const code = useRef<string>(initCode);
  const [scriptPath, setScriptPath] = useState<string>(null);

  const handleEditorChange = (value) => {
    code.current = value;
  };

  const saveCode = async() => {
    if (!scriptPath){
      // 新規作成の場合は、ファイル名を名付ける
    }
  }

  /**
   * ファイル指定して起動する場合は、初期Codeはそのファイルを読み込む
   */
  useEffect(() => {
    // Register a new language called "glsl"
    // monaco.languages.register({ id: 'glsl' });

    // // Configure the language
    // monaco.languages.setLanguageConfiguration('glsl', {
    //   comments: {
    //     lineComment: '//',
    //     blockComment: ['/*', '*/'],
    //   },
    //   brackets: [
    //     ['{', '}'],
    //     ['[', ']'],
    //     ['(', ')'],
    //   ],
    //   autoClosingPairs: [
    //     { open: '{', close: '}' },
    //     { open: '[', close: ']' },
    //     { open: '(', close: ')' },
    //     { open: '/*', close: '*/' },
    //   ],
    //   surroundingPairs: [
    //     { open: '{', close: '}' },
    //     { open: '[', close: ']' },
    //     { open: '(', close: ')' },
    //   ],
    // });
    // Configure the GLSL language highlighting
    // monaco.languages.setMonarchTokensProvider('glsl', {});

    const controller = new AbortController();
    const signal = controller.signal;
    if (props.shaderPath){
      const fetchData = async () => {
        try {
          const response = await fetch(scriptPath, { signal });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const jsonData = await response.json();
          code.current = jsonData;
          setScriptPath(scriptPath);
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
  }, [scriptPath]);

  return (
    <>
      <MonacoEditor
        language="glsl"
        theme="vs-dark"
        value={code.current}
        onChange={handleEditorChange}
        // editorDidMount={handleEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
      />
    </>
  )
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
const initCode = `
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
 * GLSLの定義
 */


// export const conf: languages.LanguageConfiguration = {
//   comments: {
//     lineComment: '//',
//     blockComment: ['/*', '*/']
//   },
//   brackets: [
//     ['{', '}'],
//     ['[', ']'],
//     ['(', ')']
//   ],
//   autoClosingPairs: [
//     { open: '[', close: ']' },
//     { open: '{', close: '}' },
//     { open: '(', close: ')' },
//     { open: "'", close: "'", notIn: ['string', 'comment'] },
//     { open: '"', close: '"', notIn: ['string'] }
//   ],
//   surroundingPairs: [
//     { open: '{', close: '}' },
//     { open: '[', close: ']' },
//     { open: '(', close: ')' },
//     { open: '"', close: '"' },
//     { open: "'", close: "'" }
//   ]
// }

// export const keywords = [
//   'const', 'uniform', 'break', 'continue',
//   'do', 'for', 'while', 'if', 'else', 'switch', 'case', 'in', 'out', 'inout', 'true', 'false',
//   'invariant', 'discard', 'return', 'sampler2D', 'samplerCube', 'sampler3D', 'struct',
//   'radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'pow', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
//   'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt', 'abs', 'sign', 'floor', 'ceil', 'round', 'roundEven', 'trunc', 'fract', 'mod', 'modf',
//   'min', 'max', 'clamp', 'mix', 'step', 'smoothstep', 'length', 'distance', 'dot', 'cross ',
//   'determinant', 'inverse', 'normalize', 'faceforward', 'reflect', 'refract', 'matrixCompMult', 'outerProduct', 'transpose', 'lessThan ',
//   'lessThanEqual', 'greaterThan', 'greaterThanEqual', 'equal', 'notEqual', 'any', 'all', 'not', 'packUnorm2x16', 'unpackUnorm2x16', 'packSnorm2x16', 'unpackSnorm2x16', 'packHalf2x16', 'unpackHalf2x16',
//   'dFdx', 'dFdy', 'fwidth', 'textureSize', 'texture', 'textureProj', 'textureLod', 'textureGrad', 'texelFetch', 'texelFetchOffset',
//   'textureProjLod', 'textureLodOffset', 'textureGradOffset', 'textureProjLodOffset', 'textureProjGrad', 'intBitsToFloat', 'uintBitsToFloat', 'floatBitsToInt', 'floatBitsToUint', 'isnan', 'isinf',
//   'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4', 'bvec2', 'bvec3', 'bvec4',
//   'mat2', 'mat3', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'mat4',
//   'float', 'int', 'uint', 'void', 'bool',
// ]

// export const language = <languages.IMonarchLanguage>{
//   tokenPostfix: '.glsl',
//   // Set defaultToken to invalid to see what you do not tokenize yet
//   defaultToken: 'invalid',
//   keywords,
//   operators: [
//     '=',
//     '>',
//     '<',
//     '!',
//     '~',
//     '?',
//     ':',
//     '==',
//     '<=',
//     '>=',
//     '!=',
//     '&&',
//     '||',
//     '++',
//     '--',
//     '+',
//     '-',
//     '*',
//     '/',
//     '&',
//     '|',
//     '^',
//     '%',
//     '<<',
//     '>>',
//     '>>>',
//     '+=',
//     '-=',
//     '*=',
//     '/=',
//     '&=',
//     '|=',
//     '^=',
//     '%=',
//     '<<=',
//     '>>=',
//     '>>>='
//   ],
//   symbols: /[=><!~?:&|+\-*\/\^%]+/,
//   escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
//   integersuffix: /([uU](ll|LL|l|L)|(ll|LL|l|L)?[uU]?)/,
//   floatsuffix: /[fFlL]?/,
//   encoding: /u|u8|U|L/,

//   tokenizer: {
//     root: [
//       // identifiers and keywords
//       [
//         /[a-zA-Z_]\w*/,
//         {
//           cases: {
//             '@keywords': { token: 'keyword.$0' },
//             '@default': 'identifier'
//           }
//         }
//       ],

//       // Preprocessor directive (#define)
//       [/^\s*#\s*\w+/, 'keyword.directive'],

//       // whitespace
//       { include: '@whitespace' },

//       // delimiters and operators
//       [/[{}()\[\]]/, '@brackets'],
//       [/@symbols/, {
//         cases: {
//           '@operators': 'operator',
//           '@default': ''
//         }
//       }],

//       // numbers
//       [/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/, 'number.float'],
//       [/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/, 'number.float'],
//       [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
//       [/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
//       [/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
//       [/\d[\d']*\d(@integersuffix)/, 'number'],
//       [/\d(@integersuffix)/, 'number'],

//       // delimiter: after number because of .\d floats
//       [/[;,.]/, 'delimiter']
//     ],

//     comment: [
//       [/[^\/*]+/, 'comment'],
//       [/\/\*/, 'comment', '@push'],
//       ['\\*/', 'comment', '@pop'],
//       [/[\/*]/, 'comment']
//     ],

//     // Does it have strings?
//     string: [
//       [/[^\\"]+/, 'string'],
//       [/@escapes/, 'string.escape'],
//       [/\\./, 'string.escape.invalid'],
//       [/"/, {
//         token: 'string.quote',
//         bracket: '@close',
//         next: '@pop'
//       }]
//     ],

//     whitespace: [
//       [/[ \t\r\n]+/, 'white'],
//       [/\/\*/, 'comment', '@comment'],
//       [/\/\/.*$/, 'comment']
//     ]
//   }
// }