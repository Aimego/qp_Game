
import gameMgr from "../../gameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Alert extends cc.Component {

    title: cc.Label = null

    contetn: cc.Label = null;

    callback: Function;
    _alert: cc.Node = null

    onLoad() {
        this._alert = cc.find('Canvas/alert')
        this.title = this._alert.getChildByName('title').getComponent(cc.Label)
        this.contetn = this._alert.getChildByName('content').getComponent(cc.Label)
        const confirm: cc.Node = this._alert.getChildByName('confirm')
        this.initButtonHandler(confirm, 'confirm')
        gameMgr.Instance().ALERT = this
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Alert', callback)
    }

    show(title:string, contetn:string, callback?:Function) {
        this.title.string = title
        this.contetn.string = contetn
        this.callback = callback
        this._alert.active = true
    }

    hide() {
        this._alert.active = false
    }

    confirm() {
        if(this.callback) {
            this.callback()
        }
        this.hide()
    }
}
