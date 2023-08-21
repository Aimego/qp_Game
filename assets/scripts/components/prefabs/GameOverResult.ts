import gameMgr from "../../gameMgr";
import { loadTexture2d } from "../../utils/utils";
import { NanChangeMjUserGame, TypeVerify, record, HuTypesTranslate } from '../../interface_ts/playGames'
import { User } from "../../interface_ts";
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOverResult extends cc.Component {

    @property(cc.Prefab)
    scoreItem: cc.Prefab = null

    RATE: number = 4000

    _gameOverResult: cc.Node = null
    _content: cc.Node = null
    _title: cc.Node = null
    _avatar: cc.Sprite = null
    _userName: cc.Label = null
    _userId: cc.Label = null
    _score: cc.Label = null
    _money: number = null

    // onLoad() {
        
    // }

    onLoad() {
        this._gameOverResult = cc.find('Canvas/gameResult')
        gameMgr.Instance().GAMERESULT = this
        this._title = this._gameOverResult.getChildByName('title')
        this._content = this._gameOverResult.getChildByName('content') 
        const _user: cc.Node = this._content.getChildByName('top').getChildByName('user')
        this._avatar = _user.getChildByName('avatar').getChildByName('avatar').getComponent(cc.Sprite)
        this._userName = _user.getChildByName('info').getChildByName('name').getComponent(cc.Label)
        this._userId = _user.getChildByName('info').getChildByName('ID').getChildByName('number').getComponent(cc.Label)
        this._score = this._content.getChildByName('top').getChildByName('score').getComponent(cc.Label)
        this.initButtonHandler(this._gameOverResult.getChildByName('back'), 'onHide')
    }

    async onResult(result:Array<NanChangeMjUserGame>) {
        const USERINFO = gameMgr.Instance().USERINFO
        result.map(async (userInfo: NanChangeMjUserGame, index: number) => {
            const user = userInfo.user as User
            if(user._id === USERINFO._id) {
                this._userName.string = user.name
                this._userId.string = user._id
                this._score.string = this.moneyUnit(+userInfo.value * this.RATE)
                this._avatar.spriteFrame = await loadTexture2d(user.avatar)
                this.initRecord(userInfo.record)
            } else {
                await this.initUser(this._content.getChildByName('bottom').children[index], userInfo)
            }
        })
        this.onShow()
    }

    async initUser(userNode: cc.Node, userInfo: NanChangeMjUserGame) {
        const user = userInfo.user as User
        const avatar = userNode.getChildByName('avatar').getChildByName('avatar').getComponent(cc.Sprite)
        const userName = userNode.getChildByName('info').getChildByName('name').getComponent(cc.Label)
        const score = userNode.getChildByName('info').getChildByName('score').getComponent(cc.Label)
        avatar.spriteFrame = await loadTexture2d(user.avatar)
        userName.string = user.name
        score.string = this.moneyUnit(+userInfo.value * this.RATE)
        userNode.active = true
    }

    initRecord(recordInfo: Array<record>) {
        // const title = this.scoreItem.getChildByName('type').getChildByName('title')
        recordInfo.map((val: record) => {
            const item = cc.instantiate(this.scoreItem)
            const title = item.getChildByName('title').getComponent(cc.Label)
            const multiple = item.getChildByName('multiple').getComponent(cc.Label)
            const value = item.getChildByName('value').getComponent(cc.Label)
            if(val.value > 0) {
                title.string = `${HuTypesTranslate[val.win]}`
            } else {
                title.string = `被${HuTypesTranslate[val.win]}`
            }
            multiple.string = val.value.toString()
            value.string = this.moneyUnit(+val.value * this.RATE)
            item.parent = this._content.getChildByName('middle').getChildByName('view').getChildByName('content')
        })
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'GameOverResult', callback)
    }

    moneyUnit(money:number): string {
        if (money >= 10000 || money <= 10000) {
            return `${money / 10000}万`
        }
        return `${money}`
    }

    onShow() {
        this._gameOverResult.active = true
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._gameOverResult.active = false
    }

    // update (dt) {}
}
