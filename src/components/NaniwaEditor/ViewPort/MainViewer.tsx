import { Environment, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { Box3, Euler, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { IObjectManagement } from "@/engine/core/NaniwaProps";


export const MainViewer = () => {
    const camRef = useRef<any>();
    const editor = useContext(NaniwaEditorContext);
    const [oms, setOMs] = useState<IObjectManagement[]>([]);
    let rightHold = false; // 右クリック中かどうか
    
    const handleDrop = (e) => {
        e.preventDefault();
        const loader = new GLTFLoader();
        if (!editor.contentsSelect){
            const file = e.dataTransfer.files[0];
            console.log("アップロードテスト");
            console.log(e);  
            loader.load(URL.createObjectURL(file), (gltf) => {
                editor.setObjectManagement(gltf.scene.clone());
                setOMs([...editor.oms]);
            });
        }
        else {
            loader.load(
                editor.contentsSelectPath,
                async (gltf) => {
                    const scene = gltf.scene || gltf.scenes[0] as Object3D;
                    scene.traverse((node: Mesh) => { 
                        if ((node as Mesh).isMesh){
                            if (node.geometry){
                                node.castShadow = true;
                                node.receiveShadow = true;
                            }
                        }
                    });
                    editor.setObjectManagement(scene.clone());
                    setOMs([...editor.oms]);
                },
                (xhr) => {},
                async (err) => {
                    console.log("モデル読み込みエラ―");
                    console.log(err);
                }
            )
        }
    }

    const enabledCamera = (trig: boolean) => {
        if (camRef.current){
            camRef.current.enabled = trig;
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
    };

    return (
        <div style={{ height: "100%" }}>
            <Canvas 
                id="mainviewcanvas"
                camera={ { position: [-3, 3, -6] } }
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
            >
                <Sky
                    distance={450000}
                    sunPosition={[0, 1, 0]}
                    inclination={0}
                    azimuth={0}
                />
                <directionalLight />
                <OrbitControls makeDefault={true} ref={camRef}/>
                <gridHelper args={[4096, 4096]}/>
                {oms.map(om => {
                    if (om.type == "object"){
                        return <MyObject om={om} onStopCamera={enabledCamera} />
                    }
                })}
            </Canvas>
        </div>
    )
}

interface IMyObject {
    om: IObjectManagement;
    onStopCamera: (value: boolean) => void;
}

/**
 * 基本的なオブジェクトのみ
 * @param props 
 * @returns 
 */
const MyObject = (props: IMyObject) => {
    const object: Object3D = props.om.object;
    object.traverse((node: any) => {
        if (node.isMesh && node instanceof Mesh){
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })

    const editor = useContext(NaniwaEditorContext);
    const [visible, setVisible] = useState<boolean>(false);
    const handleDrag = useRef<boolean>(false);
    // UUID
    const uuid = object.uuid;

    // Get Size
    const size = new Box3().setFromObject(object);
    let len = 1;
    if ((size.max.x - size.min.x) > len){
        len = (size.max.x - size.min.x);
    }
    if ((size.max.y - size.min.y) > len){
        len = (size.max.y - size.min.y);
    }
    if ((size.max.z - size.min.z) > len){
        len = (size.max.z - size.min.z);
    }

    const onClick = (e, value: boolean) => {
        if (value){
            // 選択できるのは１つのみにする
            if (!editor.selectedIds.includes(uuid)){
                editor.selectObject(uuid);
                setVisible(true);
            }
        }
        else {
            if (e.type == "click" &&!handleDrag.current){
                editor.unSelectObject(uuid);
                setVisible(false); 
            }
        }
    }

    const onDragStart = () => {
        handleDrag.current = true;
    }
    const onDragEnd = () => {
        handleDrag.current = false;
    }

    const onDrag = (e) => {
        // 位置/回転率の確認
        if (editor.mode == "position"){
            const position = new Vector3().setFromMatrixPosition(e);
            editor.setPosition(uuid, position);
        }
        else if (editor.mode == "scale"){
            const scale = new Vector3().setFromMatrixScale(e);
            editor.setScale(uuid, scale);
        }
        const rotation = new Euler().setFromRotationMatrix(e);
        editor.setRotation(uuid, rotation);
        handleDrag.current = true;
    }

    return (
        <>
            <PivotControls 
                scale={len*0.5}
                visible={visible} 
                disableAxes={!visible}
                disableSliders={!visible}
                disableRotations={!visible}
                onDrag={(e) => onDrag(e)}
                onDragStart={() => onDragStart()}
                onDragEnd={() => onDragEnd()}
            >
                <primitive 
                    object={object}
                    onClick={(e) => {
                        onClick(e, true)
                    }}
                    onPointerMissed={(e) => {
                        onClick(e, false)
                    }}
                />
            </PivotControls>
        </>
    )
}

/**
 * 
 */