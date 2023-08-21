import gameMgr from "../../gameMgr";

const { ccclass, property } = cc._decorator;

interface volumeLimit {
    startVolume: number,
    endVolume: number
}

@ccclass
export default class Voice extends cc.Component {

    @property(cc.SpriteFrame)
    voiceFrame: Array<cc.SpriteFrame> = []

    _voice: cc.Node = null
    _volume: cc.Node = null
    _tips: cc.Node = null

    volumeRange: number = 255 / 7
    volumeArrLimit: Array<volumeLimit> = []
    startVoiceFlag: boolean = false

    mediaRecorder: MediaRecorder = null
    stream: MediaStream = null
    analyser: AnalyserNode = null
    frequencyData: Uint8Array = null
    startTime: number = 0 // 记录录音时间
    endTime: number = 0

    onLoad() {
        this._voice = cc.find('Canvas/voice')
        this._volume = this._voice.getChildByName('record')
            .getChildByName('volume')
            .getChildByName('animation')

        this._tips = this._voice.getChildByName('tips')

        this.voiceFrame.forEach((_, index: number) => { // 初始化计算每一帧的起始音量的最大音量
            const startVolume: number = index * this.volumeRange
            const endVolume: number = startVolume + this.volumeRange
            this.volumeArrLimit.push({
                startVolume,
                endVolume
            })
        });


        

        gameMgr.Instance().VOICE = this
    }

    onTouchStart(event: cc.Event.EventTouch) {
        // 获取触摸点的位置
        const touchPos = event.getLocation();
        // 判断触摸点是否在目标节点上
        if (this._voice.getBoundingBoxToWorld().contains(touchPos)) {
            // 在目标节点上触摸开始时触发的事件
            console.log("Touch started start");
            this._volume.color = new cc.Color().fromHEX('#00FF00')
            this._tips.getChildByName('label').getComponent(cc.Label).string = '手指上滑 取消发送'
            this._tips.getChildByName('line').color = new cc.Color().fromHEX('#00FF00');
            this.startVoice()
        } else {
            this.onHide()
        }
    }

    onTouchMove(event: cc.Event.EventMouse) {
        // 获取触摸点的位置
        const touchPos = event.getLocation();
        // 判断触摸点是否在目标节点上
        if (!this._voice.getBoundingBoxToWorld().contains(touchPos)) { // 不在节点中
            console.log("Touch moved leave");
            this._volume.color = new cc.Color().fromHEX('#FF0000')
            this._tips.getChildByName('label').getComponent(cc.Label).string = '松开取消录音'
            this._tips.getChildByName('line').color = new cc.Color().fromHEX('#FF0000');
            this.startVoiceFlag = false
        } else {
            this._volume.color = new cc.Color().fromHEX('#00FF00')
            this._tips.getChildByName('label').getComponent(cc.Label).string = '手指上滑 取消发送'
            this._tips.getChildByName('line').color = new cc.Color().fromHEX('#00FF00');
            this.startVoiceFlag = true
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        console.log("onTouchSend")
        this.endVoice()
    }

    onTouchCancel(event: cc.Event.EventTouch) {
        console.log('onTouchCancel')
        this.stopAudio()
        this.onHide()
    }

    animationFrame(volume: number): void {
        const VolumeIndex = this.volumeArrLimit.findIndex((val: volumeLimit) => {
            return val.startVolume >= volume || volume <= val.endVolume
        })
        // console.log(volume, this.volumeArrLimit, VolumeIndex)
        this._volume.getComponent(cc.Sprite).spriteFrame = this.voiceFrame[VolumeIndex]
    }

    startVoice() {
        console.log('开始录音')
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                this.stream = stream
                const audioContext = new window.AudioContext;
                this.mediaRecorder = new MediaRecorder(stream);
                // 创建AnalyserNode节点
                this.analyser = audioContext.createAnalyser();
                // 连接音频流到AnalyserNode节点
                const source = audioContext.createMediaStreamSource(stream);
                // 获取频谱数据
                this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
                source.connect(this.analyser);
                this.startTime = Date.now()
                this.mediaRecorder.start();
                // this.updateSoundLevel()
                this.startVoiceFlag = true
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }

    endVoice() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            console.log('停止录音')
            const duration = (Date.now() - this.startTime)
            this.stopAudio()
            // console.log(duration)
            if (duration < 1000) {
                // console.log(gameMgr.Instance().WATING)
                gameMgr.Instance().WATING.show('语音时长不能小于1秒')
                gameMgr.Instance().WATING.hide()
                return
            }
            this.mediaRecorder.stop();
            // 监听mediaRecorder.stop触发
            this.mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    // console.log(event.data)
                    // wav无损音频编码格式(效果好，体积大)，amr压缩语言数据(体积小)
                    const blob = new Blob([event.data], { type: 'audio/amr' });
                    const url = URL.createObjectURL(blob);
                    // const audio = new Audio(url);
                    // audio.addEventListener('ended', () => {
                    //     console.log('音频播放完成')
                    //     URL.revokeObjectURL(url)
                    // })
                    // audio.play();
                    gameMgr.Instance().SOCKET.sendVoice({
                        roomId: gameMgr.Instance().ROOMINFO.roomId,
                        voice: url
                     })
                    gameMgr.Instance().WATING.show('发送成功~')
                    gameMgr.Instance().WATING.hide()
                    this.mediaRecorder = null;
                }
            });
        }
    }

    // 更新声音大小
    updateSoundLevel() {
        // 获取频谱数据
        this.analyser.getByteFrequencyData(this.frequencyData);
        const frequencyArray: number[] = Array.from(this.frequencyData);

        // // 计算声音大小
        const maxFrequency = Math.max(...frequencyArray);
        // 输出声音大小
        // console.log('Frequency-based sound level:', maxFrequency);
        this.animationFrame(maxFrequency)
    }

    // 停止获取音频
    stopAudio() {
        // 停止音频流的获取(连接analyserNode节点进行释放)
        this.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        // 断开AnalyserNode节点的连接
        this.analyser.disconnect();
        // 停止更新声音大小
        this.startVoiceFlag = false
        // 关闭节点
        this._voice.active = false
    }

    onShow() {
        this._voice.active = true
        this._volume.color = new cc.Color().fromHEX('#FFFFFF')
        this._tips.getChildByName('label').getComponent(cc.Label).string = '点击麦克风 开始录音'
        this._tips.getChildByName('line').color = new cc.Color().fromHEX('#FFFFFF');

        // 开始监听触屏事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this._voice.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this._voice.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this._voice.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onHide() {
        console.log('onHideVoice')
        this._voice.active = false

        // 取消监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this._voice.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this._voice.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this._voice.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    update() {
        if (this._voice.active && this.startVoiceFlag) {
            this.updateSoundLevel()
        }
    }

}
