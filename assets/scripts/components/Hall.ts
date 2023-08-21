import gameMgr from "../gameMgr";
import { loadTexture2d } from '../utils/utils'
const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {

    @property(cc.Node)
    lbuserInfo: cc.Node = null // 用户信息

    @property(cc.Label)
    lbnotice: cc.Label = null // 公告label

    @property(cc.Node)
    gamePlay: cc.Node = null // 玩法

    @property(cc.Node)
    hallMenus: cc.Node = null // 底部菜单栏

    lbavatar: cc.Sprite = null // 用户头像
    lbname: cc.Label = null // 用户姓名
    lbmoney: cc.Label = null // 金额label
    lbmoney_unit: cc.Label = null // 金额单位
    lbgems: cc.Label = null // 房卡label



    _money: number = null
    _gems: number = null


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log('Hall_onLoad')
        gameMgr.Instance().AUDIOMGR.playBgm('bgMain')
        this.initUserInfo()
        this.initHallMenuButton()
        this.initPlayGameButton()
    }
    /**
     * 初始化用户UI信息
    */
    initUserInfo() {
        const userinfo = gameMgr.Instance().USERINFO // 用户信息
        const info: cc.Node = this.lbuserInfo.getChildByName('info')
        const property: cc.Node = info.getChildByName('property')
        const gold: cc.Node = property.getChildByName('gold')
        const car: cc.Node = property.getChildByName('car')
        this.lbavatar = this.lbuserInfo.getChildByName('avatar').getChildByName('icon').getComponent(cc.Sprite)
        this.lbname = info.getChildByName('name').getComponent(cc.Label)
        this.lbmoney = gold.getChildByName('number').getComponent(cc.Label)
        this.lbmoney_unit = gold.getChildByName('unit').getComponent(cc.Label)
        this.lbgems = car.getChildByName('number').getComponent(cc.Label)

        this.lbname.string = userinfo.name
        this.money = userinfo.gold
        this.gems = userinfo.gems
        this.lbmoney.string = this.money.toString()
        this.lbgems.string = this.gems.toString()
        
        loadTexture2d(userinfo.avatar).then((res: cc.SpriteFrame) => {
            this.lbavatar.spriteFrame = res
        })

        if(userinfo.roomId) { // 判断用户是否有未结束的房间需要重连
            gameMgr.Instance().ALERT.show('提示', '你有未完成的游戏房间，是否重连~', this.ReconnectionRoom.bind(this))
        }
    }


    /**
     * 初始化大厅菜单栏
     */
    initHallMenuButton() {
        const utils = gameMgr.Instance().UTILS
        const setting = this.hallMenus.getChildByName('setting')
        const email = this.hallMenus.getChildByName('email')
        const share = this.hallMenus.getChildByName('share')
        const playgame = this.hallMenus.getChildByName('playgame')
        const feedback = this.hallMenus.getChildByName('feedback')
        const record = this.hallMenus.getChildByName('record')
        const shopping = this.hallMenus.getChildByName('shopping')

        utils.addClickEvent(setting, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(email, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(share, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(playgame, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(feedback, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(record, this.node, 'Hall', 'onBtnHallMenuClick')
        utils.addClickEvent(shopping, this.node, 'Hall', 'onBtnHallMenuClick')
    }

    /**
     * 初始化游戏菜单栏
     */
    initPlayGameButton() {
        const utils = gameMgr.Instance().UTILS
        const poker_texas = this.gamePlay.getChildByName('poker_texas')
        const mahjong_bloody = this.gamePlay.getChildByName('mahjong_bloody')
        const landlords_pook = this.gamePlay.getChildByName('landlords_pook')
        const mahjong_double = this.gamePlay.getChildByName('mahjong_double')
        const chess_cn = this.gamePlay.getChildByName('chess_cn')
        const catchfish_joy = this.gamePlay.getChildByName('catchfish_joy')

        utils.addClickEvent(poker_texas, this.node, 'Hall', 'onBtnPlayGameClick')
        utils.addClickEvent(mahjong_bloody, this.node, 'Hall', 'onBtnPlayGameClick')
        utils.addClickEvent(landlords_pook, this.node, 'Hall', 'onBtnPlayGameClick')
        utils.addClickEvent(mahjong_double, this.node, 'Hall', 'onBtnPlayGameClick')
        utils.addClickEvent(chess_cn, this.node, 'Hall', 'onBtnPlayGameClick')
        utils.addClickEvent(catchfish_joy, this.node, 'Hall', 'onBtnPlayGameClick')
    }

    /**
     * 判断用户是否需要重连房间
     */
    ReconnectionRoom() {
        const userinfo = gameMgr.Instance().USERINFO // 用户信息
        gameMgr.Instance().WATING.show('正在进入房间~')
        gameMgr.Instance().enterRoom(userinfo, userinfo.roomId).then(() => {
            cc.director.loadScene('game')
        }).catch((err) => {
            console.log(err)
            gameMgr.Instance().ALERT.show('错误', '进入房间失败')
        }).finally(() => {
            gameMgr.Instance().WATING.hide()
        })
    }


    onBtnPlayGameClick(event: cc.Event.EventTouch) {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        switch (event.target.name) {
            case 'mahjong_bloody': gameMgr.Instance().CREATEROOM.onShow();
                break;
        }
    }

    onBtnHallMenuClick(event: cc.Event.EventTouch) {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        switch (event.target.name) {
            case 'setting': gameMgr.Instance().SETTING.onShow();
                break;
            default: console.log(event.target.name)
        }
    }

    set money(value: number) {
        this._money = value
        if (this.money <= 0) {
            this._money = 0
        }
    }

    set gems(value: number) {
        this._gems = value
        if (this._gems <= 0) {
            this._gems = 0
        }
    }

    get money() {
        if (this._money >= 100000) {
            this.lbmoney_unit.string = '万'
            return this._money / 10000
        }
        return this._money
    }

    get gems() {
        return this._gems
    }

    update(dt) {
        this.lbnotice.node.x -= dt * 100 // 每秒移动100像素
        if (this.lbnotice.node.x < -this.lbnotice.node.width) {
            this.lbnotice.node.x = this.lbnotice.node.width
        }
    }
}
