import { Vector2 } from "three";
import { useEffect, useRef } from "react";
import { IInputMovement } from "./NaniwaProps";

/**
 * ActionキーのリストEnum
 */
export const EActionKey = {
    KeyW       : "forward",
    KeyS       : "backward",
    KeyA       : "left",
    KeyD       : "right",
    Space      : "jump",
    ShiftLeft  : "dash",
    ShiftRight : "dash",
    Shift      : "dash"
}

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
    target : T;
    code   : string;
}
export const useInputControl = () => {

    const moveKeyFromCode = (key: string) => EActionKey[key];
    const movement = useRef<IInputMovement>({
        forward   : false,
        backward  : false,
        left      : false,
        right     : false,
        jump      : false,
        dash      : false,
        action    : false,
        prevDrag  : null,
        currDrag  : null
    });

    useEffect(() => {
        /**
         * キーボード対応
         */
        const handleKeyDown = (e: HTMLElementEvent<HTMLInputElement>) => {
            movement.current[moveKeyFromCode(e.code)] = true;
        } 
        const handleKeyUp = (e: HTMLElementEvent<HTMLInputElement>) => {
            movement.current[moveKeyFromCode(e.code)] = false;
        };
        const handleClickDown = () => {
            movement.current.action = true;
        }
        const handleClickUp = () => {
            console.log("クリックはずれたで");
            movement.current.action = false;
        }
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("mousedown", handleClickDown);
        document.addEventListener("mouseup", handleClickUp);

        /**
         * スマホ対応 (あとで実装)
         */
        // handleTouch

        /**
         * ゲームパッド対応 (あとで実装)
         */
        // handleGamePad
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        }
    }, []);

    return movement.current;
}