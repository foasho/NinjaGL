import React, { useEffect, useState, useRef, RefObject, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  LocalAudioStream,
  LocalSFURoomMember,
  LocalVideoStream,
  nowInSec, 
  P2PRoom, 
  RoomMember, 
  RoomPublication, 
  SfuRoom, 
  SfuRoomOptions, 
  SkyWayAuthToken, 
  SkyWayContext, 
  SkyWayRoom, 
  SkyWayStreamFactory, 
  uuidV4
} from '@skyway-sdk/room';
import {  LocalDataStream, SkyWayConfigOptions } from '@skyway-sdk/core';
import { Euler, Vector3 } from 'three';
import { IInputMovement, useInputControl } from './InputControl';

export const contextOptions: Partial<SkyWayConfigOptions> = {
  log: { level: 'debug' },
};
// export const sfuOptions: Partial<SfuRoomOptions> = {};
// export const p2pOptions: Partial<P2PRoom

export interface IPublishData {
  position: Vector3;
  rotation: Euler;
  input: IInputMovement;
  username?: string;
  message?: string;
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
  enabled: boolean;
  roomName: string;
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
  const input = useInputControl("desktop");
  const me = useRef<LocalSFURoomMember|null>(null);
  const roomRef = useRef<P2PRoom>(null);
  let localVideo = useRef<HTMLVideoElement|HTMLAudioElement>(null);
  let subscribers = useRef<ISubscribers[]>([]);
  let data: LocalDataStream;

  const join = useCallback( async () => {
    try {
      // 0. マイクとビデオへのアクセス許可を求める
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (error) {
      console.error("マイクとビデオへのアクセス許可が拒否されました。", error);
      return;
    }
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
      const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream({
        video: { height: 640, width: 360, frameRate: 15 },// 品質を落とす
      });
      video.attach(localVideo.current);
      await localVideo.current.play();
      // DataStream
      data = await SkyWayStreamFactory.createDataStream();
      
      // 3.SkywayContextを作成する
      const context = await SkyWayContext.Create(token);
  
      // 4.Roomに参加/作成する
      await createRoom(context, "p2p", props.roomName, audio, video, data);

    })();

  }, [props]);

  useEffect(() => {
    // Enableがtrueの場合に自動で、Skywayに接続する
    if (props.enabled) {
      join();
    }
  }, [props.enabled, join]);
  
  /**
   * SkywayでRoomを参加する
   */
  const createRoom = async(
    context: SkyWayContext, 
    type: "p2p",
    name: string,
    audio: LocalAudioStream,
    video: LocalVideoStream,
    data: LocalDataStream
  ) => {
    roomRef.current = await SkyWayRoom.FindOrCreate(
        context,
    {
        type: type,
        name: name,
        id: name,
    }
    );
    await roomRef.current.join();
    if (audio) {
      await me.current.publish(audio, {
        maxSubscribers: 50,
      });
    }
    if (video){
      await me.current.publish(video, {
        maxSubscribers: 50,
        encodings: [
          { maxBitrate: 80_000, id: 'low' },
          { maxBitrate: 400_000, id: 'high' },
        ],
      });
    }
    if (data) {
      await me.current.publish(data, {
        maxSubscribers: 50,
      });
    }

    // ルーム内に新しいメンバーが入室したときに呼ばれる
    roomRef.current.onMemberJoined.add((e) => {addMember(e.member)});

    // ルーム内にメンバーが退出したときに呼ばれる
    roomRef.current.onMemberLeft.add((e) => {console.log(e.member)});

    /**
     * 音声,ビデオ,データをSubscribeする
     */
    const subscribe = async(publication: RoomPublication) => {
      if (publication.publisher.id == me.current.id) return;
      if (publication.contentType === 'video') {
        // ビデオは、低品質のものをSubscribeする
        await me.current.subscribe(publication, {
          preferredEncodingId: 'low',
        });
      } 
      else if (publication.contentType === 'audio') {
        // 音声とデータは、デフォルトでSubscribeする
        await me.current.subscribe(publication);
      }
      else if (publication.contentType === 'data') {
        // const { stream } = await me.current.subscribe(publication.id);
        // stream.
        const a = await me.current.subscribe(publication);
        // if (a.subscription.stream.)
      }
    }
    
    // ルーム内に新しいメンバーがStreamをPublishしたときに呼ばれる
    roomRef.current.onStreamPublished.add(async (e) => {subscribe(e.publication)});
    await Promise.all(roomRef.current.publications.map(subscribe));

    // roomRef.current.onData
  }
  
  /**
   * データを送信する
   */
  const publishData = (pdata: IPublishData) => {
    if (data) data.write(JSON.stringify({...pdata}));
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
  const addMember = async(member: RoomMember) => {
    if (member.id == me.current.id) return;
    // if (){ }
  }

  return { 
    publishData: publishData, 
    leaveRoom: leaveRoom,
    subscribers: subscribers,
  }
}