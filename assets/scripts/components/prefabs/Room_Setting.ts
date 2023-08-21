import AudioProgressMgr from "./Base/AudioProgressMgr";
import gameMgr from "../../gameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Room_Setting extends AudioProgressMgr {

    @property(cc.Node)
    dismiss: cc.Node = null

    @property(cc.Node)
    goback: cc.Node = null

    async onLoad() {
        await this.initProgressMgr()
        this.initButtonHandler(this.dismiss, 'dissolveRoom')
        this.initButtonHandler(this.goback, 'gobackHall')
        gameMgr.Instance().SETTING_ROOM = this
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Room_Setting', callback)
    }

    dissolveRoom() {
        const user = gameMgr.Instance().USERINFO
        const room = gameMgr.Instance().ROOMINFO
        gameMgr.Instance().dismissRoom(user._id, room.roomId).then(res => {
            console.log(res)
            cc.director.loadScene('hall')
        }).catch(err => {
            console.log(err)
        }).finally(()=> {
            gameMgr.Instance().SOCKET.sio.close()
        })
    }

    gobackHall() {
        const user = gameMgr.Instance().USERINFO
        const room = gameMgr.Instance().ROOMINFO
        gameMgr.Instance().leaveRoom(user._id, room.roomId).then(res => {
            console.log('离开了房间',res)
            cc.director.loadScene('hall')
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            gameMgr.Instance().SOCKET.sio.close()
        })
    }

    onShow() {
        this._setting.active = true
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._setting.active = false
    }
}
