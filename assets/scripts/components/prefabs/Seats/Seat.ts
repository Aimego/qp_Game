import gameMgr from '../../../gameMgr';
import { RoomMsg, User, MessageInfo, EmojiInfo, TileSchema, CardInfo, BankerInfo, RoundInfo, VoiceInfo } from '../../../interface_ts'
import { loadTexture2d, findLastIndex } from '../../../utils/utils'
import { TypeVerify, operatesModel, CPKinfo, WinInfo, TipsInfo, NanChangeMjUserGame } from '../../../interface_ts/playGames';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Seat extends cc.Component {

    _MjHandAtlas: cc.SpriteAtlas = null // 当前玩家的手牌精灵图集
    _MjSiteAtals: cc.SpriteAtlas = null // 打出牌的精灵图集
    _MjHandPrefab: cc.Prefab = null // 玩家手牌预制体
    _MjSitePrefab: cc.Prefab = null // 玩家打出的手牌预制体
    _MjCpPrefab: cc.Prefab = null // 玩家的吃碰预制体
    _MjKPrefab: cc.Prefab = null // 玩家的杠预制体

    prefixSprite: string = null // 精灵图集下麻将图片前缀

    _handPool: cc.NodePool = null
    _SitePool: cc.NodePool = null
    _CpkPool: cc.NodePool = null

    isMjPlayedHand: Boolean = false
    isMjActiveRunning: Boolean = false
    rankMjHand: Array<TileSchema> = []
    MjSite: Array<TileSchema> = []
    jokers: Array<TileSchema> = []

    _hand: cc.Node = null // 用户手牌
    _cpks: cc.Node = null // 用户吃碰杠
    _sites: cc.Node = null // 用户场地牌
    _eats: cc.Node = null // 用户吃牌
    _prys: cc.Node = null // 用户杠牌
    _tips: cc.Node = null // 提示语(吃、碰、杠、胡、自摸、等待打牌)

    _player: User = null // 用户信息
    _username: cc.Label = null // 姓名
    _avatar: cc.Sprite = null // 头像
    _banker: cc.Node = null // 庄
    _online: cc.Node = null // 是否在线
    _gold: cc.Label = null // 金额
    _ready: cc.Node = null // 准备
    _chatBubble: cc.Node = null // 消息
    _voice: cc.Node = null // 语音
    _emoji: cc.Node = null // 表情
    _money: number = null

    onLoad() {
        this._handPool = new cc.NodePool();
        this._SitePool = new cc.NodePool();
        this._CpkPool = new cc.NodePool();
        gameMgr.Instance().SOCKET.onRoomMessageHandler(this.onMessageHandler.bind(this), this.errHandler) // 监听消息并回显
        gameMgr.Instance().SOCKET.onRoomVoiceHandler(this.onVoiceHandler.bind(this))
        gameMgr.Instance().SOCKET.onRoomEmojiHandler(this.onEmojiHandler.bind(this), this.errHandler) // 监听玩家发送表情
        gameMgr.Instance().SOCKET.onRoomDrawCard(this.onDrawCard.bind(this), this.errHandler) // 监听玩家摸牌
        gameMgr.Instance().SOCKET.onRoomPlayCard(this.omMjSiteHandler.bind(this), this.errHandler) // 监听玩家打出的牌
        gameMgr.Instance().SOCKET.onRoomChowCard(this.onCPKcard.bind(this), this.errHandler) // 监听玩家吃牌
        gameMgr.Instance().SOCKET.onRoomPongCard(this.onCPKcard.bind(this), this.errHandler) // 监听玩家碰牌
        gameMgr.Instance().SOCKET.onRoomKongCard(this.onCPKcard.bind(this), this.errHandler) // 监听玩家杠牌
        gameMgr.Instance().SOCKET.onRoomWinCard(this.WinHandler.bind(this), this.errHandler)

    }

    initUserinfo() {
        const userMsg: cc.Node = this.node.getChildByName('userMsg')
        const mj: cc.Node = this.node.getChildByName('mj')
        this._sites = this.node.getChildByName('mjSite')
        this._tips = this.node.getChildByName('tips')
        this._hand = mj.getChildByName('hand')
        this._cpks = mj.getChildByName('cpks')
        const user: cc.Node = userMsg.getChildByName('user')
        const chat: cc.Node = userMsg.getChildByName('chat')
        this._ready = userMsg.getChildByName('ready')
        const head: cc.Node = user.getChildByName('head')
        this._username = user.getChildByName('name').getChildByName('label').getComponent(cc.Label)
        this._gold = user.getChildByName('gold').getChildByName('number').getComponent(cc.Label)
        this._avatar = head.getChildByName('avatar').getComponent(cc.Sprite)
        this._banker = head.getChildByName('banker')
        this._online = head.getChildByName('online')
        this._chatBubble = chat.getChildByName('msg').getChildByName('chatBubble').getChildByName('label')
        this._voice = chat.getChildByName('voice')
        this._emoji = chat.getChildByName('emoji')
    }

    initMj(handPrefab: cc.Prefab, sitePrefab: cc.Prefab, handAtlas: cc.SpriteAtlas, siteAtlas: cc.SpriteAtlas, prefixSprite: string, MjCpPrefab: cc.Prefab, MjKPrefab: cc.Prefab) {
        this._MjHandPrefab = handPrefab
        this._MjSitePrefab = sitePrefab
        this._MjHandAtlas = handAtlas
        this._MjSiteAtals = siteAtlas
        this.prefixSprite = prefixSprite
        this._MjCpPrefab = MjCpPrefab
        this._MjKPrefab = MjKPrefab
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Seat', callback)
    }


    /**
     * 用户状态刷新
     * 1. 刷新金额
     * 2. 是否离线
     * 3. 是否庄家
     * 4. 是否对话
     * 5. 是否发表情
     * 6. 是否准备
     * 7. 用户手牌
     * 8. 已打出的手牌
     */
    refresh(roomInfo: RoomMsg, player: User) {
        this.initUserinfo()
        this._player = player
        this.money = this._player.gold
        if (!roomInfo.roomStart) { // 房间还未开始时
            this.onReadyHandler(this._player.roomReady) // 在进入房间时回显房间玩家是否已经准备了
        } else {
            this.onBankerHandler(roomInfo.gameType.banker)
        }
        loadTexture2d(this._player.avatar).then((res: cc.SpriteFrame) => { // 更新头像
            this._avatar.spriteFrame = res
        })
        this._username.string = this._player.name
        this._gold.string = this.money
        this._banker.active = this._player._id === roomInfo.gameType.banker
        this._online.active = this._player.roomOnline
    }

    leave(userId: string) {
        if (userId === this._player._id) {
            this.node.active = false
        }
    }

    MjRankHandler(roomHand: Array<TileSchema>) {
        roomHand.sort((a: TileSchema, b: TileSchema) => {
            return a.index - b.index
        })
        return roomHand
    }

    onMjHandHandler(dealInfo: NanChangeMjUserGame) {
        this.createHandMj(dealInfo.roomHand) // 初始化手牌对象池
        this.createSiteMj() // 初始化场地对象池
        this.rankMjHand = this.MjRankHandler(dealInfo.roomHand)
        this.MjSite = dealInfo.roomSite
        this.rankMjHand.forEach((value: TileSchema) => {
            this.getMjHandPool(this._hand, value)
        })
    }

    getMjHandNameNumber(name: string): number {
        const mjIndex = name.lastIndexOf('_') + 1
        return +name.slice(mjIndex)
    }

    getMjHandInsertIndex(index: number): number {
        return this.rankMjHand.findIndex((val: TileSchema) => {
            return val.index >= index
        })
    }

    omMjSiteHandler(playcard: CardInfo) {
        if (playcard._id === this._player._id) {
            const currentIndex = this.rankMjHand.findIndex((val) => // 获取打出牌的手牌下标
                val.index === playcard.card.index
            )
            this.rankMjHand.splice(currentIndex, 1) // 删除本地手牌
            this.putHandMjRecycle(this._handPool, this._hand.children[currentIndex])
            const sfxAduioPath = `${playcard.card.type}_${playcard.card.number}`
            this._tips.active = false
            this.getMjSitePool(this._sites, playcard.card)
            this.MjSite.push(playcard.card)
            gameMgr.Instance().AUDIOMGR.playSfx(`game/mj/${sfxAduioPath}`)
        }
    }


    createHandMj(roomHand: Array<TileSchema>) {
        for (let i = 0; i < roomHand.length; i++) {
            const handNode = cc.instantiate(this._MjHandPrefab) // 加载不同座位的手牌预制体
            this._handPool.put(handNode)
        }
    }

    createSiteMj() { // 每个人的场地最大可放置的麻将为(4 * 27)
        for (let i = 0; i < 27; i++) {
            const siteNode = cc.instantiate(this._MjSitePrefab) // 加载用户场地预制体
            this._SitePool.put(siteNode)
        }
    }

    getMjHandPool(parentNode: cc.Node, tile: TileSchema) {
        let mj = null;
        if (this._handPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            mj = this._handPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            mj = cc.instantiate(this._MjHandPrefab);
        }
        if (this._player._id === gameMgr.Instance().USERINFO._id) { // 如果是本用户则更改手牌预制体spriteframe
            const spriteFrame = tile.type != 'color'
                ? `M_${tile.type}_${tile.number}`
                : `M_${tile.number}`
            mj.getComponent(cc.Sprite).spriteFrame = this._MjHandAtlas.getSpriteFrame(spriteFrame)
            mj.name = `${tile.type}_${tile.number}_${tile.index}`
            mj.zIndex = tile.index
            if (this.jokers.some(val => val.index === tile.index)) {
                mj.color = new cc.Color().fromHEX('#FEDE36');
            }
            this.initButtonHandler(mj, 'onMjHandClick')
        }
        mj.parent = parentNode; // 将生成的节点加入节点树
    }

    getMjSitePool(parentNode: cc.Node, tile: TileSchema) {
        let mj = null;
        if (this._SitePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            mj = this._SitePool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            mj = cc.instantiate(this._MjSitePrefab);
        }
        const spriteFrame = tile.type != 'color'
            ? `${this.prefixSprite}_${tile.type}_${tile.number}`
            : `${this.prefixSprite}_${tile.number}`
        mj.getComponent(cc.Sprite).spriteFrame = this._MjSiteAtals.getSpriteFrame(spriteFrame)
        mj.name = `${tile.type}_${tile.number}_${tile.index}`
        if (this.jokers.some(val => val.index === tile.index)) {
            mj.color = new cc.Color().fromHEX('#FEDE36');
        }
        mj.parent = parentNode; // 将生成的节点加入节点树
    }

    putHandMjRecycle(pool: cc.NodePool, node: cc.Node) {
        pool.put(node)
    }

    getCpkMj(CPKprefab: cc.Prefab, type: operatesModel, tileArr: Array<TileSchema>) {
        console.log('getCpkMj', tileArr)
        let cpk = null;
        if (this._CpkPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            cpk = this._CpkPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            cpk = cc.instantiate(CPKprefab);
        }
        tileArr.forEach((tile: TileSchema, index: number) => {
            const spriteFrame = tile.type != 'color'
                ? `${this.prefixSprite}_${tile.type}_${tile.number}`
                : `${this.prefixSprite}_${tile.number}`
            cpk.children[index].getComponent(cc.Sprite).spriteFrame = this._MjSiteAtals.getSpriteFrame(spriteFrame)
            cpk.children[index].name = `${tile.type}_${tile.number}_${tile.index}`
            cpk.children[index].zIndex = tile.index
        })
        cpk.name = type
        cpk.parent = this._cpks
    }

    onMjHandClick(event: cc.Event.EventTouch) {
        const mj: cc.Node = event.target
        const mjHeight = mj.getContentSize().height
        if (mj.position.y >= Math.floor(mjHeight / 2) && this.isMjPlayedHand) {
            this.isMjPlayedHand = false
            const [type, number, index] = mj.name.split('_')
            gameMgr.Instance().SOCKET.sendPlayCard({
                roomId: gameMgr.Instance().ROOMINFO.roomId,
                card: {
                    type,
                    number,
                    index: +index
                }
            })
        } else {
            if (!this.isMjActiveRunning) {
                this.isMjActiveRunning = true
                this._hand.children.forEach((children: cc.Node) => {
                    const resetPosition = cc.v2(children.position.x, 0)
                    const resetMoveAction = cc.moveTo(0.1, resetPosition)
                    children.runAction(resetMoveAction)
                })
                const callback = cc.callFunc(() => {
                    this.isMjActiveRunning = false
                })
                const raisePosition = cc.v2(mj.position.x, mj.parent.position.y + (mjHeight / 2))
                const moveAction = cc.moveTo(0.1, raisePosition)
                const sequence = cc.sequence(moveAction, callback)
                mj.runAction(sequence)
            }
        }
    }

    onDrawCard(drawInfo: CardInfo) { // 广播摸牌人的id和牌类
        if (drawInfo._id === this._player._id) { // 摸牌人与座位号相等将牌添加到用户手牌中
            this.rankMjHand.push(drawInfo.card)
            this.rankMjHand = this.MjRankHandler(this.rankMjHand)
            this.getMjHandPool(this._hand, drawInfo.card)
        }
    }

    onCPKcard(chowInfo: CPKinfo) {
        if (chowInfo._id === this._player._id) {
            chowInfo.handArr.forEach((tile: TileSchema) => {
                const handIndex = this.rankMjHand.findIndex((val: TileSchema) => val.index === tile.index)
                this.rankMjHand.splice(handIndex, 1)
                this.putHandMjRecycle(this._handPool, this._hand.children[handIndex])
            })
            switch (chowInfo.operateType) {
                case operatesModel.CHOW:
                    this.ChowHandler([...chowInfo.handArr, chowInfo.card])
                    break;
                case operatesModel.PONG:
                    this.PongHandler([...chowInfo.handArr, chowInfo.card])
                    break;
                case operatesModel.KONG:
                    if (chowInfo.type === TypeVerify.SELF) {
                        this.KongHandler(chowInfo.handArr)
                    } else {
                        this.KongHandler([...chowInfo.handArr, chowInfo.card])
                    }
                    break;
                // default:
                //     if (chowInfo._id === this._player._id && chowInfo.type === TypeVerify.OTHER) {
                //         this.WinHandler([...this.rankMjHand, chowInfo.card])
                //     } else {
                //         this.WinHandler(this.rankMjHand)
                //     }
            }
        }
        if (chowInfo.owner === this._player._id && chowInfo.type === TypeVerify.OTHER) {
            const siteIndex = findLastIndex(this.MjSite, ((tile: TileSchema) => tile.index === chowInfo.card.index))
            this.MjSite.splice(siteIndex, 1)
            this.putHandMjRecycle(this._SitePool, this._sites.children[siteIndex])
        }
    }

    ChowHandler(mjArr: Array<TileSchema>) {
        this.getCpkMj(this._MjCpPrefab, operatesModel.CHOW, mjArr)
        gameMgr.Instance().AUDIOMGR.playSfx(`game/mj/chow`)
        this.onTipsHandler(TipsInfo.CHOW)
    }


    PongHandler(mjArr: Array<TileSchema>) {
        this.getCpkMj(this._MjCpPrefab, operatesModel.PONG, mjArr)
        gameMgr.Instance().AUDIOMGR.playSfx(`game/mj/pong`)
        this.onTipsHandler(TipsInfo.PONG)
    }

    KongHandler(mjArr: Array<TileSchema>) {
        this.getCpkMj(this._MjKPrefab, operatesModel.KONG, mjArr)
        gameMgr.Instance().AUDIOMGR.playSfx(`game/mj/kong`)
        this.onTipsHandler(TipsInfo.KONG)
    }

    WinHandler(win: WinInfo) {
        this._handPool.clear()
        this._hand.destroyAllChildren();
        this.rankMjHand.forEach((tile: TileSchema) => {
            this.getMjSitePool(this._hand, tile)
        })
        if (win._id === this._player._id) {
            gameMgr.Instance().AUDIOMGR.playSfx(`game/mj/hu`)
            if (win.type === TypeVerify.SELF) {
                this.onTipsHandler(TipsInfo.WIN)
            } else {
                // const siteIndex = findLastIndex(this.MjSite, ((tile: TileSchema) => tile.index === win.card.index))
                // this.MjSite.splice(siteIndex, 1)
                // this.putHandMjRecycle(this._SitePool, this._sites.children[siteIndex])
                this.onTipsHandler(TipsInfo.HU)
            }
        }
    }


    onRoundPlayCard(round: RoundInfo) {
        if (round.roundId === gameMgr.Instance().USERINFO._id) {
            console.log('你要出牌了')
            this.isMjPlayedHand = true // 是否可以出牌
            if (this.rankMjHand.length < 14 && round.draw) { // 牌数小于14张牌，并且不是因为(吃、碰、杠)而轮到你就可以摸牌
                gameMgr.Instance().SOCKET.sendDrawCard(gameMgr.Instance().ROOMINFO.roomId)
            }
        }
        this.onTipsHandler(TipsInfo.CHOICE)
    }


    onBankerHandler(info: BankerInfo) {
        this.jokers = info.jokers
        if (info.banker === this._player._id) {
            this._banker.active = true
        } else {
            this._banker.active = false
        }
    }

    onReadyHandler(ready: boolean) {
        this._ready.active = ready
    }

    onCountDownTimeEnd() {
        const handEndIndex = this.rankMjHand.length - 1
        if (this.isMjPlayedHand) {
            this.isMjPlayedHand = false
            gameMgr.Instance().SOCKET.sendPlayCard({ roomId: gameMgr.Instance().ROOMINFO.roomId, card: this.rankMjHand[handEndIndex] })
        }
    }

    onMessageHandler(msgInfo: MessageInfo) {
        if (msgInfo._id === this._player._id) { // 只有发送的_id与本人_id一致则回显消息节点
            if (msgInfo.sfx) { // 如果有sfx则播放
                gameMgr.Instance().AUDIOMGR.playSfx(`game/useful/${msgInfo.sfx}`)
            }
            this._chatBubble.getComponent(cc.Label).string = msgInfo.msg
            this._chatBubble.parent.active = true
            this.scheduleOnce(() => {
                this._chatBubble.parent.active = false
            }, 2)
        }
    }

    onVoiceHandler(msgInfo: VoiceInfo) {
        if (msgInfo._id === this._player._id) { // 只有发送的_id与本人_id一致则回显消息节点
            console.log(msgInfo.voice)
            this._voice.active = true
            const audio = new Audio(msgInfo.voice);
            audio.addEventListener('ended', () => {
                console.log('音频播放完成')
                URL.revokeObjectURL(msgInfo.voice)
                this._voice.active = false
            })
            audio.play();
            // this._chatBubble.getComponent(cc.Label).string = msgInfo.msg
            // this._chatBubble.parent.active = true
            // this.scheduleOnce(() => {
            //     this._chatBubble.parent.active = false
            // }, 2)
        }
    }

    onEmojiHandler(emojiInfo: EmojiInfo) {
        if (emojiInfo._id === this._player._id) { // 只有发送的_id与本人_id一致则回显消息节点
            const animation: cc.Animation = this._emoji.getComponent(cc.Animation)
            animation.play(emojiInfo.emoji)
            this._emoji.active = true
            this.scheduleOnce(() => {
                animation.pause(emojiInfo.emoji)
                this._emoji.active = false
            }, 2)
        }
    }

    onTipsHandler(tips: TipsInfo) {
        const animation: cc.Animation = this._tips.getComponent(cc.Animation)
        animation.play(tips)
        this._tips.active = true
        animation.on('finished', () => {
            this._tips.active = false
        });
    }

    errHandler(err?: string) {
        gameMgr.Instance().ALERT.show('错误', err)
    }

    set money(value: number) {
        this._money = value
        if (this._money <= 0) {
            this._money = 0
        }
    }

    get money(): string {
        if (this._money >= 100000) {
            return `${this._money / 10000}万`
        }
        return `${this._money}`
    }

    // update (dt) {}
}
