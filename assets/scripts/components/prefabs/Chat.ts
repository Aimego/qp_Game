import gameMgr from "../../gameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Chat extends cc.Component {

    _chat: cc.Node = null
    _selectedIndex: number = 0
    _scrollView: cc.Node = null
    _input: cc.Label = null
    onLoad () {
        this._chat = cc.find('Canvas/chat')
        const head: cc.Node = this._chat.getChildByName('head')
        const body: cc.Node = this._chat.getChildByName('body')
        this._input = head.getChildByName('input').getChildByName('TEXT_LABEL').getComponent(cc.Label)
        this.initButtonHandler(head.getChildByName('send'), 'sendMessage') // 绑定发送按钮
        const togglerContainer: cc.Node = body.getChildByName('selectGroup')
        this._scrollView = body.getChildByName('scrollView')
        const _userful: cc.Node = this._scrollView.getChildByName('userful').getChildByName('content')
        const _emoji: cc.Node = this._scrollView.getChildByName('emoji').getChildByName('content')

        this.initTogglerGroup(togglerContainer) // 初始化chat选项栏目(常用语、表情)

        _userful.children.forEach((child:cc.Node) => { // 常用语绑定事件初始化
            this.initButtonHandler(child, 'initUserfulHandler')        
        })

        _emoji.children.forEach((child:cc.Node) => { // 常用语绑定事件初始化
            this.initButtonHandler(child, 'initEmojiHandler')        
        })
        gameMgr.Instance().CHATING = this
    }

    TouchMenuAnthoer(event: cc.Event.EventTouch) {
        if (!this._chat.getBoundingBoxToWorld().contains(event.getLocation())) {
            this._chat.active = false; // 点击菜单屏幕之外的地方关闭菜单栏
        }
    }

    initButtonHandler(node: cc.Node, callback: string) {
        gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'Chat', callback)
    }

    initUserfulHandler(event: cc.Event.EventTouch) { // 常用语点击触发
        // gameMgr.Instance().AUDIOMGR.playSfx(`sfx/game/useful/${event.target.name}`)
        this._input.string = event.target.getComponent(cc.Label).string
        this.sendMessage(event, event.target.name)
    }

    initEmojiHandler(event: cc.Event.EventTouch) { // 表情点击触发
        gameMgr.Instance().SOCKET.sendMoji(event.target.name)
        this._chat.active = false
    }

    initTogglerGroup(group: cc.Node) {
        group.children.forEach((toggle: cc.Node, index: number) => {
            toggle.getComponent(cc.Toggle).node.on('toggle', () => {
                this.toggleSelect(index+1) // 这个+1是为了跳过scrollView的scrollBar
            })
        })
    }
    
    sendMessage(_:cc.Event.EventTouch, sfx?:string) {
        gameMgr.Instance().SOCKET.sendMessage({msg:this._input.string, sfx})
        this._chat.active = false
    }

    toggleSelect(index: number) {
        for(let i = 1; i < this._scrollView.children.length; i++) { // 这个i为1是为了跳过scrollView的scrollBar
            this._scrollView.children[i].active = false
        }
        this._scrollView.children[index].active = true
    }

    onShow() {
        this._chat.active = true
        this.node.on(cc.Node.EventType.TOUCH_START, this.TouchMenuAnthoer, this);
    }

    onHide() {
        gameMgr.Instance().AUDIOMGR.playSfx('button')
        this._chat.active = false
        this.node.off(cc.Node.EventType.TOUCH_START, this.TouchMenuAnthoer, this)
    }
}
