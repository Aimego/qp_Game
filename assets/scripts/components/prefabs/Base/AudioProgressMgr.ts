
import gameMgr from "../../../gameMgr";
import { getBgm, getSfx } from '../../../utils/auth'
import { loadRes } from '../../../utils/utils'
const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class AudioProgressMgr extends cc.Component {

    @property(cc.Node)
    progressMgr: cc.Node = null

    @property(cc.Node)
    closeSetting: cc.Node = null

    bgmVolume: cc.Node = null
    sfxVolume: cc.Node = null
    bgm_btn: cc.Node = null
    sfx_btn: cc.Node = null
    bgm_open: cc.SpriteFrame = null
    bgm_close: cc.SpriteFrame = null
    sfx_open: cc.SpriteFrame = null
    sfx_close: cc.SpriteFrame = null
    bgm_flag: boolean = true
    sfx_flag: boolean = true
    progressbarBgmVolume: cc.ProgressBar = null
    progressbarSfxVolume: cc.ProgressBar = null
    _setting: cc.Node = null

    async initProgressMgr() {
        this._setting = cc.find('Canvas/settings')
        console.log(this._setting)
        this.bgmVolume = this.progressMgr.getChildByName('hall_bgm')
        this.sfxVolume = this.progressMgr.getChildByName('game_bgm')
        const bgmSlider = this.bgmVolume.getChildByName('slider')
        const sfxSlider = this.sfxVolume.getChildByName('slider')
        this.progressbarBgmVolume = bgmSlider.getChildByName('progress').getComponent(cc.ProgressBar) // 获取progressBar组件
        this.progressbarSfxVolume = sfxSlider.getChildByName('progress').getComponent(cc.ProgressBar)
        this.bgm_btn = this.bgmVolume.getChildByName('bgm')
        this.sfx_btn = this.sfxVolume.getChildByName('sfx')

        // 待修改（通过toggle来实现按钮切换）
        const atlas = await loadRes('textures/atlas/setting/setting', cc.SpriteAtlas)
        this.bgm_open = atlas.getSpriteFrame('setting6')
        this.bgm_close = atlas.getSpriteFrame('setting5')
        this.sfx_open = atlas.getSpriteFrame('setting4')
        this.sfx_close = atlas.getSpriteFrame('setting3')

        this.initButtonHandler(this.bgm_btn, 'onBtnClick') // 初始化开关音乐按钮
        this.initButtonHandler(this.sfx_btn, 'onBtnClick')

        this.initButtonHandler(this.closeSetting, 'onHide') // 初始化关闭setting页

        bgmSlider.on('slide', this.onBgmSlider, this) // 监听bgmSlider的滑动事件，并且调用BgmSlider
        sfxSlider.on('slide', this.onSfxSlider, this)

        this.progressbarBgmVolume.progress = getBgm()
        this.progressbarSfxVolume.progress = getSfx()
        bgmSlider.getComponent(cc.Slider).progress = getBgm()
        sfxSlider.getComponent(cc.Slider).progress = getSfx()
    }

    onBtnClick(event: cc.Event.EventTouch) {
        switch (event.target.name) {
            case 'bgm':
                this.bgm_flag = !this.bgm_flag
                if (this.bgm_flag) {
                    this.bgm_btn.getComponent(cc.Sprite).spriteFrame = this.bgm_open
                    gameMgr.Instance().AUDIOMGR.resumeBgmAudio()
                } else {
                    this.bgm_btn.getComponent(cc.Sprite).spriteFrame = this.bgm_close
                    gameMgr.Instance().AUDIOMGR.pauseBgmAudio()
                }
                break;
            case 'sfx':
                this.sfx_flag = !this.sfx_flag
                if (this.sfx_flag) {
                    this.sfx_btn.getComponent(cc.Sprite).spriteFrame = this.sfx_open
                    gameMgr.Instance().AUDIOMGR.resumeSfxAudio()
                } else {
                    this.sfx_btn.getComponent(cc.Sprite).spriteFrame = this.sfx_close
                    gameMgr.Instance().AUDIOMGR.pauseSfxAudio()
                }
                break;
        }
    }

    onBgmSlider(value: cc.Slider) {
        this.progressbarBgmVolume.progress = value.progress
        gameMgr.Instance().AUDIOMGR.setBgmVolume(value.progress)
    }

    onSfxSlider(value: cc.Slider) {
        this.progressbarSfxVolume.progress = value.progress
        gameMgr.Instance().AUDIOMGR.setSfxVolume(value.progress)
    }

    abstract initButtonHandler(node: cc.Node, callback: string): void
        // gameMgr.Instance().UTILS.addClickEvent(node, this.node, 'AudioProgressMgr', callback)
    // }
}
