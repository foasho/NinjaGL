import React from "react";
import {
  FaRunning,
  FaUser,
  FaUsers,
  FaCaretDown,
  FaCaretUp,
} from "react-icons/fa";
import {
  GiJumpAcross,
  GiPunch,
  GiSpinningSword,
  GiPerson,
} from "react-icons/gi";
import { PiCrosshairSimpleThin } from "react-icons/pi";

export type NinjaIconType =
  | "FaRunning"
  | "GiJumpAcross"
  | "GiPunch"
  | "GiSpinningSword"
  | "GiPerson"
  | "FaUser"
  | "FaUsers"
  | "FaCaretDown"
  | "FaCaretUp"
  | "PiCrosshairSimpleThin";
// type一覧を取得できる関数
export const getNinjaIconTypes = (): {
  label: NinjaIconType;
  Icon: React.ElementType;
}[] => {
  return [
    { label: "FaRunning", Icon: FaRunning },
    { label: "GiJumpAcross", Icon: GiJumpAcross },
    { label: "GiPunch", Icon: GiPunch },
    { label: "GiSpinningSword", Icon: GiSpinningSword },
    { label: "GiPerson", Icon: GiPerson },
    { label: "FaUser", Icon: FaUser },
    { label: "FaUsers", Icon: FaUsers },
    { label: "FaCaretDown", Icon: FaCaretDown },
    { label: "FaCaretUp", Icon: FaCaretUp },
    { label: "PiCrosshairSimpleThin", Icon: PiCrosshairSimpleThin },
  ];
};
type NinjaIconProps = {
  type: NinjaIconType;
  styles?: React.CSSProperties;
  color?: string;
};
export const NinjaIcon = ({
  type,
  styles = {},
  color = "#1e1e1e",
}: NinjaIconProps) => {
  let iconComponent = null;
  const iconStyles = {
    color: color || "white",
  };
  switch (type) {
    case "FaRunning":
      iconComponent = <FaRunning style={iconStyles} />;
      break;
    case "GiJumpAcross":
      iconComponent = <GiJumpAcross style={iconStyles} />;
      break;
    case "GiPunch":
      iconComponent = <GiPunch style={iconStyles} />;
      break;
    case "GiSpinningSword":
      iconComponent = <GiSpinningSword style={iconStyles} />;
      break;
    case "GiPerson":
      iconComponent = <GiPerson style={iconStyles} />;
      break;
    case "FaUser":
      iconComponent = <FaUser style={iconStyles} />;
      break;
    case "FaUsers":
      iconComponent = <FaUsers style={iconStyles} />;
      break;
    case "FaCaretDown":
      iconComponent = <FaCaretDown style={iconStyles} />;
      break;
    case "FaCaretUp":
      iconComponent = <FaCaretUp style={iconStyles} />;
      break;
    case "PiCrosshairSimpleThin":
      iconComponent = <PiCrosshairSimpleThin style={iconStyles} />;
      break;
    default:
      break;
  }

  return <>{iconComponent}</>;
};
