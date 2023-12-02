import { useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';

const codeStared = `
import { NinjaGL } from "@ninjagl/core";

function App() {

    return (
        <NinjaGL njcPath={"<YourNjcFile>"} />
    );
}
`;

const codeMerge = `
import { NinjaGL } from "@ninjagl/core";

function App() {

    return (
        <NinjaGL njcPath={"<YourNjcFile>"} >
            <!-- Your React Three Fiber Code -->
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="hotpink" />
            </mesh>
        </NinjaGL>
    );
}
`;

interface IResponse {
  response: () => void;
}
export const HelperDialog = (prop: IResponse) => {
  const { t } = useTranslation();
  const startedCode = useRef<string>();
  const onClose = () => {
    prop.response();
  };
  const handleClickOutside = (event) => {
    if (event.target.classList.contains('selectNewObjectDialog')) {
      prop.response();
    }
  };
  return (
    <div onClick={handleClickOutside}>
      <div>
        <div>{t('Help')}</div>
        <div>Version: 0.1</div>
        <br />
        <div>
          <div>Install</div>
          <div>
            <SyntaxHighlighter language='bash'>npm install @ninjagl/core</SyntaxHighlighter>
          </div>
        </div>
        <br />
        <div>
          <div>Usage</div>
          <div>
            <SyntaxHighlighter language='react'>{codeStared}</SyntaxHighlighter>
          </div>
        </div>
        <br />
        <div>
          <div>Merge</div>
          <div>
            <SyntaxHighlighter language='react'>{codeMerge}</SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 新しいオブジェクトの選択ダイアログ表示
 * @returns
 */
export const showHelperDialog = async () => {
  return new Promise((resolve) => {
    const dialogContainer = document.getElementById('myDialog') as HTMLElement;
    const root = ReactDOM.createRoot(dialogContainer);
    const handleDialogClose = () => {
      root.unmount();
      resolve(null);
    };
    root.render(<HelperDialog response={handleDialogClose} />);
  });
};
