import { useEffect } from "react";
import { 
    BsHandbagFill,
    BsFillBookmarkStarFill
} from "react-icons/bs";
import { 
    GiSpinningSword, 
    GiBroadsword,
    GiJumpAcross
} from "react-icons/gi";
import Style from "styled-jsx/style"

export interface INaniwaIconProps {
    templates?: "bs" | "gi",
    name?     : "BsHandbagFill" | "BsFillBookmarkStarFill" |
        "GiSpinningSword" | "GiBroadsword" | "GiJumpAcross";
    style?    : string;
    events?   : { [key: string]: any }[];
}

export interface INaniwaIconsProps {}

const generateKey = (): string => {
    const length = 12;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const CreateIcon = (prop: INaniwaIconProps) => {
    let icon;
    const idName = generateKey() + "nicon";
    if (prop.templates){
        if (prop.templates == "gi"){
            switch (prop.name) {
                case "BsHandbagFill":
                    icon = <BsHandbagFill/>
                    break;
                case "GiBroadsword":
                    icon = <GiBroadsword/>
                case "GiJumpAcross":
                    icon = <GiJumpAcross/>
                default:
                    break;
            }
        }
    } 

    useEffect(() => {
        if (icon){

        }
        return () => {
            if (icon){}
        }
    }, [])
    return (
        <>
            {icon &&
            <>
                <a id={idName}>
                    {icon}
                </a>
                {prop.style &&
                    <style jsx={true}>
                        {
                            `#${idName} { ${prop.style} }`
                        }
                    </style>
                }
            </>
            }
        </>
    )
}

export const NaniwaIcons = (props: INaniwaIconProps[]) => {
    return (
        <>
            {props.map((prop) => {
                return (
                    <CreateIcon {...prop}/>
                )
            })}
        </>
    )
}