import { TileSchema, User } from "./index"

export interface record {
    method: TypeVerify,
    win: HuTypes,
    value: number
}

export interface NanChangeMjUserGame {
    user: string | User,
    roomId: string,
    roomReady: Boolean,
    roomHand: Array<TileSchema>,
    roomSite: Array<TileSchema>,
    roomChow: Array<Array<TileSchema>>,
    roomPong: Array<Array<TileSchema>>,
    roomKong: Array<Array<TileSchema>>,
    record: Array<record>
    value: Number
}


export interface NanChangeMj {
    maxUser: string,
    maxGames: string,
    stairs: string,
    playMethods: Array<string>,
    rules: Array<string>
}

export enum TypeVerify {
    SELF = 'Self',
    OTHER = 'Other'
}

export enum operatesModel {
    CHOW = 'Chow',
    PONG = 'Pong',
    KONG = 'Kong',
    WIN = 'Win'
}

export enum TipsInfo {
    CHOW = 'Chow',
    PONG = 'Pong',
    KONG = 'Kong',
    WIN = 'Win',
    HU = 'Hu',
    CHOICE = 'Choice'
}

export enum HuTypes {
    PINGHU = 'PingHu',
    GERMANY_PINGHU = 'Germany_PingHu',
    SEVENPAIRS = 'SevenPairs',
    GERMANY_SEVENPAIRS = 'Germany_SevenPairs',
    SHISANLAN = 'ShiSanLan',
    GERMANY_SHISANLAN = 'Germany_ShiSanLan',
}

export enum HuTypesTranslate {
    PingHu = '平胡',
    Germany_PingHu = '德国平胡',
    SevenPairs = '七小对',
    Germany_SevenPairs = '德国七小对',
    ShiSanLan = '十三烂',
    Germany_ShiSanLan = '德国十三烂',
}

export interface Verify {
    type: TypeVerify,
    roomId: string
    owner: string,
    card: TileSchema
}

export interface CPKinfo extends Verify {
    _id: string,
    operateType: operatesModel,
    handArr: Array<TileSchema>
}

export interface WinInfo extends Verify {
    _id: string,
    huType: HuTypes
}