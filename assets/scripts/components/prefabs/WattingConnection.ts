
import gameMgr from "../../gameMgr";
const {ccclass, property} = cc._decorator;

@ccclass
export default class WattingConnection extends cc.Component {

    _label: cc.Label = null

    _waiting: cc.Node = null

    _loading: cc.Node = null

    show(label: string = '正在加载中~') {
        this._label.string = label
        this._waiting.active = true
    }

    hide() {
        this.scheduleOnce(() => {
            this._waiting.active = false
        }, 1)
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this._waiting = cc.find('Canvas/waitingConnection')
        this._label = this._waiting.getChildByName('label').getComponent(cc.Label)
        this._loading = this._waiting.getChildByName('loading').getChildByName('circle')
        gameMgr.Instance().WATING = this
    }

    update (dt) {
        if(this._waiting.active) {
            this._loading.angle = this._loading.angle - 45 * dt
        }
    }
}
