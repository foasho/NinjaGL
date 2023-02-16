import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager"
import { useContext, useEffect, useRef, useState } from "react"

export const LoadProcessing = () => {
    const ref = useRef();
    const [per, setPer] = useState<number>();
    const engine = useContext(NaniwaEngineContext);

    useEffect(() => {
        setPer(engine.loadPer);
    }, [engine.loadPer])

    return (
    <>
        {engine.nowLoading &&
        <>
            <div style={
                {
                    zIndex: "99999",
                    position: "fixed",
                    height: "100vh",
                    width: "100vw",
                    top: "0",
                    left: "0"
                }
            }>
                <div style={
                    { 
                        position: "absolute",
                        maxHeight: "80vh",
                        maxWidth: "75vw",
                        top: "50%",
                        left: "50%", 
                        transform: "translate(-50%,-50%)",
                        textAlign: "center"
                    }
                }>
                    <div>
                        test
                        {engine.loadPer}
                        サイズ: {engine.totalFileSize}
                    </div>
                    <div>
                        {engine.loadingText}
                    </div>
                </div>
            </div>
        </>
        }
    </>
    )
}