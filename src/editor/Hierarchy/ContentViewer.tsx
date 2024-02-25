import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AiFillHome, AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { BsFolder } from "react-icons/bs";
import { MdUploadFile } from "react-icons/md";
import Image from "next/image";
import { Tooltip } from "@nextui-org/react";
import { gltfLoader, InitScriptManagement } from "@ninjagl/core";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { DirectionalLight, MathUtils, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from "three";

import { b64EncodeUnicode } from "@/commons/functional";
import { Loading2D } from "@/commons/Loading2D";
import { MySwal } from "@/commons/Swal";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import {
  formatBytes,
  glsl_icon,
  gltf_icon,
  isGLSL,
  isGLTF,
  isImage,
  isJS,
  isMP3,
  isNJC,
  js_icon,
  mp3_icon,
  njc_icon,
} from "@/utils/files";
import { uploadFile } from "@/utils/upload";

import { AssetsContextMenu } from "../Dialogs/AssetsContextMenu";
import { globalContentStore, globalScriptStore } from "../Store/Store";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [containerPosition, setContainerPosition] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState("");
  const [offset, setOffset] = useState(0);
  const [maxPages, setMaxPages] = useState(1);
  const { t } = useTranslation();
  const [files, setFiles] = useState<IFileProps[]>([]);
  const loadRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 表示するファイルを移動
   */
  const MoveDirectory = async () => {
    if (isLoading || !session) return;
    setIsLoading(true);
    // 必ずUserDirectoryをつける
    const prefix = path.includes(b64EncodeUnicode(session.user!.email as string))
      ? path
      : `${b64EncodeUnicode(session.user!.email as string)}/${path}`;
    try {
      const response = await fetch(`/api/storage/list?prefix=${prefix.replaceAll("//", "/")}&offset=${offset}`);
      const items = await response.json();
      const files: IFileProps[] = [];
      for (const item of items) {
        const file: IFileProps = {
          url: item.url,
          size: item.size,
          isFile: item.isFile,
          isDirectory: item.isDirectory,
          name: item.filename,
        };
        files.push(file);
      }
      setFiles(files);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    MoveDirectory();
    return () => {};
  }, [path, offset]);

  const onDoubleClick = (type: "dir" | "gltf" | "js" | "njc", path: string, name: string | null = null) => {
    if (type == "dir" && path) {
      setPath(path);
    } else if (type == "njc" && path && name) {
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
    const routes = path.split("/");
    let _path = "";
    if (value.length > 0) {
      for (const route of routes) {
        if (route.length == 0) {
          continue;
        }
        _path += route + "/";
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

  const _uploadFile = async (file: File) => {
    if (!session) {
      toast.error(t("requireLogin"));
      return;
    }
    const filename = file.name;
    // ClientUpload以外の時に、4.5MB以上のファイルはアップロードできない
    if (process.env.NEXT_PUBLIC_UPLOAD_TYPE !== "client" && file.size > 4.5 * 1024 * 1024) {
      MySwal.fire({
        title: "4.5MB以上のファイルはアップロードできません",
      });
      return;
    }
    const filePath = `${b64EncodeUnicode(session.user!.email as string)}/${filename}`;
    try {
      const res = await uploadFile(file, filePath);

      if (!res || !res.url) {
        throw new Error("Error uploading file");
      }
      MySwal.fire({
        title: "アップロードに成功しました",
      });
      MoveDirectory(); //Directoryの更新
    } catch (error) {
      console.error("Error:", error.message);
    }
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
      _uploadFile(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <>
      <div className='select-none'>
        <div className='inline-block pb-1 pr-3 text-sm font-bold'>
          {t("contentsBrowser")}
          <span
            className='cursor-pointer pl-2 text-lg'
            onClick={() => {
              onMoveDic("");
            }}
          >
            <AiFillHome className='inline' />
          </span>
        </div>
        <div className='pb-2'>
          {path.split("/").map((route, idx) => {
            if (route.length == 0) {
              return null;
            }
            if (session && b64EncodeUnicode(session.user!.email as string) == route) {
              return null;
            }
            return (
              <span
                className='max-w-full cursor-pointer px-1 py-2 hover:underline'
                onClick={() => onMoveDic(route)}
                key={idx}
              >
                /{route}
              </span>
            );
          })}
        </div>
      </div>
      <div
        className='relative min-h-[40px] rounded-lg bg-[#000000a2]'
        onContextMenu={handleItemContainerMenu}
        onClick={handleClick}
        onMouseLeave={() => setShowContainerMenu(false)}
      >
        {showContainerMenu && (
          <AssetsContextMenu
            position={containerPosition}
            path={path}
            onUploadCallback={MoveDirectory}
            onDeleteCallback={MoveDirectory}
          />
        )}
        <div className='grid max-h-[25vh] w-full grid-cols-3 gap-1 overflow-y-auto  overflow-x-hidden p-1'>
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
        </div>
        {isLoading && (
          <div className='absolute z-50 hidden h-full w-full cursor-wait bg-[#000000b9]'>
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white'>
              <Loading2D className='h-32' />
            </div>
          </div>
        )}
      </div>
      {/** アップロード */}
      <div
        className='col-span-3 mt-2 w-full rounded-md bg-black p-2'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => {
          // Inputをクリックしてファイルを選択
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type='file'
          className='hidden'
          onChange={async (e) => {
            if (!session) return;
            const files = e.target.files;
            if (files && files.length > 0) {
              const file = files[0];
              _uploadFile(file);
            }
          }}
        />
        <div className='mx-auto h-10 w-full rounded-md bg-[#413f3f] text-center'>
          <a className='mx-auto cursor-pointer'>
            <MdUploadFile className='inline p-1.5 text-4xl' />
            <span className='align-middle text-sm'>Upload</span>
          </a>
        </div>
      </div>
      <>
        {maxPages > 1 && (
          <div className='relative flex flex-row items-center justify-center pt-1.5'>
            {offset > 0 && (
              <>
                <div
                  className='absolute left-0 mx-0.5 flex cursor-pointer items-center justify-center rounded-md px-1.5 py-0.5 transition-colors duration-200'
                  onClick={() => changeOffset(0)}
                >
                  <AiOutlineDoubleLeft className='inline' />
                </div>
                <div
                  className='absolute left-[25px] mx-0.5 flex cursor-pointer items-center justify-center rounded-md px-1.5 py-0.5 transition-colors duration-200'
                  onClick={() => changeOffset(offset - 1)}
                >
                  <AiOutlineLeft className='inline' />
                </div>
              </>
            )}
            <div className='cursor-pointer text-sm transition-colors duration-200'>
              {offset + 1} / {maxPages}
            </div>
            {offset + 1 < maxPages && (
              <>
                <div
                  className='absolute right-[25px] mx-0.5 flex cursor-pointer items-center justify-center rounded-md px-1.5 py-0.5 transition-colors duration-200'
                  onClick={() => changeOffset(offset + 1)}
                >
                  <AiOutlineRight className='inline' />
                </div>
                <div
                  className='absolute right-0 mx-0.5 flex cursor-pointer items-center justify-center rounded-md px-1.5 py-0.5 transition-colors duration-200'
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
  onUploadCallback?: () => void;
}

export const ContentViewer = (props: IContenetViewerProps) => {
  let icon: JSX.Element | null = null;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
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

  let contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" | "njc" | "dir" | null = null;
  const iconImgStyle = "p-1.5 w-4/5 mx-auto max-h-10 text-4xl select inline";
  if (props.isFile) {
    if (isImage(props.name)) {
      icon = (
        <>
          <Image src={props.url} className={iconImgStyle} width={35} height={35} alt='icon-image' draggable={true} />
        </>
      );
      contentsSelectType = "image";
    } else if (isGLTF(props.name)) {
      icon = (
        <>
          <a className={iconImgStyle}>
            <Image
              src={gltf_icon}
              className={iconImgStyle + " cursor-grab"}
              width={35}
              height={35}
              alt='icon-gltf'
              draggable={true}
            />
          </a>
        </>
      );
      contentsSelectType = "gltf";
    } else if (isNJC(props.name)) {
      icon = (
        <>
          <Image width={32} height={32} alt='' src={njc_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = "njc";
    } else if (isMP3(props.name)) {
      icon = (
        <>
          <Image width={32} height={32} alt='' src={mp3_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = "mp3";
    } else if (isGLSL(props.name)) {
      icon = (
        <>
          <Image width={32} height={32} alt='' src={glsl_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = "glsl";
    } else if (isJS(props.name)) {
      icon = (
        <>
          <Image width={32} height={32} alt='' src={js_icon} className={iconImgStyle} data-path={props.name} />
        </>
      );
      contentsSelectType = "js";
    }
    // どれにも該当しない場合は表示しない
    else {
      return <></>;
    }
  } else if (props.isDirectory) {
    icon = (
      <a className={iconImgStyle}>
        <BsFolder className='inline' />
      </a>
    );
    contentsSelectType = "dir";
  }

  const onDoubleClick = async (type: string, name: string) => {
    if (props.isDirectory) {
      if (props.onDoubleClick) {
        props.onDoubleClick("dir", props.url, name);
      }
    } else if (props.isFile && type == "js") {
      const sm = { ...InitScriptManagement };
      sm.id = MathUtils.generateUUID();
      const scriptCheck = async () => {
        try {
          const response = await fetch(props.url);
          if (response.ok) {
            const text = await response.text();
            // 特定の文字列をチェックします。
            const searchString = "initialize";
            const searchString2 = "frameLoop";
            if (text.includes(searchString) && text.includes(searchString2)) {
              sm.script = text;
              return true;
            }
          }
        } catch (error) {
          console.error("Error fetching file:", error);
        }
        return false;
      };
      const result = await scriptCheck();
      if (result) {
        sm.name = props.name.split("/").pop() || "";
        const success = editor.addSM(sm);
        if (!success) {
          MySwal.fire({
            title: t("scriptError"),
            text: t("scriptErrorAlreadyText"),
            icon: "error",
          });
        } else {
          globalScriptStore.currentSM = sm;
          if (props.changeScriptEditor) props.changeScriptEditor();
        }
      } else {
        MySwal.fire({
          title: t("scriptError"),
          text: t("scriptErrorText"),
          icon: "error",
        });
      }
    } else if (props.isFile && type == "njc") {
      if (props.onDoubleClick) props.onDoubleClick("njc", props.url, name);
    } else if (props.isFile && type == "gltf") {
      // モデルを配置
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*model`,
        type: "object",
        args: {
          url: props.url,
          castShadow: true,
          receiveShadow: false,
          distance: 25,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      });
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
        className='relative mb-1.5 box-border inline-block max-w-[50px] items-center justify-center p-0.5 text-center'
        onDragStart={(e) => onDragStart()}
        onDragEnd={(e) => onDragEnd()}
        onMouseLeave={() => setShowMenu(false)}
      >
        {showMenu && (
          <AssetsContextMenu
            position={menuPosition}
            file={props}
            onDeleteCallback={props.onDeleteCallback}
            onUploadCallback={props.onUploadCallback}
          />
        )}
        <Tooltip
          isDisabled={!props.isFile}
          content={
            <div className='text-left'>
              <strong>{t("filename")}:&nbsp;</strong>
              {props.name}
              <br />
              <strong>{t("size")}:&nbsp;</strong>
              {formatBytes(props.size)}
            </div>
          }
        >
          <div className='m-auto h-[50px] w-full rounded-md bg-primary text-center'>{icon}</div>
        </Tooltip>
        <div className='line-clamp-2 overflow-hidden whitespace-pre pt-0.5 text-center text-xs'>{props.name}</div>
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
  const canvas = document.createElement("canvas");
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
          title: "Error",
          text: `Loading GLTF Error。\nFileName: ${gltfUrl}\n\n${error}`,
          icon: "error",
          confirmButtonText: "OK",
        }).then((result) => {
          return resolve(null);
        });
      },
    );
  });
};
