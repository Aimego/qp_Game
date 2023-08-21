import AudioProgressMgr from "./Base/AudioProgressMgr";
import gameMgr from "../../gameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Setting extends AudioProgressMgr {

    @property(cc.Node)
    loginout: cc.Node = null

    async onLoad() {
        await this.initProgressMgr()
        gameMgr.Instance().SETTING = this
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Setting', callback)
    }

    onShow() {
        this._setting.active = true
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._setting.active = false
    }
}
