import gameMgr from "../gameMgr";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    uiRoot: cc.Node = null

    
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.initRoomConfig()
    }

    initRoomConfig() {
        const roomNumber: cc.Label = this.uiRoot.getChildByName('roomNumber')
        .getChildByName('number')
        .getComponent(cc.Label)
        roomNumber.string = gameMgr.Instance().ROOMINFO.roomId
    }

    start () {

    }

    // update (dt) {}
}
