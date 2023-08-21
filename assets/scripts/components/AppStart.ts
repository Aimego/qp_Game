import { api_getServerInfo } from '../api/gameStart_Api'
import { ServerInfo } from '../interface_ts'
import { loadRes } from '../utils/utils'
import gameMgr from '../gameMgr'
const { ccclass, property } = cc._decorator;
import Utils from "./Utils";

@ccclass
export default class AppStart extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null

    @property(cc.Node)
    lab: cc.Node = null

    _lab: cc.Label = null;

    reconnection = null;

    ver = null

    // 初始化
    async init() {
        this.lab.active = true;
        this._lab.string = '正在连接服务器'
        this.ver = await loadRes('ver/index')
        this.Loading()
        this.initMgr() // 初始化Utils
        this.getServerInfo()
    }

    initMgr() {
        gameMgr.Instance().UTILS = new Utils()
    }

    // 获取服务器信息
    getServerInfo() {
        console.log(api_getServerInfo)
        api_getServerInfo().then((res: ServerInfo) => {
            gameMgr.Instance().IS = res
            gameMgr.Instance().VERSION = res.version
            if(this.ver.text === gameMgr.Instance().VERSION) {
                this._lab.string = '获取服务器信息成功，正在跳转加载页面'
                cc.director.loadScene('loading') 
            } else {
                this._lab.string = '游戏版本与服务器不一致'
            }
        }).catch(() => {
            this._lab.string = '连接失败，即将重试'
            this.reconnection = setTimeout(() => {
                this.getServerInfo()
            }, 2000);
        })
    }

    Loading() {
        let i = 0
        this.schedule(() => {
            console.log('loading~')
            if(i % 3 == 0) {
                this._lab.string = this._lab.string.replace(/[.]/g, '')
            }
            i++
            this._lab.string += '.'
        }, 0.5)
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this._lab = this.lab.getComponent(cc.Label)
        this.lab.active = false
        this.scheduleOnce(() => {
            this.bg.active = false
            this.init()
        }, 2)
    }

    onDestroy() {
        clearTimeout(this.reconnection)
    }
}
