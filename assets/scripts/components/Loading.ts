
import gameMgr from "../gameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.ProgressBar)
    pro: cc.ProgressBar = null
    
    @property(cc.Label)
    label: cc.Label = null

    @property(cc.Prefab)
    Alert: cc.Prefab = null

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.loadRes()
    }

    loadRes() {
        cc.loader.loadResDir('textures', (com, total, item) => {
            this.pro.progress = com / total
            this.label.string = `正在载入资源：${Math.floor(com/total * 100)}%`
        },(err) => {
            if(err) {
                gameMgr.Instance().ALERT.show('提示','资源加载异常，请重新进入游戏')
                this.label.string = '资源加载异常'
            } else {
                this.label.string = '场景跳转中'
                cc.director.loadScene('login')
            }
        })
    }
    start () {
    }

    // update (dt) {}
}
