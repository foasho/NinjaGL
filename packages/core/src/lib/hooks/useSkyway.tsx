import React, {
  useEffect,
  useState,
  memo,
  useRef,
  RefObject,
  useCallback,
} from "react";
import {
  LocalP2PRoomMember,
  LocalDataStream,
  P2PRoom,
  RoomMember,
  RoomPublication,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
} from "@skyway-sdk/room";
import { SkyWayConfigOptions } from "@skyway-sdk/core";
import { Euler, Vector3 } from "three";
import { IInputMovement, MessageProps, PlayerInfoProps } from "../utils";

export enum ECallStatus {
  None = 0,
  Calling = 1,
  RecieveCall = 2,
  Accept = 3,
  Invitation = 4,
  Talking = 5,
  HangUp = 6,
}

export const contextOptions: Partial<SkyWayConfigOptions> = {
  log: { level: "debug" },
};

export interface IPublishData {
  position?: Vector3;
  rotation?: Euler;
  objectURL?: string;
  input?: IInputMovement;
  id?: string;
  username?: string;
  message?: string;
  userData?: { [key: string]: any };
  rtcFrameDelta?: number;
  callingId?: string | null; // 電話をかけている人のID
  callingRoomId?: string | null; // 電話をかけている人のRoomID
  thumbnailImgURL?: string;
  callStatus?: number;
  playerIsOnGround?: boolean; // プレイヤーが地面にいるかどうか
}

export interface IUseSkywayProps {
  roomName: string;
  enabled?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  tokenString?: string;
  appId?: string;
  appSecretKey?: string;
  roomOptions?: SkyWayRoom;
  thresholdDistance?: number;
  attach?: string;
  username?: string;
  videoElement?: RefObject<HTMLVideoElement | HTMLAudioElement>;
  maxSubscribers?: number;
}

/**
 * 位置の同期に使用
 * @returns
 */
export const useSkyway = (props: IUseSkywayProps) => {
  // refを使用して再レンダリングを防ぐ
  const me = useRef<LocalP2PRoomMember | null>(null);
  const roomMessages = useRef<MessageProps[]>([]);
  const members = useRef<RoomMember[]>([]);
  const membersData = useRef<IPublishData[]>([]);
  const roomName = useRef<string | null>(null);
  const roomRef = useRef<P2PRoom | null>(null);
  let localVideo = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const dataStream = useRef<LocalDataStream | null>(null);
  const maxSubscribers = props.maxSubscribers ? props.maxSubscribers : 320; // 最大320人まで
  const callingId = useRef<string | null>(null); // 電話をかけている人のID
  const callingRoomId = useRef<string | null>(null); // 電話をかけている人のRoomID
  const recieveUser = useRef<IPublishData | null>(null); // 電話を受け取っている人のデータ
  const callStatus = useRef<ECallStatus>(ECallStatus.None);
  const callUsers = useRef<IPublishData[]>([]);

  useEffect(() => {
    /**
     * Roomに参加する
     */
    const RoomJoin = async () => {
      if (!roomName.current) return;
      /**
       * 1.SkywayAuthTokenを作成する
       */
      let token = props.tokenString ? props.tokenString : undefined;
      if (!token) {
        return;
      }

      // 2.VideoStreamをアタッチ
      if (props.videoElement) {
        localVideo = props.videoElement;
      } else {
        // @ts-ignore
        localVideo.current = document.createElement("video");
        localVideo.current.autoplay = true;
        localVideo.current.muted = true;
        if (localVideo.current instanceof HTMLVideoElement) {
          localVideo.current.playsInline = true; // これはiOSで動かない
        }
      }

      try {
        // @ts-ignorew
        dataStream.current = await SkyWayStreamFactory.createDataStream();

        // 3.SkywayContextを作成する
        const context = await SkyWayContext.Create(token);

        // 4.P2PRoomに参加/作成する
        await createRoom(context, "p2p", roomName.current);
      } catch (e) {
        console.log("", e);
      }
    };

    // Enableがtrueの場合に自動で、Skywayに接続する
    if (
      typeof window !== "undefined" &&
      (!roomRef.current || roomName.current !== props.roomName)
    ) {
      if (!roomRef.current && !me.current) {
        // @ts-ignore
        roomName.current = props.roomName;
        RoomJoin();
      }
    }

    return () => {
      if (me.current && roomRef.current) {
        roomRef.current.leave(me.current);
      }
      if (me.current) {
        me.current = null;
        roomRef.current = null;
      }
      // 退出して初期化
      members.current = [];
      membersData.current = [];
      dataStream.current = null;
      callingId.current = null;
      callUsers.current = [];
      if (localVideo.current) {
        localVideo.current.srcObject = null;
        localVideo.current = null;
      }
    };
  }, [props.tokenString, props.roomName]);

  /**
   * メンバーのデータを取得する
   */
  const getPData = (id: string): IPublishData | null => {
    const memberData = membersData.current.find((data) => data.id === id);
    return memberData || null;
  };

  /**
   * SkywayでRoomを参加する[P2P]
   */
  const createRoom = async (
    context: SkyWayContext,
    type: "p2p",
    name: string
  ) => {
    roomRef.current = await SkyWayRoom.FindOrCreate(context, {
      type: type,
      name: name,
      id: name,
    });
    me.current = await roomRef.current.join();

    if (dataStream.current) {
      try {
        await me.current.publish(dataStream.current, {
          maxSubscribers: maxSubscribers,
        });
      } catch (e) {
        console.log("DataStreamのPublishに失敗しました。: ", e);
      }
    }

    // ルーム内に新しいメンバーが入室したときに呼ばれる
    roomRef.current.onMemberJoined.add((e) => {
      addMember(e.member);
      console.log("新しいユーザーが入室しました。: ", e.member);
    });

    // ルーム内にメンバーが退出したときに呼ばれる
    roomRef.current.onMemberLeft.add((e) => {
      removeMember(e.member);
      console.log(e.member.id + "ユーザーが退出しました。: ", e.member);
    });

    // ルーム内に既に存在するメンバーのStreamをSubscribeする
    roomRef.current.publications.forEach(subscribeAndAttach);
    // ルーム内に新しいメンバーがStreamをPublishしたときに呼ばれる
    roomRef.current.onStreamPublished.add((e) =>
      subscribeAndAttach(e.publication)
    );
    // ルーム内にメンバーがStreamをUnpublishしたときに呼ばれる
    roomRef.current.onStreamUnpublished.add((e) => {
      console.log("StreamがUnpublishされました。: ", e.publication);
    });
  };

  /**
   * データをSubscribeする(受信)
   */
  const subscribeAndAttach = async (publication: RoomPublication) => {
    try {
      if (!me.current) return;
      if (publication.publisher.id == me.current.id) return;
      // 重複チェック
      const { stream } = await me.current.subscribe(publication.id);
      switch (stream.contentType) {
        case "data": {
          stream.onData.add((data) => {
            // JSONデータに変換
            const pdata = JSON.parse(data as string) as IPublishData;
            // Position/Rotationを更新する
            if (pdata.position) {
              pdata.position = new Vector3().copy(pdata.position);
            }
            if (pdata.rotation) {
              pdata.rotation = new Euler().copy(pdata.rotation);
            }
            // メンバーデータをセットする
            setMemberData(pdata);
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Messageの処理
   * roomMessagesの最後のメッセージと異なれば追加
   */
  const appendMessage = (pdata: IPublishData) => {
    if (pdata.id && pdata.message) {
      let LastMessage = null;
      if (roomMessages.current.length > 0) {
        LastMessage = roomMessages.current[roomMessages.current.length - 1];
      }
      if (
        !LastMessage ||
        !(LastMessage.id == pdata.id && LastMessage.message == pdata.message)
      ) {
        const newMessages = roomMessages;
        newMessages.current = [
          ...newMessages.current,
          {
            id: pdata.id!,
            message: pdata.message!,
            username: pdata.username,
            messagedAt: new Date(),
          },
        ];
      }
    }
  };

  /**
   * データを受けとる (送信)
   * - メンバー処理
   * - 電話処理
   */
  const setMemberData = (pdata: IPublishData) => {
    /**
     * メンバーのデータを更新する
     */
    const index = membersData.current.findIndex((m) => m.id == pdata.id);
    if (index >= 0) {
      membersData.current[index] = { ...pdata };
    } else {
      // 新しいメンバーの場合は、破壊的に追加する
      const _membersData = membersData.current;
      _membersData.push({ ...pdata });
      membersData.current = [..._membersData];
      // 変更を通知する
      console.log("新しいメンバーが追加されました。");
      notifyMembersChanged();
    }
    /**
     * 電話の処理
     */
    if (me.current) {
      if (
        // 自分が通話のない状態で、
        // 自分当ての電話の呼び出しあれば呼び出し中にする
        pdata.callingId == me.current.id &&
        pdata.callStatus == ECallStatus.Calling &&
        callStatus.current == ECallStatus.None
      ) {
        callStatus.current = ECallStatus.RecieveCall;
        const index = membersData.current.findIndex((d) => d.id == pdata.id);
        if (index >= 0 && !recieveUser.current) {
          recieveUser.current = pdata;
        }
      } else if (
        // 自分宛ての通話招待があればよびだし中にする
        pdata.callingRoomId &&
        callStatus.current == ECallStatus.None &&
        pdata.callStatus == ECallStatus.Invitation
      ) {
        console.log("既存の通話に招待きている");
        callStatus.current = ECallStatus.RecieveCall;
        const index = membersData.current.findIndex((d) => d.id == pdata.id);
        if (index >= 0 && !recieveUser.current) {
          recieveUser.current = pdata;
        }
      } else if (
        // 自分が電話を書けていて、相手がAcceptした場合は、通話中にする
        pdata.id === callingId.current &&
        callStatus.current == ECallStatus.Calling &&
        pdata.callStatus == ECallStatus.Accept
      ) {
        console.log("Talking Success");
        callStatus.current = ECallStatus.Talking;
      } else if (
        // 自分が誰かに電話をかけていて、相手が電話を切った場合は、呼び出し中を解除する
        callStatus.current == ECallStatus.Calling &&
        pdata.callStatus == ECallStatus.HangUp
      ) {
        // 呼び出し中になっていて切れた場合は、呼び出し中を解除する
        const index = callUsers.current.findIndex((d) => d.id == pdata.id);
        let _callUsers = callUsers;
        if (index >= 0) {
          console.log("通話参加者から１名抜けました");
          _callUsers.current.splice(index, 1);
          _callUsers.current = [..._callUsers.current];
        }
        const rindex = membersData.current.findIndex((d) => d.id == pdata.id);
        if (rindex >= 0) {
          recieveUser.current = null;
        }
        // 0人になったら、呼び出し中を解除する
        if (_callUsers.current.length == 0) {
          console.log("通話参加者がいなくなりました");
          callStatus.current = ECallStatus.None;
        }
      } else if (
        // Invitationしたユーザーが、通話を拒否した場合は、呼び出し中を解除する
        callStatus.current == ECallStatus.Invitation &&
        (pdata.callStatus == ECallStatus.HangUp ||
          pdata.callStatus == ECallStatus.Accept)
      ) {
        // 自分のステータスをTalkingにする
        callStatus.current = ECallStatus.Talking;
      } else if (
        pdata.callingRoomId &&
        callingRoomId.current == pdata.callingRoomId &&
        pdata.callStatus === ECallStatus.Talking
      ) {
        // 同じルームにいる人がいれば、RecieveCallDataに追加する
        const index = callUsers.current.findIndex((d) => d.id == pdata.id);
        if (index < 0) {
          console.log("通話に新しいユーザーが参加しました");
          const _callUsers = callUsers;
          callUsers.current = [..._callUsers.current, { ...pdata }];
        }
        // 現在の参加人数が2人以上なら、通話中にする
        console.log("通話参加人数: ", callUsers.current.length);
      }
    }
    appendMessage(pdata);
  };

  /**
   * データを送信する
   */
  const publishData = useCallback(
    (
      pdata: IPublishData,
      playerInfo: PlayerInfoProps | null = null
    ) => {
      if (dataStream.current) {
        if (!pdata.id) {
          pdata.id = me.current?.id;
        }
        if (!pdata.username && playerInfo) {
          pdata.username = playerInfo.name;
          if (playerInfo.avatar) {
            pdata.thumbnailImgURL = playerInfo.avatar;
          }
        }
        pdata.callStatus = callStatus.current;
        pdata.callingId = callingId.current;
        pdata.callingRoomId = callingRoomId.current;
        const sendData = JSON.stringify({ ...pdata });
        dataStream.current.write(sendData);
        // 自分のMessageを追加する
        if (pdata.message) appendMessage(pdata);
      }
    },
    [dataStream.current, callStatus.current, me.current]
  );

  /**
   * SkywayでRoomを退出する
   */
  const leaveRoom = async () => {
    await roomRef.current!.leave(me.current!);
  };

  /**
   * メンバーが追加
   */
  const addMember = (member: RoomMember) => {
    if (me.current && member.id == me.current.id) return;
    const newMbs = members.current;
    newMbs.push(member);
    members.current = [...newMbs];
  };

  /**
   * メンバーが削除
   */
  const removeMember = (member: RoomMember) => {
    if (me.current && member.id == me.current.id) return;
    const newMbs = members.current.filter((m) => m.id !== member.id);
    members.current = [...newMbs];
    membersData.current = membersData.current.filter((m) => m.id !== member.id);
    // 自分のSubscribeからも削除する
    me.current!.subscriptions.forEach((s) => {
      if (s.id == member.id) {
        console.log("unsubscribe: ", s.id, " / ", member.id);
        me.current!.unsubscribe(s.id);
      }
    });
    // 変更を通知する
    notifyMembersChanged();
  };

  /**
   * ユーザーに電話をかける/電話に出る
   */
  const Calling = (userId: string, roomId: string) => {
    callingId.current = userId;
    callingRoomId.current = roomId;
    console.log("通話をかけました。");
  };

  /**
   * 電話を切る
   */
  const HangUp = () => {
    callingId.current = null;
    callingRoomId.current = null;
    callUsers.current = [];
  };

  /**
   * 電話にでる
   */
  const TakeCall = (callId: string, roomId: string) => {
    callingId.current = callId;
    callingRoomId.current = roomId;
  };

  const updateCallStatus = (status: ECallStatus) => {
    callStatus.current = status;
  };

  /**
   * 再レンダリングを防ぎつつ変更を検知できるリスナーを用意
   */
  const membersChangedListeners = useRef<(() => void)[]>([]);
  const onMembersChanged = (listener: () => void) => {
    membersChangedListeners.current.push(listener);
  };
  const offMembersChanged = (listener: () => void) => {
    membersChangedListeners.current = membersChangedListeners.current.filter(
      (l) => l !== listener
    );
  };
  // OMsの変更を通知する
  const notifyMembersChanged = () => {
    membersChangedListeners.current.forEach((l) => l());
  };

  console.log("Skyway Rerender: ", membersData.current);

  return {
    me,
    publishData: publishData,
    leaveRoom: leaveRoom,
    localVideo: localVideo,
    members: members,
    membersData: membersData,
    getPData: getPData,
    Calling: Calling,
    HangUp: HangUp,
    TakeCall: TakeCall,
    callUsers: callUsers,
    recieveUser: recieveUser,
    callStatus: callStatus,
    updateCallStatus: updateCallStatus,
    roomMessages: roomMessages,
    onMembersChanged: onMembersChanged,
    offMembersChanged: offMembersChanged,
  };
};
