import { useEffect, useRef, useState } from "react";

import MonacoEditor from "@monaco-editor/react";
import { IScriptManagement } from "@ninjagl/core";
import { PutBlobResult } from "@vercel/blob";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MathUtils } from "three";
import { useSnapshot } from "valtio";

import { b64EncodeUnicode } from "@/commons/functional";
import { MySwal } from "@/commons/Swal";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { globalScriptStore } from "../Store/Store";

export const ScriptEditor = () => {
  const { data: session } = useSession();
  const myeditor = useNinjaEditor();
  const scriptState = useSnapshot(globalScriptStore);
  const [name, setName] = useState<string>();
  const [pause, setPause] = useState<boolean>(true);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const code = useRef<string>(initCode);
  const { t } = useTranslation();

  /**
   * エディタの変更値を反映
   * @param value
   */
  const handleEditorChange = (value: string) => {
    if (code.current) code.current = value;
  };

  /**
   * 予測変換を設定
   * @param monaco
   */
  const handleEditorDidMount = (monaco: any, editor: any) => {
    // 入力付加項目とSuggentionの設定
    monaco.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: async (model: any, position: any, token: any) => {
        // 現在のカーソル位置の前のテキストを取得します。
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const suggestions = [];
        if (textUntilPosition.includes("EngineInstance.")) {
          // @ts-ignore
          suggestions.push({
            label: "getPositionByName",
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Get ObjectPosition by Name",
            insertText: "getPositionByName()",
          });
        } else {
          suggestions.push(
            // @ts-ignore
            {
              label: "EngineInstance",
              kind: monaco.languages.CompletionItemKind.Module,
              documentation: "EngineInstance",
              insertText: "EngineInstance",
            },
            {
              label: "userData",
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: "userData",
              insertText: "userData",
            },
            {
              label: "MyTesting",
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: "MyTesting",
              insertText: "MyTesting",
            },
          );
        }

        return Promise.resolve({ suggestions });
      },
    });
  };

  /**
   * スクリプトをbinary化
   */
  const convertFile = async (textData: string): Promise<File> => {
    const blob = new Blob([textData], { type: "text/plain" });
    const file = new File([blob], "myTextFile.txt");
    return file;
  };

  /**
   * コードを保存する
   * @param script
   * @param filename
   * @returns
   */
  const saveCode = async (filename: string) => {
    if (session && code.current) {
      const file = await convertFile(code.current);
      const uploadPath = `${b64EncodeUnicode(session.user!.email as string)}/Scripts/${filename}`;
      const response = await fetch(`/api/storage/upload?filename=${uploadPath}`, {
        method: "POST",
        body: file,
      });
      const blob = (await response.json()) as PutBlobResult;

      if (!blob.url) {
        throw new Error("Error uploading file");
      }
      if (scriptState.currentSM && globalScriptStore.currentSM) {
        const sm = myeditor.getSMById(scriptState.currentSM.id);
        if (sm) sm.script = code.current;
        globalScriptStore.currentSM.script = code.current;
      } else {
        const newSM: IScriptManagement = {
          id: scriptState.currentSM ? scriptState.currentSM.id : MathUtils.generateUUID(),
          type: "script",
          name: filename,
          script: code.current,
        };
        myeditor.addSM(newSM);
        globalScriptStore.currentSM = newSM;
      }
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
    }
  };

  /**
   * 保存
   */
  const onSave = async () => {
    if (scriptState.currentSM) {
      const filename = scriptState.currentSM.name.replace(".js", "") + ".js";
      await saveCode(filename);
    } else {
      MySwal.fire({
        title: "ファイル名を決めてください",
        input: "text",
        showCancelButton: true,
        confirmButtonText: "保存",
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return MySwal.showValidationMessage("1文字以上いれてね");
          }
          return inputStr.replace(".js", "");
        },
        allowOutsideClick: function () {
          return !MySwal.isLoading();
        },
      }).then(async (result) => {
        if (result.value) {
          const filename = result.value + ".js";
          setName(filename);
          await saveCode(filename);
        }
      });
    }
  };
  const handlerSave = (event: any) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      onSave();
    }
  };

  /**
   * プレビュー
   */
  const onPreview = () => {
    MySwal.fire({
      title: "unimplemented",
    });
    // setIsPreview(!isPreview);
  };

  /**
   * ファイル指定して起動する場合は、初期Codeはそのファイルを読み込む
   */
  useEffect(() => {
    if (scriptState.currentSM) {
      code.current = scriptState.currentSM.script;
      setName(scriptState.currentSM.name);
    } else {
      setName(undefined);
    }
    // 保存をオーバーライド
    document.addEventListener("keydown", handlerSave);
    return () => {
      document.removeEventListener("keydown", handlerSave);
    };
  }, [scriptState.currentSM]);

  return (
    <>
      <div className='h-full bg-primary'>
        <div className='absolute bottom-8 right-8 z-20 rounded-lg bg-cyber/25 p-3'>
          <div className='pb-2 text-center font-bold text-white'>{name ? name : "*Untitled.js"}</div>
          <div
            className='float-right inline-block cursor-pointer bg-cyber px-3.5 py-[5px] font-bold'
            onClick={() => onSave()}
          >
            Save
          </div>
          <div className='float-right bg-[#494949] px-2.5 py-[5px] text-white' onClick={() => onPreview()}>
            Preview
          </div>
          {/** Previewが未実装 */}
          {/* {isPreview && (
            <>
              <div>
                <AiOutlineReload className='inline' />
              </div>
              <div>{pause ? <AiOutlinePause className='inline' /> : <AiOutlineCaretRight className='inline' />}</div>
            </>
          )} */}
        </div>
        <div className='h-full w-full bg-[#838383] pt-6'>
          <MonacoEditor
            height='100%'
            width='100%'
            language='javascript'
            theme='vs-dark'
            value={code.current}
            onChange={(value: any) => handleEditorChange(value)}
            onMount={(editor, monaco) => handleEditorDidMount(monaco, editor)}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: "line",
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </>
  );
};

const initCode = `
/**
* NinjaGL
* -公式ドキュメント: https://ninjagl.vercel.app/docs/scripts
**/

/**
 *  呼び出し時
 */
async function initialize() {
  // your code
}

/**
 * 毎フレーム事の処理
 * @param state: { elapsedTime: 経過時間, mouse: { x, y } }
 * @param delta: 1フレーム時間(秒) ex)0.016
 * @param input: 
 *  { 
 *    forward: boolean, 
 *    backward: boolean, 
 *    left: boolean, 
 *    right: boolean, 
 *    jump: boolean, 
 *    dash: boolean, 
 *    actio: boolean, 
 *    pressedKeys: [] 
 * }
 */
async function frameLoop(state, delta, input) {
  // your code
}
`;
