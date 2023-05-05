import React, { useEffect, useState, useRef, RefObject, useCallback } from 'react';
import { 
  LocalAudioStream,
  LocalP2PRoomMember,
  LocalSFURoomMember,
  LocalVideoStream,
  nowInSec, 
  P2PRoom, 
  RoomMember, 
  RoomPublication, 
  SfuRoom, 
  SkyWayAuthToken, 
  SkyWayContext, 
  SkyWayRoom, 
  SkyWayStreamFactory, 
  uuidV4
} from '@skyway-sdk/room';
import {  LocalDataStream, SkyWayConfigOptions, Subscription } from '@skyway-sdk/core';
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
  maxSubscribers?: number;
}


export const useSkyway = (props: IUseSkywayProps) => {
  const [updateCnt, setUpdateCnt] = useState(0);
  const _enabled = props.enabled? props.enabled: false;
  const me = useRef<LocalP2PRoomMember|null>(null);
  const members = useRef<RoomMember[]>([]);
  const membersData = useRef<IPublishData[]>([]);
  const roomRef = useRef<P2PRoom>(null);
  let localVideo = useRef<HTMLVideoElement|HTMLAudioElement>(null);
  let dataStream: LocalDataStream;
  const maxSubscribers = props.maxSubscribers? props.maxSubscribers: 320;// 最大320人まで

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

    if (dataStream) {
      await me.current.publish(dataStream, {
        maxSubscribers: maxSubscribers,
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
     * データをSubscribeする(受信)
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
    membersData.current = membersData.current.filter((m) => m.id !== member.id);
    setUpdateCnt((prevCounter) => prevCounter + 1);
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


/**
 * プライベート通話には、SFUを利用する
 */
export interface IPrivateCallProps {
  token: string;
  audio: boolean;
  video: boolean;
  localVideo: HTMLVideoElement;
  myId: string;
  connectIds: string[];
  onStreamCallback: (elm: HTMLVideoElement|HTMLAudioElement) => void;
}

export class SkywayPrivateCall {
  me: LocalSFURoomMember;
  context: SkyWayContext;
  room: SfuRoom;
  audioStream: LocalAudioStream;
  videoStream: LocalVideoStream;
  maxSubscribers: number = 8;
  constructor(props: IPrivateCallProps){
    this.init(props);
  }

  async init (props: IPrivateCallProps) {
    this.context = await SkyWayContext.Create(props.token);
    if (props.video || props.audio){
      const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream({
        video: { height: 640, width: 360, frameRate: 15 },// 品質を落とす
      });
      if (props.video){
        this.videoStream = video;
      }
      if (props.audio){
        this.audioStream = audio;
      }
      video.attach(props.localVideo);
      await props.localVideo.play();
    }

    const id = uuidV4();
    await this.joinOrCreateRoom(props, id);
  }

  private async joinOrCreateRoom(props: IPrivateCallProps, id: string) {
    if (!this.context) return;
    this.room = await SkyWayRoom.FindOrCreate(this.context, {
      type: 'sfu',
      name: id,
      id: id,
    });
    // ルーム内に既に存在するメンバーのStreamをSubscribeする
    this.room.publications.forEach((publish) => {
      this.subscribeAndAttach(props, publish);
    });
    // ルーム内に新しいメンバーがStreamをPublishしたときに呼ばれる
    this.room.onStreamPublished.add((e) => 
      this.subscribeAndAttach(props, e.publication)
    );
  }

  /**
   * 通話を切る
   */
  public destroyRoom = async () => {
    if (this.room){
      await this.room.close();
      this.context = null;
      this.room = null;
      this.me = null;
      this.audioStream = null;
      this.videoStream = null;
    }
  }

  /**
   * 音声を有効にする
   * ※自分のStreamデータを送信する
   */
  public enableAudio= async () => {
    if (this.audioStream) {
      await this.me.publish(this.audioStream, {
        maxSubscribers: this.maxSubscribers,
      });
    }
  }

  /**
   * 音声を無効にする
   */
  public disableAudio = async () => {}

  /**
   * ビデオを有効にする(送信)
   * ※自分のStreamデータを送信する
   */
  public enableVideo = async () => {
    if (this.videoStream){
      await this.me.publish(this.videoStream, {
        maxSubscribers: this.maxSubscribers,
        encodings: [
          { maxBitrate: 80_000, id: 'low' },
          { maxBitrate: 400_000, id: 'high' },
        ],
      });
    }
  }

/**
 * 音声,ビデオをSubscribeする(受信)
 */
  private subscribeAndAttach = async (props: IPrivateCallProps, publication: RoomPublication) => {
    if (!this.me) return;
    if (publication.publisher.id == this.me.id) return;
    const { stream } = await this.me.subscribe(publication.id);
    switch (stream.contentType) {
      case 'video':
        {
          const elm = document.createElement('video');
          elm.playsInline = true;
          elm.autoplay = true;
          stream.attach(elm);
          props.onStreamCallback(elm);
        }
        break;
      case 'audio':
        {
          const elm = document.createElement('audio');
          elm.controls = true;
          elm.autoplay = true;
          stream.attach(elm);
          props.onStreamCallback(elm);
        }
        break;
    }
  }
}