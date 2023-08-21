import gameMgr from "../../gameMgr";
const { ccclass, property } = cc._decorator;
import { api_createRoom } from '../../api/Hall_Api'
import { RoomMsg } from '../../interface_ts/index'
import { NanChangeMj } from '../../interface_ts/playGames'

@ccclass
export default class CreateRoom extends cc.Component {

    @property(cc.Node)
    createRoom_btn: cc.Node = null

    @property(cc.Node)
    joinRoom_btn: cc.Node = null

    @property(cc.Node)
    nanchangMjContent: cc.Node = null

    @property(cc.Node)
    closeCreateRoom: cc.Node = null

    _createRoom: cc.Node = null

    _gameType: string = 'NanchangeMj'

    _nanchangMjproperty: NanChangeMj = {
        maxUser: '4',
        maxGames: '8',
        stairs: 'none',
        playMethods: [],
        rules: []
    }

    onLoad() {
        this._createRoom = cc.find('Canvas/createRoom')
        this.initButtonHandler(this.createRoom_btn, 'createRoom')
        this.initButtonHandler(this.joinRoom_btn, 'joinRoom')
        this.initButtonHandler(this.closeCreateRoom, 'onHide')
        gameMgr.Instance().CREATEROOM = this
        this.initTogglerGroup(this.nanchangMjContent.getChildByName('maxUser'), 'maxUser', 'toggle1')
        this.initTogglerGroup(this.nanchangMjContent.getChildByName('maxGames'), 'maxGames', 'toggle1')
        this.initTogglerGroup(this.nanchangMjContent.getChildByName('stairs'), 'stairs', 'toggle1')
        this.initTogglerGroup(this.nanchangMjContent.getChildByName('playMethods'), 'playMethods', 'check')
        this.initTogglerGroup(this.nanchangMjContent.getChildByName('rules'), 'rules', 'check')
    }

    initTogglerGroup(node: cc.Node, key: string, chilByName: string) {
        const Group = node.children[1]
        Group.children.forEach((val: cc.Node) => {
            val.getChildByName(chilByName).getComponent(cc.Toggle).node.on('toggle', (event: any) => {
                this.toggleSelect(event, key, chilByName)
            })
        });
    }

    initTogglerHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addTogglerContainerEvent(node, this.node, 'CreateRoom', callback)
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'CreateRoom', callback)
    }

    createRoom() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        api_createRoom<NanChangeMj>(this._nanchangMjproperty, this._gameType).then((res:RoomMsg) => {
            const user = gameMgr.Instance().USERINFO
            gameMgr.Instance().WATING.show('正在加入房间~')
            gameMgr.Instance().enterRoom(user, res.roomId).then(() => {
                cc.director.loadScene('game')
            }).catch((err) => {
                console.log(err)
                gameMgr.Instance().ALERT.show('错误', '进入房间失败')
            }).finally(() => {
                gameMgr.Instance().WATING.hide()
            })
        })
    }

    joinRoom() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        gameMgr.Instance().JOINROOM.onShow()
    }

    toggleSelect(envet: any, key: string, type: string) {
        if (type === 'check') {
            const flag = envet.node.getComponent(cc.Toggle).isChecked
            const value = envet.node.parent.name
            if(flag) {
                this._nanchangMjproperty[key].push(value)
            } else {
                const index = this._nanchangMjproperty[key].indexOf(value)
                this._nanchangMjproperty[key].splice(index, 1)
            }
        } else {
            this._nanchangMjproperty[key] = envet.node.parent.name
        }
    }

    onShow() {
        this._createRoom.active = true
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._createRoom.active = false
    }
}
