
import gameMgr from "../gameMgr"
import { User } from "../interface_ts"
const User_Key = 'account'
const Bgm_Key = 'bgmVolume'
const Sfx_Key = 'sfxVolume'

/**
 * 
 * GET
 */

export function getUser(): User {
    // return JSON.parse(window.localStorage.getItem(User_Key))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.getStorageSync(User_Key)
    } else {
        return JSON.parse(window.sessionStorage.getItem(User_Key))
    }
}

export function getBgm(): number {
    // return JSON.parse(window.localStorage.getItem(Bgm_Key))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.getStorageSync(Bgm_Key)
    } else {
        return JSON.parse(window.sessionStorage.getItem(Bgm_Key))
    }
}

export function getSfx(): number {
    // return JSON.parse(window.localStorage.getItem(Sfx_Key))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.getStorageSync(Sfx_Key)
    } else {
        return JSON.parse(window.sessionStorage.getItem(Sfx_Key))
    }
}


/**
 * 
 * SET
 */
export function setUser(data: any): void {
    // window.localStorage.setItem(User_Key, JSON.stringify(data))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.setStorageSync(User_Key, data)
    } else {
        return window.sessionStorage.setItem(User_Key, JSON.stringify(data))
    }
}

export function setBgm(data: number): void {
    // window.localStorage.setItem(Bgm_Key, JSON.stringify(data))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.setStorageSync(Bgm_Key, data)
    } else {
        return window.sessionStorage.setItem(Bgm_Key, JSON.stringify(data))
    }
}

export function setSfx(data: number): void {
    // window.localStorage.setItem(Sfx_Key, JSON.stringify(data))
    if (gameMgr.Instance().isWeChatPLATFORM) {
        const wx = gameMgr.Instance().Wx
        return wx.setStorageSync(Sfx_Key, data)
    } else {
        return window.sessionStorage.setItem(Sfx_Key, JSON.stringify(data))
    }
}
