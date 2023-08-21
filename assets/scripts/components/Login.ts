import gameMgr from "../gameMgr";
import { User, WxOpenInfo } from '../interface_ts/index'
import { getUser, setUser } from "../utils/auth";
import { CryptoEncodeMD5, randomName } from '../utils/utils'
import { api_register, api_login, api_getWxOpenId } from '../api/gameStart_Api'
import audioMgr from "../audioMgr";
import socketNet from "../socket/io";
const { ccclass, property } = cc._decorator;
@ccclass
export default class Login extends cc.Component {

    @property(cc.Node)
    operator: cc.Node = null

    @property(cc.Node)
    agreement_suc: cc.Node = null

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        const visitor = this.operator.getChildByName('visitor')
        const weixin = this.operator.getChildByName('weixin')
        // cc.sys.isNative是判断是否为原生平台的方法，cc.sys.os是获取当前操作系统的方法
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            visitor.active = false
            gameMgr.Instance().isWeChatPLATFORM = true
        } else {
            weixin.active = false
            gameMgr.Instance().isWeChatPLATFORM = false
        }

        this.initMgr()
        gameMgr.Instance().UTILS.addClickEvent(visitor, this.node, 'Login', 'visitorLogin')
        gameMgr.Instance().UTILS.addClickEvent(weixin, this.node, 'Login', 'weixinLogin')
    }

    initMgr() {
        gameMgr.Instance().AUDIOMGR = new audioMgr()
        gameMgr.Instance().AUDIOMGR.playBgm('bgMain')
        // gameMgr.Instance().UTILS = new Utils()
        gameMgr.Instance().SOCKET = new socketNet()
    }

    agreenMent() {
        this.agreement_suc.active = !this.agreement_suc.active
    }

    Login(sign: string, name: string): Promise<number> {
        return new Promise((resolve) => {
            gameMgr.Instance().WATING.show('正在登陆跳转中~')
            api_login(sign, name).then((res: any) => {
                gameMgr.Instance().USERINFO = res.userinfo
                gameMgr.Instance().TOKEN = res.token
                setUser(res.userinfo)
                cc.director.loadScene('hall')
                resolve(200)
            }).catch(async (err) => {
                console.log('login err', err)
                resolve(err.code)
                // gameMgr.Instance().WATING.show('登陆失败~')
            }).finally(() => {
                gameMgr.Instance().WATING.hide()
            })
        })
    }

    registerUser(sign: string, name: string, avatar?: string) {
        gameMgr.Instance().WATING.show('正在为你重新创建账号') // 弹出loading
        api_register(sign, name, avatar).then((res: User) => {
            const { sign, name } = res
            this.Login(sign, name)
        }).catch(() => {
            gameMgr.Instance().WATING.show('创建账号失败~')
        }).finally(() => {
            gameMgr.Instance().WATING.hide()
        })
    }

    visitorLogin() {
        if (this.agreement_suc.active === true) { // 判断是否勾选了协议
            const User = getUser()
            if (User === null) {
                const sign = (+new Date()).toString()
                const name = randomName()
                this.registerUser(sign, name)
            } else {
                this.Login(User.sign, User.name).then(code => {
                    if (code != 200) {
                        this.registerUser(User.sign, User.name)
                    }
                })
            }
        } else {
            gameMgr.Instance().ALERT.show('错误', '请先勾选用户协议!')
        }
    }

    weixinLogin() {
        if (this.agreement_suc.active === true) { // 判断是否勾选了协议
            const wx = gameMgr.Instance().Wx;//避开ts语法检测
            const self = this
            wx.getSetting(
                {
                    success(res) {
                        wx.login({ 
                            success(loginRes) { 
                                if (loginRes.code) { // 获取微信code返回给后端
                                    api_getWxOpenId(loginRes.code).then((data: WxOpenInfo) => { // 通过微信code获取用户的唯一值openId
                                        const openInfo = data
                                        //如果用户已经授权
                                        if (res.authSetting["scope.userInfo"]) {
                                            wx.getUserInfo({
                                                success(res) {
                                                    console.log("授权成功", res)
                                                    const userInfo = res.userInfo;
                                                    self.Login(openInfo.openid, userInfo.nickName).then(code => {
                                                        if (code != 200) {
                                                            self.registerUser(openInfo.openid, userInfo.nickName, `${userInfo.avatarUrl}?file=a.png`)
                                                        }
                                                    })
                                                }
                                            });
                                            //如果用户没有授权
                                        } else {
                                            self.createWxGetUserInfoBtn(openInfo.openid)
                                        }
                                    }).catch(err => {
                                        console.log('获取openInfo失败' + err)
                                    })
                                } else {
                                    console.log('获取loginCode失败')
                                }
                            }
                        })
                    }
                }
            );
        } else {
            gameMgr.Instance().ALERT.show('错误', '请先勾选用户协议!')
        }

    }

    createWxGetUserInfoBtn(openId: string) {
        const wx = gameMgr.Instance().Wx;//避开ts语法检测
        const systemInfo = wx.getSystemInfoSync();//立即获取系统信息
        const screenWidth: number = systemInfo.screenWidth;//屏幕宽
        const screenHeight: number = systemInfo.screenHeight;//屏幕高
        const self = this
        const button = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: 0,
                top: 0,
                width: screenWidth,
                height: screenHeight,
                lineHeight: screenHeight,
                backgroundColor: "#00000000",
                color: "#FFFFFF",
                textAlign: "center",
                fontSize: 0,
                borderRadius: 0
            }
        });
        gameMgr.Instance().WATING.show('请点击屏幕完成微信授权~')
        //用户授权确认
        button.onTap((res) => {
            console.log('button', res)
            if (res.userInfo) {
                console.log("用户同意授权:", res.userInfo);
                const userInfo = res.userInfo;
                self.Login(openId, userInfo.nickName).then(code => {
                    if (code != 200) {
                        self.registerUser(openId, userInfo.nickName, `${userInfo.avatarUrl}?file=a.png`)
                    }
                })
                button.destroy();
            } else {
                console.log("用户拒绝授权:");
                button.destroy();
            }
            gameMgr.Instance().WATING.hide()
        });
    }

    // update (dt) {}
}
