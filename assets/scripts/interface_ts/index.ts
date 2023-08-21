import { Verify, operatesModel } from './playGames'

export interface Response { // 服务端必须返回的数据格式
    code: number,
    data: any
}

export interface WxOpenInfo { // 微信返回的用户唯一数据
    openid: string, // 该小程序用户的唯一id
    session_key: string
}

export interface TileSchema {
    type: string,
    number: string,
    index: number
}

export interface User { // 用户信息格式
    _id: string,
    name: string,
    sign: string,
    roomId: string,
    gameIp: string,
    gems: number,
    roomOnline: boolean,
    roomReady: boolean,
    gold: number,
    avatar: string,
    sex: number,
    createTime: string
}

export interface RoomMsg { // 房间信息格式
    roomId: string
    gameType: any,
    gameTypeRef: string,
    roomStart: boolean,
    currentGames: string,
    name: string,
    createUser: string,
    players: Array<User>,
    createTime: string
}

export interface LeaveRoomMsg {
    _id: string,
    room: RoomMsg
}

export interface SendMessageInfo { // 客户端发送的socket消息格式
    msg: string,
    sfx?: string
}

export interface SendVoiceInfo {
    roomId: string,
    voice: string
}

export interface SendUserReadyInfo { // 客户端发送的socket的用户准备信息
    roomId: string,
    ready: boolean
}

export interface SendPlayCard {
    roomId: string,
    card: TileSchema
}


export interface MessageInfo { // 服务端socket返回消息格式
    _id: string,
    msg: string,
    sfx?: string
}

export interface VoiceInfo {
    _id: string,
    voice: string
}

export interface UserReadyInfo { // 服务端socket返回的用户房间准备信息
    _id: string,
    ready: boolean
}

export interface BankerInfo {
    banker: string,
    jokers: Array<TileSchema>
}

export interface DicesInfo {
    dice1: number,
    dice2: number
}

export interface CardInfo {
    _id: string,
    card: TileSchema
}

export interface VerifyInfo {
    _id: string,
    hints: Array<string>
    verifyInfo: Verify
}

export interface RoundInfo {
    roundId: string,
    draw: boolean
}

export interface EmojiInfo {
    _id: string,
    emoji: string
}


export interface ServerInfo { // 服务信息格式
    appweb: string,
    httpIp: string,
    mjSocket: string,
    defaultAvatar: string,
    version: string
}

