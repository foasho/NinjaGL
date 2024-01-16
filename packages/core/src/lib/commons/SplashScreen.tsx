import React, { useEffect } from "react";
import styled, { keyframes } from "styled-components";

const fadeInOut = keyframes`
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const StyledDiv = styled.div`
  width: 100%;
  height: 100%;
  z-index: 999;
  position: absolute;
  top: 0;
  left: 0;
  animation: ${fadeInOut} 3s;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  bgColor?: string;
  logoSrc?: string;
  splashTime?: number;
};
export const SplashScreen: React.FC = ({
  bgColor = "#000",
  logoSrc = "/logo.png",
  splashTime = 3000,
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        if (ref.current.style) {
          ref.current.style.display = "none";
        }
      }
    }, splashTime);
    return () => clearTimeout(timer);
  }, []);

  return (
    <StyledDiv
      ref={ref}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div
        // styleを上限
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={logoSrc}
          style={{
            padding: "32px",
            height: "80%",
            width: "80%",
            margin: "auto",
          }}
          alt="ロゴ"
        />
      </div>
    </StyledDiv>
  );
};

// memo化して再レンダリングを抑制
export const MemoSplashScreen = React.memo(SplashScreen);
