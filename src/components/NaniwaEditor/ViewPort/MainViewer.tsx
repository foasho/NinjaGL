import { Environment, OrbitControls, PivotControls } from "@react-three/drei";
import { Euler, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { IObjectManagement } from "@/engine/core/NaniwaProps";


export const MainViewer = () => {
    const camRef = useRef<any>();
    const editor = useContext(NaniwaEditorContext);
    const [oms, setOMs] = useState<IObjectManagement[]>([])
    
    const handleDrop = (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        const loader = new GLTFLoader();
        loader.load(URL.createObjectURL(file), (gltf) => {
            editor.setObjectManagement(gltf.scene.clone());
            setOMs(editor.oms);
            console.log("追加");

        });
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
                camera={ { position: [-3, 3, -6] } }
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
            >
                <Environment preset="dawn" blur={0.7} background />
                <OrbitControls makeDefault={true} ref={camRef}/>
                <gridHelper args={[4096, 4096]}/>
                <MainViewComponent oms={oms} onStopCamera={enabledCamera}/>
            </Canvas>
        </div>
    )
}

interface IObjectsProps {
    oms: IObjectManagement[];
    onStopCamera: (trig: boolean) => void
}
const MainViewComponent = (props: IObjectsProps) => {
    const editor = useContext(NaniwaEditorContext);
    const [selectObject, setSelectObject] = useState<Object3D>();
    const [enabledUUID, setEnabledUUID] = useState<string[]>([]);
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const { camera, scene } = useThree();

    const onMouseMove = (event) => {
        // マウスの位置を正規化する
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    const onClick = (event, object: Object3D) => {
        if (!enabledUUID.includes(object.uuid)){
            const newEnableds = [...enabledUUID, object.uuid];
            setEnabledUUID(newEnableds);
        }
        else {
            // 解く前にRotationとPositionを保持する
            editor.setPosition(object.uuid, object.position);
            editor.setRotation(object.uuid, object.rotation);
            const newEnableds = enabledUUID.filter(d => d != object.uuid);
            setEnabledUUID(newEnableds);
        }
    }
    
    const onDragStart = (e) => {
        console.log("確認する Start");
        props.onStopCamera(false);
    }

    const onDragEnd = (e) => {
        console.log("確認する End");
        props.onStopCamera(true);
    }

    const onDrag = (e) => {
        // 位置/回転率の確認
        const position = new Vector3().setFromMatrixPosition(e);
        console.log(position);
        const rotation = new Euler().setFromRotationMatrix(e);
        console.log(rotation);
    }

    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
        }
    }, []);

    return (
        <>
            <Selection>
                <EffectComposer enabled={true} autoClear={false}>
                    <Outline visibleEdgeColor={0x00ff00} hiddenEdgeColor={0x00ff00} edgeStrength={300} />
                </EffectComposer>
                {props.oms.map((om) => {
                    const { object } = om;
                    let data: JSX.Element;
                    if (enabledUUID.includes(object.uuid)){
                        data = (
                            <PivotControls onDrag={(e) => onDrag(e)} onDragStart={() => onDragStart} onDragEnd={() => onDragEnd}>
                                {/* <Select enabled> */}
                                    <mesh onClick={(e) => onClick(e, object)}>
                                        <primitive object={object} />
                                    </mesh>
                                {/* </Select> */}
                            </PivotControls>
                        );
                    }
                    else {
                        data = (
                            <>
                                <mesh
                                    onClick={(e) => onClick(e, object)}
                                    position={om.args.position? om.args.position: [0, 0, 0]}
                                    rotation={om.args.rotation? om.args.rotation: [0, 0, 0]}
                                >
                                    <primitive object={object} />
                                </mesh>
                            </>);
                    }
                    return (
                    <>
                      {data}  
                    </>
                    )
                })}
            </Selection>
        </>
    )
}

interface IMyObject {
    om: IObjectManagement;
    onStopCamera: (value: boolean) => void;
}

const MyObject = (props: IMyObject) => {
    const editor = useContext(NaniwaEditorContext);
    const trigRef = useRef<any>(null);
    const meshRef = useRef<Mesh>(null);

    // 大きさを取得
    let size = new Vector3();
    props.om.object.traverse((node: any) => {
        if (node.isMesh){
            // 

        }
    });

    useFrame((_, delta) => {
        if (trigRef.current && meshRef.current){
            
        }
    });

    const onDragStart = (e) => {
        console.log("確認する Start");
        props.onStopCamera(false);
    }

    const onDragEnd = (e) => {
        console.log("確認する End");
        props.onStopCamera(true);
    }

    const onDrag = (e) => {
        // 位置/回転率の確認
        const position = new Vector3().setFromMatrixPosition(e);
        console.log(position);
        const rotation = new Euler().setFromRotationMatrix(e);
        console.log(rotation);
    }


    return (
        <>
            <PivotControls visible={false} ref={trigRef}>
                <mesh ref={meshRef}>
                    <primitive object={props.om.object} />
                </mesh>
            </PivotControls>
        </>
    )
}