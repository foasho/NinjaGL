import React, { useEffect, useState, useRef, RefObject, useCallback } from 'react';
import { 
  LocalAudioStream,
  LocalP2PRoomMember,
  LocalVideoStream,
  nowInSec, 
  P2PRoom, 
  RoomMember, 
  RoomPublication, 
  SkyWayAuthToken, 
  SkyWayContext, 
  SkyWayRoom, 
  SkyWayStreamFactory, 
  uuidV4
} from '@skyway-sdk/room';
import {  LocalDataStream, SkyWayConfigOptions } from '@skyway-sdk/core';
import { Euler, Vector3 } from 'three';
import { IInputMovement } from './InputControl';

export const contextOptions: Partial<SkyWayConfigOptions> = {
  log: { level: 'debug' },
};

export interface IPublishData {
  position: Vector3;
  rotation: Euler;
  input: IInputMovement;
  id?: string;
  username?: string;
  message?: string;
  userData?: { [key: string]: any };
}

export interface ISubscribers {
  input: IInputMovement;
  position: Vector3;
  rotation: Euler;
  username?: string;
  message?: string;
  stream?: LocalVideoStream|LocalAudioStream;
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
  videoElement?: RefObject<HTMLVideoElement|HTMLAudioElement>;
}


export const useSkyway = (props: IUseSkywayProps) => {
  const [updateCnt, setUpdateCnt] = useState(0);
  const _enabled = props.enabled? props.enabled: false;
  const me = useRef<LocalP2PRoomMember|null>(null);
  const members = useRef<RoomMember[]>([]);
  const membersData = useRef<IPublishData[]>([]);
  const roomRef = useRef<P2PRoom>(null);
  let localVideo = useRef<HTMLVideoElement|HTMLAudioElement>(null);
  let videoStream: LocalVideoStream|null = null;
  let audioStream: LocalAudioStream|null = null;
  let dataStream: LocalDataStream;

  /**
   * Roomに参加する
   */
  const RoomJoin = async () => {
    /**
     * 1.SkywayAuthTokenを作成する
     */
    let token = props.tokenString? props.tokenString: undefined;
    if (token === undefined) {
      token = new SkyWayAuthToken({
        jti: uuidV4(),
        iat: nowInSec(),
        exp: nowInSec() + (3600 * 24),
        scope: {
          app: {
            id: process.env.REACT_APP_SKYWAY_APP_ID? process.env.REACT_APP_SKYWAY_APP_ID: props.appId? props.appId: '',
            turn: true,
            actions: ["read"],
            channels: [
              {
                id: '*',
                name: '*',
                actions: ['write'],
                members: [
                  {
                    id: '*',
                    name: '*',
                    actions: ['write'],
                    publication: {
                      actions: ['write'],
                    },
                    subscription: {
                      actions: ['write'],
                    },
                  },
                ],
                sfuBots: [
                  {
                    actions: ['write'],
                    forwardings: [
                      {
                        actions: ['write'],
                      },
                    ],
                  },
                ],
              },
            ],
          }
        }
      }).encode(
        process.env.REACT_APP_SKYWAY_APP_SECRET_KEY? process.env.REACT_APP_SKYWAY_APP_SECRET_KEY: props.appSecretKey? props.appSecretKey: ''
      );
    }

    // 2.VideoStreamをアタッチ
    if (props.videoElement){
      localVideo = props.videoElement;
    }
    else {
      localVideo.current = document.createElement('video');
      localVideo.current.autoplay = true;
      localVideo.current.muted = true;
      // localVideo.current.playsInline = true;// これはiOSで動かない
    }
    (async () => {
      if (props.videoEnabled || props.audioEnabled){
        const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream({
          video: { height: 640, width: 360, frameRate: 15 },// 品質を落とす
        });
        if (props.videoEnabled){
          videoStream = video;
        }
        if (props.audioEnabled){
          audioStream = audio;
        }
        video.attach(localVideo.current);
        await localVideo.current.play();
      }
      // DataStream
      dataStream = await SkyWayStreamFactory.createDataStream();
      
      // 3.SkywayContextを作成する
      const context = await SkyWayContext.Create(token);
  
      // 4.P2PRoomに参加/作成する
      await createRoom(context, "p2p", props.roomName);

    })();
  }

  useEffect(() => {
    // Enableがtrueの場合に自動で、Skywayに接続する
    if (_enabled && props.roomName) {
      if (!roomRef.current && !me.current){
        RoomJoin();
      }
    }
    return () => {
      if (me.current && roomRef.current){
        // 退出して初期化
        roomRef.current.leave(me.current);
        me.current = null;
        roomRef.current = null;
      }
    }
  }, [props.enabled, props.roomName]);

  /**
   * メンバーのデータを取得する
   */
  const getPData = useCallback((id): IPublishData => {
    const memberData = membersData.current.find((data) => data.id === id);
    return memberData || null;
  }, [membersData]);
  
  /**
   * SkywayでRoomを参加する
   */
  const createRoom = async(
    context: SkyWayContext, 
    type: "p2p",
    name: string,
  ) => {
    roomRef.current = await SkyWayRoom.FindOrCreate(
        context, {
        type: type,
        name: name,
        id: name,
    });
    me.current = await roomRef.current.join();
    console.log("My member: ", me.current);
    if (audioStream) {
      await me.current.publish(audioStream, {
        maxSubscribers: 50,
      });
    }
    if (videoStream){
      await me.current.publish(videoStream, {
        maxSubscribers: 50,
        encodings: [
          { maxBitrate: 80_000, id: 'low' },
          { maxBitrate: 400_000, id: 'high' },
        ],
      });
    }
    if (dataStream) {
      await me.current.publish(dataStream, {
        maxSubscribers: 50,
      });
    }

    // ルーム内に新しいメンバーが入室したときに呼ばれる
    roomRef.current.onMemberJoined.add((e) => {
      addMember(e.member);
      console.log("新しいユーザーが入室しました。: ", e.member);
    });

    // ルーム内にメンバーが退出したときに呼ばれる
    roomRef.current.onMemberLeft.add((e) => {
      removeMember(e.member);
      console.log("新しいユーザーが退出しました。: ", e.member);
    });

    /**
     * 音声,ビデオ,データをSubscribeする(受信)
     */
    const subscribeAndAttach = async (publication: RoomPublication) => {
      if (!me.current) return;
      if (publication.publisher.id == me.current.id) return;
      const { stream } = await me.current.subscribe(publication.id);
      switch (stream.contentType) {
        case 'video':
          {
            const elm = document.createElement('video');
            elm.playsInline = true;
            elm.autoplay = true;
            stream.attach(elm);
            // remoteMediaArea.appendChild(elm);
          }
          break;
        case 'audio':
          {
            const elm = document.createElement('audio');
            elm.controls = true;
            elm.autoplay = true;
            stream.attach(elm);
            // remoteMediaArea.appendChild(elm);
          }
          break;
        case 'data': {
          stream.onData.add((data) => {
            // JSONデータに変換
            const pdata = JSON.parse(data as string) as IPublishData;
            // Position/Rotationを更新する
            if (pdata.position){
              pdata.position = new Vector3().copy(pdata.position);
            }
            if (pdata.rotation){
              pdata.rotation = new Euler().copy(pdata.rotation);
            }
            // メンバーデータをセットする
            setMemberData(pdata);
          });
        }
      }
    }
    
    // ルーム内に既に存在するメンバーのStreamをSubscribeする
    roomRef.current.publications.forEach(subscribeAndAttach);
    // ルーム内に新しいメンバーがStreamをPublishしたときに呼ばれる
    roomRef.current.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
  }

  /**
   * メンバーデータをセットする
   */
  const setMemberData = (pdata: IPublishData) => {
    // もし任意のIDがすでに存在する場合は、上書きする
    const index = membersData.current.findIndex((m) => m.id == pdata.id);
    if (index >= 0){
      membersData.current[index] = {...pdata};
    } else {
      // 新しいメンバーの場合は、破壊的に追加する
      const _membersData = membersData.current;
      _membersData.push({...pdata});
      membersData.current = [..._membersData];
      setUpdateCnt((prevCounter) => prevCounter + 1);
    }
  }
  
  /**
   * データを送信する
   */
  const publishData = (pdata: IPublishData) => {
    if (dataStream) {
      if (!pdata.id){
        pdata.id = me.current?.id;
      }
      const sendData = JSON.stringify({...pdata});
      dataStream.write(sendData);
    }
  }
  /**
   * SkywayでRoomを退出する
   */
  const leaveRoom = async(
  ) => {
    await roomRef.current.leave(me.current);
  }

  /**
   * メンバーが追加
   */
  const addMember = (member: RoomMember) => {
    if (me.current && member.id == me.current.id) return;
    const newMbs = members.current;
    newMbs.push(member);
    members.current = [...newMbs];
  }

  /**
   * メンバーが削除
   */
  const removeMember = (member: RoomMember) => {
    if (me.current && member.id == me.current.id) return;
    const newMbs = members.current.filter((m) => m.id !== member.id);
    members.current = [...newMbs];
  }

  return { 
    me: me.current,
    updateCnt: updateCnt,
    publishData: publishData, 
    leaveRoom: leaveRoom,
    localVideo: localVideo,
    members: members.current,
    membersData: membersData.current,
    getPData: getPData,
  }
}