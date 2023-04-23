import { useFrame } from "@react-three/fiber";
import { useInputControl } from "./InputControl";


export const useSWFrame = (callback: (state: any, delta: number, subscribers: any) => void) => {

    const input = useInputControl("desktop");

    useFrame((state, delta) => {
        const target = state.scene.getObjectByName("attach");
        if (target) {
            const position = target.position.clone();
            const rotation = target.rotation.clone();
            // EX)set useSkyway's publishData
            // publishData( position, rotation, input, message, username );

            // EX) get useSkyway's subscribers
            // const subscribers = getSubscribers();
            // callback(state, delta, subscribers: { input: IInputMovement, position: Vector3, rotation: Euler });
        }
    });

}