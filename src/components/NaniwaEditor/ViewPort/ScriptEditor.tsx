import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor from "@monaco-editor/react";

interface IScriptEditor {
  scriptPath?: number;
}
export const ScriptEditor = (props: IScriptEditor) => {
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
    const controller = new AbortController();
    const signal = controller.signal;
    if (props.scriptPath){
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
      <div className={styles.navigation}>
      </div>
      <div style={{ height: "100%", width: "100%", background: "#838383" }}>
      <MonacoEditor
        height="100%"
        width="100%"
        language="javascript"
        theme="vs-dark"
        value={code.current}
        onChange={handleEditorChange}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
      />
      </div>
    </>
  )
}

const initCode = `
  /**
  * NaniwaJS
  * -公式ドキュメント: https://www.example.com/
  * -公式サンプル    : https://www.example.com/
  **/
  const engine = this;
    
  /**
   *  呼び出し時
   */
  const init = () => {}

  /**
   * 毎フレーム事の処理
   * @param state: {  }
   * @param delta: 1フレーム時間(秒)
   */
  const frameLoop = (state, delta) => {

  }
`;