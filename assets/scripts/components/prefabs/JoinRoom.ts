import gameMgr from "../../gameMgr";
import { RoomMsg } from "../../interface_ts";
const { ccclass, property } = cc._decorator;

@ccclass
export default class JoinRoom extends cc.Component {

    @property(cc.Node)
    roomNumber: cc.Node = null

    @property(cc.Node)
    inputNumber: cc.Node = null

    @property(cc.Node)
    closeJoinRoom: cc.Node = null

    _joinRoom: cc.Node = null

    _inputIndex: number = 0

    _roomNumber: Array<number | string> = []

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._joinRoom = cc.find('Canvas/joinRoom')
        this.initButtonHandler(this.closeJoinRoom, 'onHide')

        this.inputNumber.children.forEach((node: cc.Node) => {
            this.initButtonHandler(node, 'onInput')
        });

        gameMgr.Instance().JOINROOM = this
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'JoinRoom', callback)
    }


    onInput(event: cc.Event.EventTouch) {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        switch (event.target.name) {
            case 'retype':
                this.clearnNumber()
                break;
            case 'delete':
                this.rollbackNumber()
                break;
            default:
                if (this._inputIndex < this.roomNumber.childrenCount) {
                    this.roomNumber.children[this._inputIndex].getComponent(cc.Label).string = event.target.name
                    this._roomNumber.push(event.target.name)
                    this._inputIndex += 1
                    if (this._inputIndex == this.roomNumber.childrenCount) {
                        this.enterRoom()
                    }
                }
        }
    }

    clearnNumber() {
        this._inputIndex = 0
        this._roomNumber = []
        this.roomNumber.children.forEach((node: cc.Node) => {
            node.getComponent(cc.Label).string = '_'
        })
    }

    rollbackNumber() {
        if (this._inputIndex > 0) {
            this._inputIndex -= 1
            this._roomNumber.splice(this._inputIndex, 1)
            this.roomNumber.children[this._inputIndex].getComponent(cc.Label).string = '_'
        }
    }

    enterRoom() {
        const user = gameMgr.Instance().USERINFO
        gameMgr.Instance().WATING.show('正在加入房间~')
        gameMgr.Instance().enterRoom(user, this._roomNumber.join('')).then(() => {
            cc.director.loadScene('game')
        }).catch((err) => {
            console.log(err)
            gameMgr.Instance().ALERT.show('错误', '进入房间失败')
        }).finally(() => {
            gameMgr.Instance().WATING.hide()
        })
    }

    onShow() {
        this._joinRoom.active = true
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._joinRoom.active = false
    }
}
