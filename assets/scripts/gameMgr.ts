import { ServerInfo, User, RoomMsg, LeaveRoomMsg } from './interface_ts'
import { Config } from './config'
import Alert from '../scripts/components/prefabs/Alert'
import WattingConnection from './components/prefabs/WattingConnection'
import Setting from './components/prefabs/Setting'
import CreateRoom from './components/prefabs/CreateRoom'
import JoinRoom from './components/prefabs/JoinRoom'
import socketNet from './socket/io'
import audioMgr from './audioMgr'
import Utils from './components/Utils'
import Room_Setting from './components/prefabs/Room_Setting'
import Chat from './components/prefabs/Chat'
import Voice from './components/prefabs/Voice'
import GameResult from './components/prefabs/GameOverResult'
export default class gameMgr {
    IS: ServerInfo = null
    isWeChatPLATFORM: boolean = false
    Wx = window['wx']
    VERSION: string = null // 游戏版本号
    ALERT: Alert = null // 提示栏
    WATING: WattingConnection = null // 加载栏
    SETTING: Setting = null // 设置栏
    SETTING_ROOM: Room_Setting = null // 房间设置栏
    CREATEROOM: CreateRoom = null // 创建房间栏
    CHATING: Chat = null
    JOINROOM: JoinRoom = null // 加入房间栏
    VOICE: Voice = null // 语音栏
    GAMERESULT: GameResult = null // 游戏结束
    USERINFO: User = null // 用户信息管理
    TOKEN: string = null // 用户token
    ROOMINFO: RoomMsg = null // 房间信息
    AUDIOMGR: audioMgr = null // 音乐管理
    SOCKET: socketNet = null // socket管理
    UTILS: Utils = null // 组件常用Utils
    AUDIO: object = {} // 音乐文件缓存
    private static _instance: gameMgr = null
    static Instance() {
        if (!this._instance) {
            this._instance = new gameMgr()
        }
        return this._instance
    }

    enterRoom(user: User, roomId: string) { // 进入房间
        this.SOCKET.connect(user, roomId)
        return new Promise((resolve, reject) => {
            this.SOCKET.sio.on('join success', (room: RoomMsg) => {
                console.log(room, 'join success')
                this.ROOMINFO = room
                resolve(room)
            })
            gameMgr.Instance().SOCKET.sio.on('join fail', (res: any) => {
                console.log(res, 'join fail')
                reject(res)
            })
        })
    }

    leaveRoom(userId: string, roomId: string): Promise<any> { // 离开房间
        if (!gameMgr.Instance().SOCKET.sio) {
            return Promise.reject(new Error('Socket.io instance not found'))
        }
        gameMgr.Instance().SOCKET.sio.emit('leaveRoom', { _id: userId, roomId })
        return new Promise((resolve, reject) => {
            gameMgr.Instance().SOCKET.sio.on('leave success', (res: LeaveRoomMsg) => {
                console.log('leave success', res._id)
                if(this.USERINFO._id === res._id) {
                    this.USERINFO.roomId = null
                    this.ROOMINFO = null
                } else {
                    console.log('有人离开房间了roomInfo', res.room)
                    this.ROOMINFO = res.room
                }
                resolve(res._id)
            })
            gameMgr.Instance().SOCKET.sio.on('leave fail', (err: any) => {
                console.log('leave fail')
                reject(err)
            })
        })
    }

    dismissRoom(userId: string, roomId: string): Promise<any> {
        if (!gameMgr.Instance().SOCKET.sio) {
            return Promise.reject(new Error('Socket.io instance not found'))
        }
        gameMgr.Instance().SOCKET.sio.emit('dismissRoom', { _id: userId, roomId })
        return new Promise((resolve, reject) => {
            gameMgr.Instance().SOCKET.sio.on('dismiss success', (res: any) => {
                console.log('dismiss success')
                this.USERINFO.roomId = null
                this.ROOMINFO = null
                resolve(res)
            })
            gameMgr.Instance().SOCKET.sio.on('dismiss fail', (err: any) => {
                console.log('dismiss fail')
                reject(err)
            })
        })
    }
}