import React, { useEffect, useState } from "react";
import {
  MainContainer,
  MessageInput,
  MessageHeader,
  MessageList,
  MessageContainer,
} from "@minchat/react-chat-ui";
import { useSpring, animated } from "@react-spring/web";
import { useNinjaEngine, useWebRTC } from "../../hooks";
import { FaRocketchat } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

/**
 * ChatUIは@minchat/react-chat-uiを使用しています。
 * @docs https://docs.minchat.io/getting-started/using-react
 */

export const _CommunicationUI = ({
  themeColor = "#43D9D9",
}: {
  themeColor?: string;
}) => {
  const { playerInfo, isVertical, curMessage } = useNinjaEngine();
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { publishData } = useWebRTC();

  const spring = useSpring({
    from: { transform: "translateY(0%)" },
    to: async (next) => {
      if (open) {
        await next({
          transform: "translateY(95%)",
          config: { duration: 100 },
        });
        await next({
          transform: "translateY(-5%)",
          config: { duration: 300 },
        });
        await next({
          transform: "translateY(0%)",
          config: { duration: 100 },
        });
      } else {
        await next({
          transform: "translateY(95%)",
          config: { duration: 400 },
        });
        await next({
          transform: "translateY(92%)",
          config: { duration: 100 },
        });
      }
    },
  });

  const sendMessage = (message: string) => {
    if (message !== "" && publishData) {
      publishData(
        {
          message: message,
        },
        playerInfo.current
      );
      curMessage.current = message;
    }
  };

  const sendAttachFile = () => {};

  return (
    <animated.div
      style={{
        position: "absolute",
        right: isVertical ? "15px" : "8px",
        bottom: "24px",
        // padding: "0px 15px",
        width: isVertical ? "80%" : "350px",
        maxWidth: "420px",
        zIndex: 11,
        ...spring,
      }}
    >
      <MainContainer
        style={{
          height: isVertical ? "70vh" : "85vh",
          maxHeight: "680px",
          width: "100%",
          pointerEvents: "auto",
        }}
      >
        <MessageContainer>
          <MessageHeaderComponent
            open={open}
            setOpen={setOpen}
            themeColor={themeColor}
          />
          <MessageListComponent themeColor={themeColor} />
          <MessageInput
            themeColor={themeColor}
            placeholder="メッセージを入力"
            onSendMessage={sendMessage}
            onAttachClick={() => {
              if (inputRef.current) {
                inputRef.current.click();
              }
            }}
          />
          <input
            ref={inputRef}
            type="file"
            // Image only
            accept="image/*"
            style={{ display: "none" }}
            onChange={sendAttachFile}
          />
        </MessageContainer>
      </MainContainer>
    </animated.div>
  );
};

// themeColorが変わらないかぎり、再レンダリングしない
export const CommunicationUI = React.memo(
  _CommunicationUI,
  (prevProps, nextProps) => {
    return prevProps.themeColor === nextProps.themeColor;
  }
);

/**
 * ヘッダー
 */
const MessageHeaderComponent = ({
  open,
  setOpen,
  themeColor = "#43D9D9",
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  themeColor?: string;
}) => {
  const { playerInfo } = useNinjaEngine();
  const [edit, setEdit] = useState(false);

  const updateName = (name: string) => {
    if (playerInfo.current) {
      playerInfo.current.name = name;
    }
  };

  return (
    <MessageHeader showBack={false}>
      <div style={{ position: "relative", width: "100%" }}>
        <a
          style={{
            position: "absolute",
            right: "-15px",
            bottom: edit ? "4px" : "15px",
            zIndex: 2,
            background: themeColor,
            color: "white",
            fontSize: "20px",
            padding: "8px 10px",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => setOpen(!open)}
        >
          {open ? <MdClose /> : <FaRocketchat />}
        </a>

        {!edit && "Room Chat"}
        {edit && (
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              // Nameを変更する
              if (e.target && e.target[0] && e.target[0].value) {
                // id="playerName"のinputの値を取得する
                const name = e.target[0].value;
                updateName(name);
              }
            }}
            style={{
              display: "flex",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <input
              id="playerName"
              type="text"
              style={{
                border: "none",
                borderBottom: "1px solid #ccc",
                fontSize: "16px",
                margin: "0px auto",
                padding: "10px 8px",
                outline: "none",
                borderRadius: "15px",
                width: "100%",
              }}
              defaultValue={playerInfo.current?.name}
            />
          </form>
        )}
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: edit ? "-12px" : "-1px",
            fontSize: "24px",
            cursor: "pointer",
          }}
          onClick={() => setEdit(!edit)}
        >
          <FaGear style={{ display: "inline" }} />
        </div>
      </div>
    </MessageHeader>
  );
};

/**
 * メッセージエリア
 */
const MessageListComponent = ({
  themeColor = "#43D9D9",
}: {
  themeColor?: string;
}) => {
  const { roomMessages, me } = useWebRTC();
  const [messages, setMessages] = React.useState<any[]>([]);

  useEffect(() => {
    // messagesの長さとroomMessagesの長さが違う場合は更新する
    if (roomMessages.current.length !== messages.length) {
      setMessages([...roomMessages.current]);
    }
    // 1秒に1回だけ更新する
    const timer = setInterval(() => {
      setMessages(roomMessages.current);
    }, 500);
    return () => clearInterval(timer);
  }, [roomMessages, messages]);

  return (
    <MessageList
      themeColor={themeColor}
      currentUserId={me.current?.id || "guest"}
      messages={messages.map((message) => {
        return {
          text: message.message,
          user: {
            id: message.id,
            name: message.username,
            avatar: message.avatar,
          },
          createdAt: message.messagedAt,
        };
      })}
      customEmptyMessagesComponent={
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            height: "100%",
            alignItems: "center",
            color: "#999",
            width: "75%",
            margin: "0px auto",
          }}
        >
          チャットがありません
        </div>
      }
    />
  );
};
