import {
    User, RoomMsg, MessageInfo, VoiceInfo, UserReadyInfo, LeaveRoomMsg, DicesInfo, CardInfo, RoundInfo, BankerInfo, VerifyInfo,
    SendMessageInfo, SendVoiceInfo, SendUserReadyInfo, SendPlayCard
} from "../interface_ts";
import { Verify, CPKinfo, WinInfo, NanChangeMjUserGame } from '../interface_ts/playGames'
import { Config } from "../config";

import gameMgr from "../gameMgr";
// const io = (window as any).io || {}
const io = window['io']

// 心跳间隔时间(毫秒)
const HEARTBEAT_INTERVAL = 5000;

export default class socketNet {
    sio = null
    connected: boolean = false
    lastReceiveTime: number = null
    intervalTime = null

    connect(user: User, roomId: string) {
        this.sio = io(Config.Mj_IP, {
            // "transports": ['websocket']
            query: {
                userId: gameMgr.Instance().USERINFO._id
            }
            // withCredentials: true
            // transports: ['websocket'],
            // secure: true
        })
        console.log('2')
        this.lastReceiveTime = Date.now()
        this.sio.on('connect', () => {
            console.log('Connected to server');
            this.connected = true
            this.sendIntervalHeartBeat()
            this.sio.emit('joinRoom', { _id: user._id, roomId })
        })

        this.sio.on('heartbeart', () => {
            console.log('Received heartbeat response')
        })

        this.sio.on('disconnect', () => {
            console.log('Disconnected from server');
            clearInterval(this.intervalTime)
            this.connected = false
        })

        this.sio.on('connect_failed', () => {
            console.log('connect_failed')
            this.connected = false
        })
    }

    sendHeartBeat() {
        if (this.connected) {
            this.sio.emit('heartbeat');
            this.lastReceiveTime = Date.now()
        }
    }

    sendIntervalHeartBeat() {
        this.intervalTime = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - this.lastReceiveTime > HEARTBEAT_INTERVAL) {
                this.sendHeartBeat()
            }
        }, HEARTBEAT_INTERVAL)
    }

    // 监听加入房间
    onRoomJoinHandler(callback: Function, err_callback: Function) {
        this.sio.on('join success', ((res: RoomMsg) => {
            callback(res)
        }))
        this.sio.on('join fail', ((err: string) => {
            err_callback(`join fail ${err}`)
        }))
    }

    // 监听离开房间
    onRoomLeaveHandler(callback: Function, err_callback: Function) {
        this.sio.on('leave success', ((res: LeaveRoomMsg) => {
            gameMgr.Instance().ROOMINFO = res.room
            callback(res._id)
        }))
        this.sio.on('leave fail', ((err: string) => {
            err_callback(`leave fail ${err}`)
        }))
    }

    // 监听解散房间
    onRoomDismissHandler(callback: Function, err_callback: Function) {
        this.sio.on('dismiss success', ((res: RoomMsg) => {
            callback(res)
        }))
        this.sio.on('dismiss fail', ((err: string) => {
            err_callback(`dismiss fail ${err}`)
        }))
    }

    // 监听发送消息
    onRoomMessageHandler(callback: Function, err_callback: Function) {
        this.sio.on('message success', ((msg: MessageInfo) => {
            callback(msg)
        }))
        this.sio.on('message fail', ((err: string) => {
            err_callback(`message fail ${err}`)
        }))
    }

    // 监听发送语音
    onRoomVoiceHandler(callback: Function) {
        this.sio.on('voice success', ((msg: VoiceInfo) => {
            callback(msg)
        }))
    }

    // 监听发送表情
    onRoomEmojiHandler(callback: Function, err_callback: Function) {
        console.log('监听发送表情')
        this.sio.on('emoji success', callback)
        this.sio.on('emoji fail', err_callback)
    }

    // 监听玩家准备
    onRoomUserReady(callback: Function, err_callback: Function) {
        this.sio.on('ready success', ((msg: UserReadyInfo) => {
            callback(msg)
        }))
        this.sio.on('ready fail', ((err: string) => {
            err_callback(`ready fail ${err}`)
        }))
    }

    // 监听游戏开始
    onRoomStartGame(callback: Function, err_callback: Function) {
        this.sio.on('startGame success', (msg: BankerInfo) => {
            callback(msg)
        })
        this.sio.on('startGame fail', (err: string) => {
            err_callback(`startGame fail ${err}`)
        })
    }

    // 监听庄家
    onRoomBanker(callback: Function, err_callback: Function) {
        this.sio.on('banker success', (res: BankerInfo) => {
            callback(res)
        })
        this.sio.on('banker fail', (err: string) => {
            err_callback(`banker fail ${err}`)
        })
    }

    // 监听剩余牌数
    onRoomRemainCard(callback: Function) {
        this.sio.on('remainCard', (res: number) => {
            callback(res)
        })
    }

    // 监听轮盘指向谁
    onRoomRound(callback: Function, err_callback: Function) {
        this.sio.on('round success', (res: RoundInfo) => {
            callback(res)
        })
        this.sio.on('round fail', (err: string) => {
            err_callback(`round fail ${err}`)
        })
    }

    // 监听轮盘倒计时
    onRoomCountDownTime(callback: Function) {
        this.sio.on('countdown', (res: number) => {
            callback(res)
        })
    }

    // 监听轮盘倒计时结束
    onRoomCountDownTimeEnd(callback: Function) {
        this.sio.on('countdownEnd', (res: string) => {
            callback(res)
        })
    }

    // 监听骰子
    onRoomDice(callback: Function) {
        this.sio.on('dice', (res: DicesInfo) => {
            callback(res)
        })
    }

    // // 监听用户检测手牌
    // onRoomClientVerify() {
    //     this.sio.on('clientVerify', (res: Verify) => {
    //         this.sendVerify(res)
    //     })
    // }

    // 监听发牌
    onRoomDealCard(callback: Function, err_callback: Function) {
        console.log('onRoomDealCard')
        this.sio.on('getDealcard success', (res: NanChangeMjUserGame) => {
            callback(res)
        })
        this.sio.on('getDealcard fail', (err: string) => {
            err_callback(`dealcard fail ${err}`)
        })
    }

    // 监听摸牌
    onRoomDrawCard(callback: Function, err_callback: Function) {
        this.sio.on('drawcard success', (res: CardInfo) => {
            callback(res)
        })
        this.sio.on('drawcard fail', (err: string) => {
            err_callback(`draw fail ${err}`)
        })
    }

    // 监听打牌
    onRoomPlayCard(callback: Function, err_callback: Function) {
        this.sio.on('playcard success', (res: CardInfo) => {
            callback(res)
        })
        this.sio.on('playcard fail', (err: string) => {
            err_callback(`playcard fail ${err}`)
        })
    }

    // 监听当其他人打出手牌是否能吃碰杠胡牌
    onRoomPlayCardVerify(callback: Function) {
        this.sio.on('playcardVerify', (res: Array<VerifyInfo>) => {
            callback(res)
        })
    }

    // 监听本人摸牌是否能碰杠胡牌
    onRoomDrawCardVerify(callback: Function) {
        this.sio.on('drawcardVerify', (res: VerifyInfo) => {
            console.log('drawcardVerify', res)
            callback(res)
        })
    }

    // 监听吃牌
    onRoomChowCard(callback: Function, err_callback: Function) {
        this.sio.on('chow success', (res: CPKinfo) => {
            callback(res)
        })
        this.sio.on('chow fail', (err: string) => {
            err_callback(`chow fail ${err}`)
        })
    }

     // 监听碰牌
     onRoomPongCard(callback: Function, err_callback: Function) {
        this.sio.on('pong success', (res: CPKinfo) => {
            console.log('onRoomPongCard',res)
            callback(res)
        })
        this.sio.on('pong fail', (err: string) => {
            err_callback(`pong fail ${err}`)
        })
    }

     // 监听杠牌
     onRoomKongCard(callback: Function, err_callback: Function) {
        this.sio.on('kong success', (res: CPKinfo) => {
            callback(res)
        })
        this.sio.on('kong fail', (err: string) => {
            err_callback(`kong fail ${err}`)
        })
    }

    // 监听胡牌
    onRoomWinCard(callback: Function, err_callback: Function) {
        this.sio.on('win success', (res: WinInfo) => {
            callback(res)
        })
        this.sio.on('win fail', (err: string) => {
            err_callback(`win fail ${err}`)
        })
    }

    // 监听游戏结束
    onRoomGameOver(roomId: string) {
        console.log('game over1')
        this.sio.on('game over', () => {
            console.log('game over2')
            this.sendGameOver(roomId)
        })
    }

    // 监听游戏结算
    onRoomGameResult(callback: Function, err_callback: Function) {
        console.log('gameResult')
        this.sio.on('gameResult success', (res: Array<NanChangeMjUserGame>) => {
            callback(res)
        })
        this.sio.on('gameResult fail', (err: string) => {
            err_callback(err)
        })
    }

    // 玩家准备
    sendReady(ready: SendUserReadyInfo) {
        this.sio.emit('ready', ready)
    }

    // 游戏开始
    sendStart(roomId: string) {
        this.sio.emit('startGame', roomId)
    }

    // 判断庄家
    sendBanker(roomId: string) {
        this.sio.emit('banker', roomId)
    }

    // 发牌
    sendDealCard(roomId: string) {
        console.log('getDealcard')
        this.sio.emit('getDealcard', roomId)
    }

    // 摸牌
    sendDrawCard(roomId: string) {
        this.sio.emit('drawcard', roomId)
    }

    // 打牌
    sendPlayCard(msg: SendPlayCard) {
        this.sio.emit('playcard', msg)
    }

    // 吃牌
    sendChowCard(msg: Verify) {
        this.sio.emit('chow', msg)
    }

    // 碰牌
    sendPongCard(msg: Verify) {
        this.sio.emit('pong', msg)
    }

    // 杠牌
    sendKongCard(msg: Verify) {
        this.sio.emit('kong', msg)
    }

    // 胡牌
    sendWinCard(msg: Verify) {
        this.sio.emit('win', msg)
    }

    // 过牌
    sendSkipCard(roomId: string) {
        this.sio.emit('skip', roomId)
    }

    // // 校验是否能进行胡、吃、碰、杠
    // sendVerify(msg: Verify) {
    //     this.sio.emit('verify', msg)
    // }

    // 轮盘指向谁出牌
    sendRound(roomId: string) {
        this.sio.emit('round', roomId)
    }

    // 发送消息
    sendMessage(msg: SendMessageInfo) {
        this.sio.emit('message', msg)
    }

    // 发送语音
    sendVoice(msg: SendVoiceInfo) {
        this.sio.emit('voice', msg)
    }

    // 发送表情
    sendMoji(emoji: string) {
        this.sio.emit('emoji', emoji)
    }

    // 发送游戏结束事件
    sendGameOver(roomId: string) {
        this.sio.emit('gameResult', roomId)
    }

    close() {
        this.sio.disconnect()
        clearInterval(this.intervalTime)
    }
}