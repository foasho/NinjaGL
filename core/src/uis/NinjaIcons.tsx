import * as React from "react";
import {
  BsHandbagFill,
  BsFillBookmarkStarFill
} from "react-icons/bs";
import {
  GiSpinningSword,
  GiBroadsword,
  GiJumpAcross
} from "react-icons/gi";
import styled from "styled-components";

export interface INinjaIconProps {
  id?: string;
  template?: "bs" | "gi",
  type?: "BsHandbagFill" | "BsFillBookmarkStarFill" |
  "GiSpinningSword" | "GiBroadsword" | "GiJumpAcross";
  style?: string;
  script?: string;
}

export interface INinjaIconsProps {
  icons: INinjaIconProps[];
}

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

const CreateIcon = (prop: INinjaIconProps) => {
  let icon: JSX.Element | undefined;
  if (prop.template) {
    if (prop.template == "gi") {
      switch (prop.type) {
        case "GiSpinningSword":
          icon = <GiSpinningSword />
          break;
        case "GiBroadsword":
          icon = <GiBroadsword />
          break;
        case "GiJumpAcross":
          icon = <GiJumpAcross />
          break;
        default:
          break;
      }
    }
    else if (prop.template == "bs") {
      switch (prop.type) {
        case "BsHandbagFill":
          icon = <BsHandbagFill />
          break;
        case "BsFillBookmarkStarFill":
          icon = <BsFillBookmarkStarFill />
          break;
        default:
          break;
      }
    }
  }

  React.useEffect(() => {
    if (icon) {
      if (prop.script && prop.script.length > 0 && prop.id && prop.id.length > 0) {
        try {
          const Icon = document.getElementById(prop.id);
          // eval(prop.script);
        } catch (error) {
          console.error("Icon表示エラー");
        }
      }
    }
    return () => {
      icon = undefined;
    }
  }, []);

  const IconA = styled.a`${prop.style}`

  return (
    <>
      {icon !== null &&
        <>
          <IconA id={prop.id}>
            {icon}
          </IconA>
        </>
      }
    </>
  )
}

export const NinjaIcons = (props: INinjaIconsProps) => {
  return (
    <>
      {props.icons.map((prop, index) => {
        return (
          <CreateIcon {...prop} key={index} />
        )
      })}
    </>
  )
}