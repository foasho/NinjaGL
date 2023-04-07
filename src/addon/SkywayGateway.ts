import { context } from '@react-three/fiber';
import { nowInSec, RoomMember, SfuRoom, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } from '@skyway-sdk/room';

export class SkywayGatewayManager {
    myId: string;
    roomManagements: IRoomProps[];
    skywayKey: string;
    constructor(skywayKey: string) {
        this.skywayKey = skywayKey;
    }

    /**
     * SkywayでRoomを作成する
     */
    createRoom = async(
        context: SkyWayContext, 
        type: "p2p" | "sfu",
        name: string
    ) => {
        const room = await SkyWayRoom.FindOrCreate(
            context,
        {
            type: type,
            name: name,
        });
        this.roomManagements.push({
            roomName: name,
            room: room,
        });
        room.join();
    }

    /**
     * SkywayでRoomに入室する
     */
    joinRoomByName = async(
        roomName: string,
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const me = await rm.room.join();
            this.myId = me.id;
        }
    }

    /**
     * Skywayで自分がRoomから退出する
     */
    leaveRoom = async(
        roomName: string,
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const members = await rm.room.members;
            const me = members.find(member => member.id === this.myId);
            rm.room.leave(me)
        }
    }

    /**
     * SkywayでRoomから退室させる
     */
    leaveRoomByName = async(
        roomName: string,
        member: RoomMember
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            rm.room.leave(member);
        }
    }

    /**
     * 音声または映像を送信する
     */
    sendStream = async(
        roomName: string,
        stream: MediaStream,
        type: "audio" | "video",
        options?: {
            audio?: {
                echoCancellation?: boolean;
                noiseSuppression?: boolean;
                autoGainControl?: boolean;
                channelCount?: number;
                deviceId?: string;
                latency?: number;
                sampleRate?: number;
                sampleSize?: number;
                volume?: number;
            },
            video?: {
                width?: number;
                height?: number;
                frameRate?: number;
                aspectRatio?: number;
                facingMode?: "user" | "environment";
                deviceId?: string;
                resizeMode?: "none" | "crop-and-scale";
                volume?: number;
            },
        }
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const me = await rm.room.members.find(member => member.id === this.myId);
            if (me){
                // await me.public
            }
        }
    }

    /**
     * 現在の特定のRoomでの参加人数を取得
     */
    getRoomMemberCount = async(
        roomName: string,
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const members = await rm.room.members;
            return members.length;
        }
        return 0;
    }

    /**
     * 特定のRoomの参加者一覧を取得
     */
    getRoomMembers = async(
        roomName: string,
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const members = await rm.room.members;
            return members;
        }
        return [];
    }

    /**
     * 特定のRoomにデータを送信する
     */
    sendRoomData = async(
        roomName: string,
        data: any,
    ) => {
        const rm = this.roomManagements.find(
            (rm) => rm.roomName === roomName
        );
        if (rm){
            const members = await rm.room.members;
            const me = members.find(member => member.id === this.myId);
            // rm.room.send(me, data);
        }
    }


}

interface IRoomProps {
    roomName: string;
    room: SfuRoom;
}