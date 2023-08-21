import { getBgm, getSfx, setBgm, setSfx } from "./utils/auth"
import { loadRes } from "./utils/utils"
import gameMgr from "./gameMgr"

const soundsFolder = 'sounds'

export default class audioMgr {
    bgmVolume: number = 1.0
    sfxVolume: number = 1.0
    bgmAudioId: number = -1
    sfxAudioId: number = -1

    constructor() {
        this.bgmVolume = getBgm() || 1.0
        this.sfxVolume = getSfx() || 1.0

        cc.game.on(cc.game.EVENT_HIDE, () => { // 如果页面隐藏则停止所有音乐
            cc.audioEngine.pauseAll()
        })

        cc.game.on(cc.game.EVENT_SHOW, () => {
            cc.audioEngine.resumeAll()
        })
    }

    playBgm(url: string) {
        const audioUrl = `${soundsFolder}/bgm/${url}`
        const clip = gameMgr.Instance().AUDIO[audioUrl]
        if (this.bgmAudioId >= 0) {
            cc.audioEngine.stop(this.bgmAudioId)
        }
        if (clip) {
            this.bgmAudioId = cc.audioEngine.play(clip, true, this.bgmVolume)
        } else {
            loadRes(audioUrl, cc.AudioClip).then((clip: any) => {
                this.bgmAudioId = cc.audioEngine.play(clip, true, this.bgmVolume)
                gameMgr.Instance().AUDIO[audioUrl] = clip
            })
        }

    }

    playSfx(url: string) {
        const audioUrl = `${soundsFolder}/sfx/${url}`
        const clip = gameMgr.Instance().AUDIO[audioUrl]
        if (clip) {
            this.sfxAudioId = cc.audioEngine.play(clip, false, this.sfxVolume)
        } else {
            loadRes(audioUrl, cc.AudioClip).then((clip: any) => {
                this.sfxAudioId = cc.audioEngine.play(clip, false, this.sfxVolume)
                gameMgr.Instance().AUDIO[audioUrl] = clip
            })
        }
    }

    playSfxType(url:string, sex:number) {
        const SfxUrl = sex == 0 ? `man/${url}` : `fem/${url}`
        this.playSfx(SfxUrl)
    }

    setBgmVolume(v: number) {
        console.log(this.bgmAudioId, 'setBgmVolume')
        if(this.bgmAudioId >= 0 && this.bgmVolume != v) {
            this.bgmVolume = v
            setBgm(v)
            cc.audioEngine.setVolume(this.bgmAudioId, v)
        }
    }

    setSfxVolume(v: number) {
        if(this.sfxVolume != v) {
            this.sfxVolume = v
            setSfx(v)
            cc.audioEngine.setVolume(this.sfxAudioId, v)
        }
    }

    pauseBgmAudio() {
        cc.audioEngine.pause(this.bgmAudioId)
    }

    pauseSfxAudio() {
        cc.audioEngine.pause(this.sfxAudioId)
    }

    pauseAll() {
        cc.audioEngine.pauseAll()
    }

    resumeBgmAudio() {
        cc.audioEngine.resume(this.bgmAudioId)
    }

    resumeSfxAudio() {
        cc.audioEngine.resume(this.sfxAudioId)
    }

    resumeAll() {
        cc.audioEngine.resumeAll()
    }
}