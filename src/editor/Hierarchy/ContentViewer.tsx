import { BsBoxFill, BsFileImage, BsFolder } from 'react-icons/bs';
import { useEffect, useRef, useState } from 'react';
import { reqApi } from '@/services/ServciceApi';
import { DirectionalLight, LoadingManager, MathUtils, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from 'three';
import { useTranslation } from 'react-i18next';
import {
  AiFillHome,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
  AiOutlineLeft,
  AiOutlineRight,
  AiFillFolderOpen,
} from 'react-icons/ai';
import Swal from 'sweetalert2';
import { gltfLoader, InitScriptManagement } from '@ninjagl/core';
import { globalContentStore, globalScriptStore } from '../Store/Store';
import { useSession } from 'next-auth/react';
import { AssetsContextMenu } from '../Dialogs/AssetsContextMenu';
import { b64EncodeUnicode } from '@/commons/functional';
import { MdUploadFile } from 'react-icons/md';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import Image from 'next/image';
import { Tooltip } from '@nextui-org/react';

export interface IFileProps {
  url: string;
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  changeScriptEditor?: () => void;
  onDoubleClick?: (type: string, value: string, name: string) => void;
  imageUrl?: string;
}

const getExtension = (filename: string): string => {
  if (filename === undefined) return '';
  const name = filename.split('.').pop();
  return name!.toLowerCase();
};

const isImage = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

const gltf_icon = 'fileicons/gltf.png';
const object_icon = 'fileicons/object.png';
const isGLTF = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['glb', 'gltf'].includes(ext);
};

const mp3_icon = 'fileicons/mp3.png';
const isMP3 = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['mp3'].includes(ext);
};

const glsl_icon = 'fileicons/glsl.png';
const isGLSL = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['glsl'].includes(ext);
};

const js_icon = 'fileicons/js.png';
const isJS = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['js'].includes(ext);
};

const njc_icon = 'fileicons/njc.png';
const isNJC = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['njc'].includes(ext);
};

const terrain_icon = 'fileicons/terrain.png';
const isTerrain = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ['ter'].includes(ext);
};

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface IContentsBrowser {
  changeScriptEditor: () => void;
  changeProject: (url: string, name: string) => void;
}

/**
 * コンテンツブラウザ
 * @param props
 * @returns
 */
export const ContentsBrowser = (props: IContentsBrowser) => {
  const { data: session } = useSession();
  const [showContainerMenu, setShowContainerMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [containerPosition, setContainerPosition] = useState({ x: 0, y: 0 });
  const [isPersonalDir, setIsPersonalDir] = useState(false);
  const [path, setPath] = useState('');
  const [offset, setOffset] = useState(0);
  const [maxPages, setMaxPages] = useState(1);
  const { t } = useTranslation();
  const [files, setFiles] = useState<IFileProps[]>([]);
  const loadRef = useRef<HTMLDivElement>(null);

  /**
   * GLTFの画像を取得する
   * @param url
   * @param name
   * @returns
   */
  const getGLTFImage = async (url: string, name: string): Promise<string | null> => {
    if (isGLTF(name)) {
      return await CreateGLTFImage(url);
    }
    return null;
  };

  /**
   * 表示するファイルを移動
   */
  const MoveDirectory = async () => {
    if (!loadRef.current) return;
    loadRef.current.style.display = 'block';
    let prefix = path;
    // let prefix = (isPersonalDir && session) ? `users/${b64EncodeUnicode(session.user!.email as string)}/${path}`: path;
    await reqApi({
      route: 'storage/list',
      queryObject: {
        prefix: prefix.replaceAll('//', '/'),
        offset: offset,
      },
    }).then(async (res) => {
      if (res.status == 200) {
        const files: IFileProps[] = [];
        const items = res.data;
        console.log('items: resS', res);
        for (const item of items) {
          const file: IFileProps = {
            url: item.url,
            size: item.size,
            isFile: item.isFile,
            isDirectory: item.isDirectory,
            name: item.filename,
          };
          if (isGLTF(file.name)) {
            continue;
          }
          files.push(file);
        }
        setFiles(files);
        if (res.data.maxPages) {
          setMaxPages(res.data.maxPages);
        }
      }
    });
    loadRef.current.style.display = 'none';
  };

  useEffect(() => {
    MoveDirectory();
    return () => {};
  }, [path, offset, isPersonalDir]);

  const onDoubleClick = (type: 'dir' | 'gltf' | 'js' | 'njc', path: string, name: string | null = null) => {
    if (type == 'dir' && path) {
      setPath(path);
    } else if (type == 'njc' && path && name) {
      // NJCファイルをダブルクリックした場合は、エディタに読み込む
      props.changeProject(path, name);
    }
  };

  const changeOffset = (value: number) => {
    setOffset(value);
  };

  /**
   * パスを押して移動
   * @param value
   */
  const onMoveDic = (value: string) => {
    const routes = path.split('/');
    let _path = '';
    if (value.length > 0) {
      for (const route of routes) {
        if (route.length == 0) {
          continue;
        }
        _path += route + '/';
        if (route == value) {
          break;
        }
      }
    }
    setPath(_path);
    setOffset(0);
  };

  /**
   * Itemコンテナ内の右クリックメニューの表示
   */
  const handleItemContainerMenu = (event) => {
    event.preventDefault();
    setShowContainerMenu(true);
    setContainerPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  /**
   * 任意のファイルをアップロード
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    const files = e.dataTransfer.files;
    if (files.length > 0 && session) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      let _path = path;
      const uploadPath = `users/${b64EncodeUnicode(session.user!.email as string)}/${_path}`;
      const keyPath = (uploadPath + '/' + file.name).replaceAll('//', '/');
      formData.append('filePath', keyPath);
      try {
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error uploading file');
        }
        const result = await response.json();
        MoveDirectory(); //Directoryの更新
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <>
      <div className='select-none'>
        <div className='inline-block text-sm font-bold pr-3'>
          {t('contentsBrowser')}
          <span
            className='p;-2 cursor-pointer align-middle'
            onClick={() => {
              setIsPersonalDir(false);
              onMoveDic('');
            }}
          >
            <AiFillHome className='inline' />
          </span>
        </div>
        {path.split('/').map((route, idx) => {
          if (route.length == 0) {
            return <></>;
          }
          return (
            <span
              className='cursor-pointer px-1 py-2 max-w-full hover:underline'
              onClick={() => onMoveDic(route)}
              key={idx}
            >
              /{route}
            </span>
          );
        })}
      </div>
      <div
        className='mx-auto flex flex-wrap justify-between relative bg-[#000000a2] p-0.75 rounded-sm'
        onContextMenu={handleItemContainerMenu}
        onClick={handleClick}
        onMouseLeave={() => setShowContainerMenu(false)}
      >
        {showContainerMenu && (
          <AssetsContextMenu position={containerPosition} path={path} onUploadCallback={MoveDirectory} />
        )}
        {files.map((file, index) => {
          return (
            <ContentViewer
              {...file}
              onDoubleClick={onDoubleClick}
              changeScriptEditor={props.changeScriptEditor}
              onDeleteCallback={MoveDirectory}
              key={index}
            />
          );
        })}
        {session && !isPersonalDir && (
          <>
            {/* パーソナルディレクトリ */}
            <div
              className='box-border mb-1.25 justify-center items-center max-w-[50px] text-center inline-block p-0.5 relative'
              onDoubleClick={() => {
                setPath('');
                setOffset(0);
                setIsPersonalDir(true);
              }}
            >
              <div className='rounded-md bg-[#413f3f] text-center h-12 w-full mx-auto'>
                <a className='p-1.5 w-4/5 mx-auto max-h-10 text-4xl'>
                  <AiFillFolderOpen className='inline' />
                </a>
              </div>
              <div className='text-center text-xs pt-0.75 overflow-hidden whitespace-pre line-clamp-2'>Personal</div>
            </div>
          </>
        )}
        {isPersonalDir && (
          <>
            <div className='w-full p-2 bg-black rounded-md' onDrop={handleDrop} onDragOver={handleDragOver}>
              <div className='rounded-md bg-[#413f3f] text-center h-12 w-full mx-auto'>
                <a className='p-1.5 w-4/5 mx-auto max-h-10 text-4xl'>
                  <MdUploadFile className='inline' />
                </a>
              </div>
              <div className='text-center text-sm select-none pb-1'>Drag and Drop Here</div>
            </div>
          </>
        )}
        <div className='z-50 bg-[#000000b9] w-full h-full absolute hidden cursor-wait' ref={loadRef}>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white'>
            {t('nowLoading')}
          </div>
        </div>
      </div>
      <>
        {maxPages > 1 && (
          <div className='pt-1.25 relative flex justify-center items-center flex-row'>
            {offset > 0 && (
              <>
                <div
                  className='absolute flex justify-center items-center mx-0.75 px-1.25 py-0.75 rounded-md cursor-pointer transition-colors duration-200 left-0'
                  onClick={() => changeOffset(0)}
                >
                  <AiOutlineDoubleLeft className='inline' />
                </div>
                <div
                  className='absolute flex justify-center items-center mx-0.75 px-1.25 py-0.75 rounded-md cursor-pointer transition-colors duration-200 left-[25px]'
                  onClick={() => changeOffset(offset - 1)}
                >
                  <AiOutlineLeft className='inline' />
                </div>
              </>
            )}
            <div className='text-sm cursor-pointer transition-colors duration-200'>
              {offset + 1} / {maxPages}
            </div>
            {offset + 1 < maxPages && (
              <>
                <div
                  className='absolute flex justify-center items-center mx-0.75 px-1.25 py-0.75 rounded-md cursor-pointer transition-colors duration-200 right-[25px]'
                  onClick={() => changeOffset(offset + 1)}
                >
                  <AiOutlineRight className='inline' />
                </div>
                <div
                  className='absolute flex justify-center items-center mx-0.75 px-1.25 py-0.75 rounded-md cursor-pointer transition-colors duration-200 right-0'
                  onClick={() => changeOffset(maxPages - 1)}
                >
                  <AiOutlineDoubleRight className='inline' />
                </div>
              </>
            )}
          </div>
        )}
      </>
    </>
  );
};

interface IContenetViewerProps extends IFileProps {
  onDeleteCallback?: () => void;
}

export const ContentViewer = (props: IContenetViewerProps) => {
  let icon: JSX.Element | null = null;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  let tooltipTimer: NodeJS.Timeout | null = null;
  let tooltipHideTimer: NodeJS.Timeout | null = null;
  let tooltip = useRef<HTMLDivElement>(null);
  const editor = useNinjaEditor();
  const { t } = useTranslation();

  /**
   * 右クリックメニューの表示
   * @param event
   */
  const handleContextMenu = (event) => {
    event.preventDefault();
    setShowMenu(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  let contentsSelectType: 'gltf' | 'mp3' | 'js' | 'glsl' | 'image' | 'ter' | 'avt' | 'njc' | 'dir' | null = null;
  const iconImgStyle = 'p-1.5 w-4/5 mx-auto max-h-10 text-4xl';
  if (props.isFile) {
    if (isImage(props.name)) {
      icon = (
        <>
          <Image src={props.url} className={iconImgStyle} width={35} height={35} alt='icon-image' />
        </>
      );
      contentsSelectType = 'image';
    } else if (isGLTF(props.name)) {
      icon = (
        <>
          <a className={iconImgStyle}>
            <BsBoxFill className='inline' />
          </a>
        </>
      );
      contentsSelectType = 'gltf';
    } else if (isNJC(props.name)) {
      icon = (
        <>
          <img src={njc_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = 'njc';
    } else if (isMP3(props.name)) {
      icon = (
        <>
          <img src={mp3_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = 'mp3';
    } else if (isGLSL(props.name)) {
      icon = (
        <>
          <img src={glsl_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = 'glsl';
    } else if (isJS(props.name)) {
      icon = (
        <>
          <img src={js_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = 'js';
    } else if (isTerrain(props.name)) {
      icon = (
        <>
          <img src={terrain_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = 'ter';
    }
    // どれにも該当しない場合は表示しない
    else {
      console.log('Test ');
      return <></>;
    }
  } else if (props.isDirectory) {
    icon = (
      <a className={iconImgStyle}>
        <BsFolder className='inline' />
      </a>
    );
    contentsSelectType = 'dir';
  }

  const hideTooltip = () => {
    if (!tooltip.current) return;
    tooltip.current.style.display = 'none';
  };

  const viewTooltip = () => {
    if (!tooltip.current) return;
    tooltip.current.style.display = 'block';
    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer);
    }
    tooltipHideTimer = setTimeout(hideTooltip, 2000);
  };

  const onDoubleClick = async (type: string, name: string) => {
    if (props.isDirectory) {
      if (props.onDoubleClick) {
        props.onDoubleClick('dir', props.url, name);
      }
    } else if (props.isFile && type == 'js') {
      const sm = { ...InitScriptManagement };
      sm.id = MathUtils.generateUUID();
      const scriptCheck = async () => {
        try {
          const response = await fetch(props.url);
          if (response.ok) {
            const text = await response.text();
            // 特定の文字列をチェックします。
            const searchString = 'initialize';
            const searchString2 = 'frameLoop';
            if (text.includes(searchString) && text.includes(searchString2)) {
              sm.script = text;
              return true;
            }
          }
        } catch (error) {
          console.error('Error fetching file:', error);
        }
        return false;
      };
      const result = await scriptCheck();
      if (result) {
        sm.name = props.name.split('/').pop() || '';
        const success = editor.addSM(sm);
        if (!success) {
          // @ts-ignore
          Swal.fire({
            title: t('scriptError'),
            text: t('scriptErrorAlreadyText'),
            icon: 'error',
          });
        } else {
          globalScriptStore.currentSM = sm;
          if (props.changeScriptEditor) props.changeScriptEditor();
        }
      } else {
        // @ts-ignore
        Swal.fire({
          title: t('scriptError'),
          text: t('scriptErrorText'),
          icon: 'error',
        });
      }
    } else if (props.isFile && type == 'njc') {
      if (props.onDoubleClick) props.onDoubleClick('njc', props.url, name);
    }
  };

  /**
   * ファイルを選択して追加
   */
  const onDragStart = () => {
    globalContentStore.currentType = contentsSelectType;
    globalContentStore.currentUrl = `${props.url}`;
  };
  const onDragEnd = () => {
    globalContentStore.currentType = null;
    globalContentStore.currentUrl = null;
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onDoubleClick={(e) => onDoubleClick(contentsSelectType!, props.name)}
        className='box-border mb-1.25 justify-center items-center max-w-[50px] text-center inline-block p-0.5 relative'
        onDragStart={(e) => onDragStart()}
        onDragEnd={(e) => onDragEnd()}
        onMouseLeave={() => setShowMenu(false)}
      >
        {showMenu && (
          <AssetsContextMenu position={menuPosition} file={props} onDeleteCallback={props.onDeleteCallback} />
        )}
        <Tooltip
          content={
            <>
              <strong>{t('filename')}</strong>
              <br />
              {props.name}
              <br />
              <strong>{t('size')}</strong>
              <br />
              {formatBytes(props.size)}
            </>
          }
        >
          <div className='rounded-md bg-primary text-center h-[50px] w-full m-auto'>{icon}</div>
        </Tooltip>
        <div className='text-center text-xs pt-0.75 overflow-hidden whitespace-pre line-clamp-2'>{props.name}</div>
      </div>
    </>
  );
};

// const MANAGER = new LoadingManager();
// const THREE_PATH = `https://unpkg.com/three@0.154.0`;
// export const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
// export const KTX2_LOADER = new KTX2Loader( MANAGER ).setTranscoderPath( `${THREE_PATH}/examples/jsm/libs/basis/` );;

/**
 * GLTFモデルの画像を生成して取得する
 * @param gltfUrl
 * @returns
 */
const CreateGLTFImage = (gltfUrl): Promise<string | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;

  // Making Scene
  const scene = new Scene();

  // Making Camera
  const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 2);

  // Making Renderer
  const cleanup = () => {
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.clear();
    }
    if (camera) {
      camera.clear();
    }
  };

  const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
  });
  renderer.setClearColor(0x888888, 1);
  renderer.setSize(35, 35);

  // Making Light
  const directionalLight = new DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  const spotLight = new SpotLight(0xffffff);
  spotLight.position.set(-3, 3, -3);
  scene.add(spotLight);
  scene.add(directionalLight);

  // Load GLTF and Making Image
  return new Promise((resolve) => {
    gltfLoader.load(
      gltfUrl,
      (gltf) => {
        const model = gltf.scene || gltf.scenes[0];
        scene.add(model);
        renderer.render(scene, camera);
        const dataUrl = canvas.toDataURL();
        cleanup();
        return resolve(dataUrl);
      },
      (progress) => {},
      (error) => {
        console.error(error);
        cleanup();
        Swal.fire({
          title: 'Error',
          text: `Loading GLTF Error。\nFileName: ${gltfUrl}\n\n${error}`,
          icon: 'error',
          confirmButtonText: 'OK',
        }).then((result) => {
          return resolve(null);
        });
      },
    );
  });
};
