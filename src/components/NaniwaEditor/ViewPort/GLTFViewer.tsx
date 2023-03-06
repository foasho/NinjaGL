import { reqApi } from "@/services/ServciceApi";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Mesh, Object3D, Raycaster, Vector2 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";
import { NaniwaEditorContext } from "../NaniwaEditorManager";

export const GLTFViewer = () => {
    const editor = useContext(NaniwaEditorContext);
    const ref = useRef();
    const [scene, setScene] = useState<Object3D>(null)

    const handleDrop = (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        const loader = new GLTFLoader();
        loader.load(URL.createObjectURL(file), (gltf) => {
            setScene(gltf.scene);
            editor.gltfViewerObj = gltf.scene;
        });
    }

    const handleDragOver = (e) => {
        e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
    };
    
    useEffect(() => {
        if(editor.gltfViewerObj){
            setScene(editor.gltfViewerObj);
        }
    }, []);

    return (
        <>
            <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ height: "100%" }}>
                {scene ?
                    <Canvas camera={ { position: [5, 5, -10] } } ref={ref}>
                        <Environment preset="dawn" blur={0.7} background />
                        <OrbitControls/>
                        <gridHelper args={[4096, 4096]}/>
                        <ViewControlComponent object={scene} />
                    </Canvas>
                    :
                    <>
                        <div style={{ background: "#121212", height: "100%", position: "relative" }}>
                            <div style={{ color: "#fff", fontWeight: "bold", position: "absolute", width: "100%", textAlign: "center", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                ドラッグ＆ドロップでGLTFモデルを<br/>
                                アップロードしてください
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    )
}

interface IViewControl {
    object: Object3D;
}
const ViewControlComponent = (props: IViewControl) => {
    const ref = useRef<Mesh>();
    const editor = useContext(NaniwaEditorContext);
    const [enabled, setEnabled] = useState<boolean>(false);
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const { camera, scene } = useThree();

    const onMouseMove = (event) => {
        // マウスの位置を正規化する
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    const onClick = (event) => {
        // マウスの位置にあるオブジェクトを取得する
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
    
        // クリックしたオブジェクトにアウトラインを適用
        if (intersects.length > 0) {
            setEnabled(!enabled);
        }
    }

    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
        }
    }, [])

    return (
        <>
            <Selection>
                <EffectComposer enabled={enabled} autoClear={false}>
                    <Outline visibleEdgeColor={0x00ff00} hiddenEdgeColor={0x00ff00} edgeStrength={300} />
                </EffectComposer>
                <Select enabled>
                    <mesh ref={ref} onClick={(e) => onClick(e)}>
                        <primitive object={props.object} />
                    </mesh>
                </Select>
            </Selection>
        </>
    )
}