import {
  LocalAudioStream,
  LocalSFURoomMember,
  LocalVideoStream,
  RoomPublication,
  SfuRoom,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
} from "@skyway-sdk/room";

/**
 * プライベート通話には、SFUを利用する
 */
export interface IPrivateCallProps {
  token: string;
  audio: boolean;
  video: boolean;
  localVideo: HTMLVideoElement;
  myId: string;
  onStreamCallback?: (elm: HTMLVideoElement | HTMLAudioElement) => void;
}

export enum ICallRole {
  Owner = "Owner", // 電話をかけた人
  Joiner = "Joiner", // 電話に参加した人
}

// PrivateCallのRoom
export class MyPrivateCall {
  role: ICallRole | null = null;
  me: LocalSFURoomMember | null = null;
  context: SkyWayContext | null = null;
  room: SfuRoom | null = null;
  audioStream: LocalAudioStream | null = null;
  videoStream: LocalVideoStream | null = null;
  mediaStream: MediaStream | null = null;
  maxSubscribers: number = 8;
  params: IPrivateCallProps;

  // 最初はパラメータのみ控えておく
  constructor(props: IPrivateCallProps) {
    this.params = { ...props };
  }

  /**
   * PrivateCallを開始
   * @param roomId
   */
  async startPrivateCall(roomId: string, role: ICallRole) {
    const props = this.params;
    this.context = await SkyWayContext.Create(props.token);
    await this.CreateRoom(roomId);
    if (this.room) {
      // // ルーム内に既に存在するメンバーのStreamをSubscribeする
      this.room.publications.forEach((publish) => {
        console.log("already exist member: ", publish.id, " / ", this.me?.id);
        this.subscribeAndAttach(props, publish);
      });
      // ルーム内に新しいメンバーがStreamをPublishしたときに呼ばれる
      this.room.onStreamPublished.add((e) => {
        console.log(
          "onStreamPublished: ",
          e.publication.id,
          " / ",
          this.me?.id
        );
        this.subscribeAndAttach(props, e.publication);
      });

      // ルーム内に既に存在するメンバーのStreamをSubscribeする
      this.room.publications.forEach((pub) => {
        console.log("New User: ", pub.id, " / ", this.me?.id);
        this.subscribeAndAttach(props, pub);
      });
      this.role = role;
    }
  }

  // ルームの作成
  private async CreateRoom(roomId: string) {
    if (!this.context) return;
    this.room = await SkyWayRoom.FindOrCreate(this.context, {
      type: "sfu",
      name: roomId,
      id: roomId,
    });
    this.me = await this.room.join();
    this.publishStream();
  }

  private async publishStream() {
    if (this.params.video || this.params.audio) {
      try {
        const { audio, video } =
          await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream({
            video: { height: 640, width: 360, frameRate: 15 }, // 品質を落とす
          });
        if (this.params.video) {
          this.videoStream = video;
        }
        if (this.params.audio) {
          this.audioStream = audio;
        }
        video.attach(this.params.localVideo);
        await this.params.localVideo.play();
        if (this.params.audio) {
          this.enableAudio();
        }
        if (this.params.video) {
          this.enableVideo();
        }
      } catch (e) {}
    }
  }

  /**
   * 通話を切る
   */
  public destroyRoom = async () => {
    if (this.room) {
      if (this.role == ICallRole.Owner) {
        // ルームを削除する
        await this.room.close();
      } else if (this.me) {
        // ルームから退出する
        await this.room.leave(this.me);
      }
      this.context = null;
      this.room = null;
      this.me = null;
      this.audioStream = null;
      this.videoStream = null;
      this.role = null;
    }
  };

  /**
   * 音声を有効にする
   * ※自分のStreamデータを送信する
   */
  public enableAudio = async () => {
    if (this.audioStream && this.me) {
      await this.me.publish(this.audioStream, {
        maxSubscribers: this.maxSubscribers,
      });
    }
  };

  /**
   * 音声を無効にする
   */
  public disableAudio = async () => {};

  /**
   * ビデオを有効にする(送信)
   * ※自分のStreamデータを送信する
   */
  public enableVideo = async () => {
    if (this.videoStream) {
      await this.me!.publish(this.videoStream, {
        maxSubscribers: this.maxSubscribers,
        encodings: [
          { maxBitrate: 80_000, id: "low" },
          { maxBitrate: 400_000, id: "high" },
        ],
      });
    }
  };

  /**
   * 画面共有を有効にする
   */
  public enableScreenShare = async () => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((_mediaStream) => {
        // 自分用のStream
        this.mediaStream = new MediaStream();
        let videoTrack = _mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          this.mediaStream.addTrack(videoTrack);
        }
      });
  };

  /**
   * 音声,ビデオをSubscribeする
   * (受信)
   */
  private subscribeAndAttach = async (
    props: IPrivateCallProps,
    publication: RoomPublication
  ) => {
    try {
      if (!this.me) return;
      if (publication.publisher.id == this.me.id) return;
      const { stream } = await this.me.subscribe(publication.id);
      switch (stream.contentType) {
        case "video":
          {
            console.log("video", stream);
            const elm = document.createElement("video");
            elm.playsInline = true;
            elm.autoplay = true;
            stream.attach(elm);
            if (props.onStreamCallback) props.onStreamCallback(elm);
          }
          break;
        case "audio":
          {
            console.log("audio", stream);
            const elm = document.createElement("audio");
            elm.controls = true;
            elm.autoplay = true;
            stream.attach(elm);
            if (props.onStreamCallback) props.onStreamCallback(elm);
          }
          break;
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * RoomIDを取得する
   */
  public getRoomId = () => {
    if (!this.room) return null;
    return this.room.id;
  };
}
