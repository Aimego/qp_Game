import gameMgr from "../gameMgr";
import { loadRes } from "../utils/utils";
import { RoomMsg, User, UserReadyInfo, DicesInfo, TileSchema, BankerInfo, RoundInfo, VerifyInfo } from "../interface_ts";
import { operatesModel, TypeVerify, Verify, NanChangeMjUserGame } from "../interface_ts/playGames";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Room extends cc.Component {

    @property(cc.Node)
    uiRoot: cc.Node = null

    @property(cc.Prefab)
    mjHandPrefab: Array<cc.Prefab> = []

    @property(cc.Prefab)
    mjSitePrefab: Array<cc.Prefab> = []

    @property(cc.Prefab)
    mjCp_Prefab: Array<cc.Prefab> = []

    @property(cc.Prefab)
    mjK_Prefab: Array<cc.Prefab> = []

    user: User = gameMgr.Instance().USERINFO
    usersReady: Array<User> = []
    mjAtlas: Array<cc.SpriteAtlas> = []
    verifyMsg: Verify = null

    _jokers_pool: cc.NodePool = null

    _remainMjNumber: cc.Node = null // 剩余麻将数量
    _jokers: cc.Node = null // 精
    _round: cc.Node = null // 轮盘指向
    _countdown: cc.Node = null // 轮盘倒计时
    _operates: cc.Node = null // 吃碰杠胡提示栏
    _seats: cc.Node = null
    _roomConfig: cc.Node = null
    _readyConfig: cc.Node = null
    _ready: cc.Node = null
    _start: cc.Node = null

    // LIFE-CYCLE CALLBACKS:
    async onLoad() {
        gameMgr.Instance().AUDIOMGR.playBgm('bgFight')
        const center = this.uiRoot.getChildByName('center')
        const roulette = center.getChildByName('roulette')
        this._round = roulette.getChildByName('round')
        this._countdown = roulette.getChildByName('countdown')
        this._seats = this.uiRoot.getChildByName('seats')
        this._operates = this.uiRoot.getChildByName('operates')

        this._jokers = center.getChildByName("jokers")
        this._remainMjNumber = center.getChildByName('mjNumber')
        this._jokers_pool = new cc.NodePool()
        this.initRoomConfig()
        this.initSetting()
        this.initReadyConfig()
        this.mjAtlas = await this.initMjAtlasArray('textures/atlas/gameIcon/MJ', ['my', 'bottom', 'right', 'bottom', 'left'])
        this.SeatsRefreshHandler(gameMgr.Instance().ROOMINFO)
        gameMgr.Instance().SOCKET.onRoomJoinHandler(this.SeatsRefreshHandler.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomLeaveHandler(this.SeatsLeaveHandler.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomUserReady(this.SeatsReadyGameHandler.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomStartGame(this.GameStartHandler.bind(this), this.errHandler)
        // gameMgr.Instance().SOCKET.onRoomBanker(this.getBanker.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomRemainCard(this.getRemainCard.bind(this))
        // gameMgr.Instance().SOCKET.onRoomDice(this.getDices.bind(this))
        gameMgr.Instance().SOCKET.onRoomDealCard(this.getDealCard.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomRound(this.getRound.bind(this), this.errHandler)
        gameMgr.Instance().SOCKET.onRoomCountDownTime(this.onCountDownTime.bind(this))
        gameMgr.Instance().SOCKET.onRoomCountDownTimeEnd(this.onCoundDownTimeEnd.bind(this))
        // gameMgr.Instance().SOCKET.onRoomClientVerify()
        gameMgr.Instance().SOCKET.onRoomPlayCardVerify(this.broadcastVerify.bind(this))
        gameMgr.Instance().SOCKET.onRoomDrawCardVerify(this.getOperatesBtn.bind(this))
        gameMgr.Instance().SOCKET.onRoomGameOver(gameMgr.Instance().ROOMINFO.roomId)
        gameMgr.Instance().SOCKET.onRoomGameResult(this.gameResult.bind(this), this.errHandler)
        // gameMgr.Instance().SOCKET.onRoomDismissHandler(this.initSeatsRefresh.bind(this), this.errHandler)
    }

    SeatRankArr(players: Array<User>, userId: string): Array<User> {
        const selfIndex = players.findIndex(val => val._id === userId)
        const seatsRank = players.slice(selfIndex).concat(players.slice(0, selfIndex))
        return seatsRank
    }

    // 初始化加入座位信息
    SeatsRefreshHandler(room: RoomMsg) {
        this.usersReady = this.SeatRankArr(room.players, this.user._id)
        for (let i = 0; i < this.usersReady.length; i++) {
            this._seats.getChildByName(`seat${i}`).getComponent('Seat').refresh(room, this.usersReady[i])
            this._seats.getChildByName(`seat${i}`).active = true
        }
    }


    createJokerMj(jokers: Array<TileSchema>) {
        for (let i = 0; i < jokers.length; i++) {
            const JokersNode = cc.instantiate(this.mjSitePrefab[0]) // [0]是本视角场地的固定预制体
            this._jokers_pool.put(JokersNode)
            this.getJokerMj(jokers[i])
        }
    }

    getJokerMj(tile: TileSchema) {
        let mj = null;
        if (this._jokers_pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            mj = this._jokers_pool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            mj = cc.instantiate(this.mjSitePrefab[0]);
        }
        const spriteFrame = tile.type != 'color' ? `B_${tile.type}_${tile.number}` : `B_${tile.number}`
        // console.log(spriteFrame)
        mj.getComponent(cc.Sprite).spriteFrame = this.mjAtlas[1].getSpriteFrame(spriteFrame) // [1]是本视角的固定的麻将精灵图集
        mj.name = spriteFrame
        mj.parent = this._jokers; // 将生成的节点加入节点树
    }

    SeatsLeaveHandler(leaveId: string) { // 离开房间后监听
        const flagIndex = this.usersReady.findIndex((val: User) => val._id === leaveId)
        this.usersReady.splice(flagIndex, 1)
        this._seats.getChildByName(`seat${flagIndex}`).getComponent('Seat').leave(leaveId)
        this.startOrReady() // 有玩家离开则刷新开始or准备按钮
        this.startGameBtn() // 检测房主是否可以开始游戏
    }

    SeatsReadyGameHandler(readyInfo: UserReadyInfo) { // 玩家准备或者取消准备触发调用
        const flagIndex = this.usersReady.findIndex((val: User) => val._id === readyInfo._id)
        this.usersReady[flagIndex].roomReady = readyInfo.ready
        this._seats.getChildByName(`seat${flagIndex}`).getComponent('Seat').onReadyHandler(readyInfo.ready)
        this.startGameBtn()
    }

    GameStartHandler(info: BankerInfo) {
        this._jokers.active = true // 将赖子父节点回显
        this._remainMjNumber.active = true // 将剩余麻将节点回显
        this._readyConfig.active = false // 将准备or开始按钮隐藏
        const prefixSpriteArr = ['B', 'R', 'B', 'L'] // 场地精灵图集下的图片前缀
        this.createJokerMj(info.jokers)
        for (let i = 0; i < this.usersReady.length; i++) {
            const prefixSpriteWord = prefixSpriteArr[i]
            const mjCp = prefixSpriteWord === 'B' ? this.mjCp_Prefab[0] : this.mjCp_Prefab[1]
            const mjK = prefixSpriteWord === 'B' ? this.mjK_Prefab[0] : this.mjCp_Prefab[1]
            if (this._seats.getChildByName(`seat${i}`).active) {
                this._seats.getChildByName(`seat${i}`).getComponent('Seat').onReadyHandler(false) // 将座位的准备按钮全部隐藏掉
                this._seats.getChildByName(`seat${i}`).getComponent('Seat').onBankerHandler(info)
                this._seats.getChildByName(`seat${i}`).getComponent('Seat')
                    .initMj(    // [i+1]的都是场地精灵图集，而[0]是手牌精灵图集
                        this.mjHandPrefab[i],
                        this.mjSitePrefab[i],
                        this.mjAtlas[0],
                        this.mjAtlas[i + 1],
                        prefixSpriteWord,
                        mjCp,
                        mjK
                    )
            }
        }
        gameMgr.Instance().SOCKET.sendDealCard(gameMgr.Instance().ROOMINFO.roomId) // 获取每个玩家的手牌
        // gameMgr.Instance().SOCKET.sendBanker(gameMgr.Instance().ROOMINFO.roomId) // 向服务端获取庄家和骰子点数
    }

    // getBanker(banker: BankerInfo) { // 将房主信息广播给所有座位
    //     // const bankerIndex = this.usersReady.findIndex((val: User) => val._id === banker._id)
    //     // this._seats.getChildByName(`seat${bankerIndex}`).getComponent('Seat').onBankerHandler(banker)
    //     for (let i = 0; i < this.usersReady.length; i++) {
    //         this._seats.getChildByName(`seat${i}`).getComponent('Seat').onBankerHandler(banker)
    //     }

    //     this.createJokerMj(banker.jokers)
    //     // gameMgr.Instance().SOCKET.sendDealCard(gameMgr.Instance().ROOMINFO.roomId) // 房主去触发获取每个玩家的手牌
    // }

    getRemainCard(number: number) { // 监听剩余牌数
        this._remainMjNumber.getChildByName('label').getComponent(cc.Label).string = number.toString()
    }

    broadcastVerify(ArrInfo: Array<VerifyInfo>) {
        const VerifyInfo = ArrInfo.find(val => val._id === this.user._id)
        console.log(ArrInfo, this.user._id)
        if(VerifyInfo) {
            this.getOperatesBtn(VerifyInfo)
        }
    }

    getOperatesBtn(verify: VerifyInfo) {
        console.log('verify',verify)
        this._operates.active = true
        this.verifyMsg = verify.verifyInfo
        this._operates.children.forEach((children: cc.Node) => { children.active = false })
        if (verify.hints.length != 0) {
            this.initButtonHandler(this._operates.getChildByName('skip'), 'skipHandler')
            this._operates.getChildByName('skip').active = true
        }
        verify.hints.forEach(val => {
            switch (val) {
                case operatesModel.CHOW:
                    const chow = this._operates.getChildByName('chow')
                    chow.active = true
                    this.initButtonHandler(chow, 'chowHandler')
                    break;
                case operatesModel.PONG:
                    const pong = this._operates.getChildByName('pong')
                    pong.active = true
                    this.initButtonHandler(pong, 'pongHandler')
                    break;
                case operatesModel.KONG:
                    const kong = this._operates.getChildByName('kong')
                    kong.active = true
                    this.initButtonHandler(kong, 'kongHandler')
                    break;
                case operatesModel.WIN:
                    const win = this._operates.getChildByName('win')
                    win.active = true
                    this.initButtonHandler(win, 'winHandler')
                    break;
            }
        })

    }

    chowHandler() {
        console.log('chow', this.verifyMsg)
        gameMgr.Instance().SOCKET.sendChowCard(this.verifyMsg)
        this._operates.active = false
    }

    pongHandler() {
        console.log('pong', this.verifyMsg)
        gameMgr.Instance().SOCKET.sendPongCard(this.verifyMsg)
        this._operates.active = false
    }

    kongHandler() {
        console.log('kong', this.verifyMsg)
        gameMgr.Instance().SOCKET.sendKongCard(this.verifyMsg)
        this._operates.active = false
    }

    winHandler() {
        console.log('win', this.verifyMsg)
        gameMgr.Instance().SOCKET.sendWinCard(this.verifyMsg)
        this._operates.active = false
    }

    skipHandler() {
        console.log('skip', this.verifyMsg)
        gameMgr.Instance().SOCKET.sendSkipCard(this.verifyMsg.roomId)
        this._operates.active = false
    }


    // getDices(dices: DicesInfo) {
    //     // console.log('骰子点数为', dices.dice1, dices.dice2)
    // }

    onCountDownTime(number: number) {
        this._countdown.getChildByName('number').getComponent(cc.Label).string = number.toString()
    }

    onCoundDownTimeEnd(userId: string) {
        if (userId === this.user._id) {
            const roundIndex = this.usersReady.findIndex((val: User) => val._id === userId)
            this._seats.getChildByName(`seat${roundIndex}`).getComponent('Seat').onCountDownTimeEnd()
        }
    }

    getDealCard(dealInfo: NanChangeMjUserGame) {
        const SeatIndex = this.usersReady.findIndex((val: User) => val._id === dealInfo.user)
        this._seats.getChildByName(`seat${SeatIndex}`).getComponent('Seat').onMjHandHandler(dealInfo)
    }

    getRound(round: RoundInfo) {
        this._operates.active = false
        const roundIndex = this.usersReady.findIndex((val: User) => val._id === round.roundId)
        console.log('getRound' + roundIndex)
        this._round.children.forEach((children: cc.Node) => children.getComponent(cc.Toggle).isChecked = false)
        this._round.children[roundIndex].getComponent(cc.Toggle).isChecked = true
        this._seats.getChildByName(`seat${roundIndex}`).getComponent('Seat').onRoundPlayCard(round)
    }

    errHandler(err: string) {
        gameMgr.Instance().ALERT.show('错误', err)
    }

    initRoomConfig() {
        this._roomConfig = this.uiRoot.getChildByName('roomConfig')
        const roomNumber: cc.Label = this._roomConfig.getChildByName('roomNumber')
            .getChildByName('number')
            .getComponent(cc.Label)
        roomNumber.string = gameMgr.Instance().ROOMINFO.roomId
        // this.initGames() // 初始化局数
    }

    async initMjAtlasArray(path: string, arr: Array<string>) {
        const arrAtlas = arr.map(async (val: string) => {
            return loadRes(`${path}/${val}/Z_${val}`, cc.SpriteAtlas)
        })
        return Promise.all(arrAtlas);
    }

    initSetting() {
        const setting: cc.Node = this.uiRoot.getChildByName('menu').getChildByName('setting')
        const chat: cc.Node = this.uiRoot.getChildByName('menu').getChildByName('chat')
        const voice: cc.Node = this.uiRoot.getChildByName('voice')
        this.initButtonHandler(setting, 'onBtnMenuClick')
        this.initButtonHandler(chat, 'onBtnMenuClick')
        this.initButtonHandler(voice, 'onBtnMenuClick')
    }

    initReadyConfig() {
        this._readyConfig = this.uiRoot.getChildByName('readyConfig')
        this._ready = this._readyConfig.getChildByName('btns').getChildByName('btn_ready')
        this._start = this._readyConfig.getChildByName('btns').getChildByName('btn_start')
        const invite: cc.Node = this._readyConfig.getChildByName('invite')
        this.initTogglerHandler(this._ready, (event: any) => {
            const isChecked: boolean = event.node.getComponent(cc.Toggle).isChecked
            this.gameReady(!isChecked)
        })
        this.initButtonHandler(this._start, 'gameStart')
        this.initButtonHandler(invite, 'onBtnMenuClick')

        if (!gameMgr.Instance().isWeChatPLATFORM) { // 不是微信平台则隐藏微信邀请
            invite.active = false
        }

        this.startOrReady()
        this.startGameBtn()

        if (gameMgr.Instance().ROOMINFO.roomStart) { // 房间已经开始游戏了
            this._readyConfig.active = false
        } else {
            this._readyConfig.active = true
        }
    }

    startOrReady() {
        if (gameMgr.Instance().ROOMINFO.createUser === this.user._id) { // 如果我是房主则准备变成开始按钮
            this._start.active = true
            this._ready.active = false
        } else {
            this._ready.active = true
            this._start.active = false
        }
    }

    startGameBtn() { // 开始按钮是否可以被点击
        this._start.getComponent(cc.Button).interactable = true
        // this.usersReady.length == gameMgr.Instance().ROOMINFO.gameType.maxUser &&
        // !this.usersReady.some((val: User) => {
        //     return !(val.roomReady || val._id === gameMgr.Instance().ROOMINFO.createUser)
        // })
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Room', callback)
    }

    initTogglerHandler(node: cc.Node, callback: Function) {
        node.on('toggle', (event: any) => {
            callback(event)
        })
    }

    onBtnMenuClick(event: cc.Event.EventTouch) {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        switch (event.target.name) {
            case 'setting': gameMgr.Instance().SETTING_ROOM.onShow();
                break;
            case 'chat': gameMgr.Instance().CHATING.onShow();
                break;
            case 'voice': gameMgr.Instance().VOICE.onShow();
                break;
            case 'invite': console.log('invite微信邀请');
                break;
        }
    }

    initGames() { // 游戏局数
        const games: cc.Label = this._roomConfig.getChildByName('games')
            .getChildByName('number')
            .getComponent(cc.Label)
        games.string = `${gameMgr.Instance().ROOMINFO.currentGames}/${gameMgr.Instance().ROOMINFO.gameType.maxGames}`
    }

    gameReady(flag: boolean) { // 游戏准备
        console.log('游戏准备', flag)
        gameMgr.Instance().SOCKET.sendReady({ roomId: gameMgr.Instance().ROOMINFO.roomId, ready: flag })
    }

    gameStart() { // 游戏开始
        console.log('游戏开始')
        gameMgr.Instance().SOCKET.sendStart(gameMgr.Instance().ROOMINFO.roomId)
    }

    gameResult(data: Array<NanChangeMjUserGame>) {
        console.log('游戏结束', data)
        gameMgr.Instance().GAMERESULT.onResult(data)
    }

    // update (dt) {}
}
