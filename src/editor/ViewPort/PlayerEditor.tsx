import { Suspense, useRef, useState } from 'react';

import { convertObjectToFile } from '@ninjagl/core';
import { Center, ContactShadows, Environment, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { Group } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import tunnel from 'tunnel-rat';
import { useSnapshot } from 'valtio';

import { b64EncodeUnicode } from '@/commons/functional';
import { Loading2D } from '@/commons/Loading2D';
import { MySwal } from '@/commons/Swal';

import { globalPlayerStore } from '../Store/Store';

const dom = tunnel();

export const PlayerEditor = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const playerState = useSnapshot(globalPlayerStore);
  const { t } = useTranslation();
  const { data: session } = useSession();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    const files = e.dataTransfer.files;
    if (files.length > 0 && session) {
      const file = files[0];
      // ファイル名が.glbか.gltfでなければエラー
      const ext = file.name.split('.').pop();
      if (ext !== 'glb' && ext !== 'gltf') {
        MySwal.fire({
          icon: 'error',
          title: t('error'),
          text: t('leastSelectGLTF'),
        });
        return;
      }
      setSelected(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  /**
   * 保存する
   */
  const onSave = async (animMapper, scene) => {
    // 最低限typeが選択されていればOK
    if (playerState.type && scene) {
      //ファイル名の確認
      const target = SkeletonUtils.clone(scene);
      // target.animations = animations;
      const type = playerState.type;
      target.userData = {
        type: type,
        animMapper: animMapper,
        // offsetParams: offsetParams,
        defaultMode: 'tp',
      };
      const file = await convertObjectToFile(target);
      MySwal.fire({
        title: t('inputFileName'),
        input: 'text',
        showCancelButton: true,
        confirmButtonText: t('confirmSave'),
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return MySwal.showValidationMessage(t('leastInput'));
          }
          if (session) {
            // ログインしていればストレージに保存
            const formData = new FormData();
            formData.append('file', file);
            // formData.append("file", blob);
            const uploadPath = `users/${b64EncodeUnicode(session.user!.email as string)}/players`;
            const keyPath = (uploadPath + `/${inputStr}.glb`).replaceAll('//', '/');
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
              MySwal.fire({
                icon: 'success',
                title: t('success'),
                text: t('saveSuccess') + `\npersonal/players/${inputStr}.glb`,
              });
            } catch (error) {
              console.error('Error:', error.message);
            }
          }
        },
        allowOutsideClick: function () {
          return !Swal.isLoading();
        },
      });
    } else {
      // @ts-ignore
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('leastSelect'),
      });
    }
  };

  return (
    <>
      <div className='relative h-full'>
        <div className='absolute right-4 top-8 rounded-lg bg-cyber/50 p-3'>
          <dom.Out />
        </div>
        {selected ? (
          <Suspense fallback={<Loading2D />}>
            <Canvas shadows>
              <Environment preset='dawn' blur={0.7} background />
              <OrbitControls />
              <ModelPreview url={URL.createObjectURL(selected)} />
              {/* <gridHelper args={[4096, 4096]} />
              <Model obj={scene} />
              <PlayerEditorUpdate
                selectAnim={selectAnim ? selectAnim : ''}
                animations={animations}
                mixer={mixer ? mixer : new AnimationMixer(new Object3D())}
                onCallback={changeSelectAnim}
              /> */}
            </Canvas>
          </Suspense>
        ) : (
          <>
            <div
              style={{ background: '#121212', height: '100%', position: 'relative' }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.click();
                }
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  position: 'absolute',
                  width: '100%',
                  textAlign: 'center',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {t('uploadGLTF')}
              </div>
              <input
                type='file'
                ref={inputRef}
                className='hidden'
                accept='.glb,.gltf'
                onInput={(e) => {
                  if (e.currentTarget.files) {
                    if (e.currentTarget.files.length > 0) {
                      setSelected(e.currentTarget.files[0]);
                    }
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

const ModelPreview = ({ url }: { url: string }) => {
  const { scene, animations } = useGLTF(url);
  const { ref, mixer, actions } = useAnimations(animations);
  const grp = useRef<Group>(null);

  return (
    <>
      <Center>
        <group ref={grp}>
          {/** @ts-ignore */}
          <mesh ref={ref}>
            <primitive object={scene} />
          </mesh>
          <ContactShadows />
        </group>
      </Center>
    </>
  );
};
