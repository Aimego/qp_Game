
import { createHash } from 'crypto'
import randomName from './randomName'
import gameMgr from '../gameMgr'

const CryptoEncodeMD5 = (data:string) => {
    const md5 = createHash('md5') // 单向加密不可逆(只会生成16字节的结果)
    md5.update(data)
    const result = md5.digest('hex') // 计算加密结果，hex表示输出16进制的加密结果
    return result
}

const randomIndex = (max:number, min: number) => {
    return Math.floor(Math.random() * (max - min)) + min
}

const loadRes = (path: string, type?:any):Promise<any> => {
    return new Promise((resolve, reject) => {
        cc.loader.loadRes(path, type, (err, data:any) => {
            if(err) {
                reject(err)
            }
            resolve(data)
        })
    })
}

const findLastIndex = (array: Array<any>, callback: Function) => {
    for (let i = array.length - 1; i >= 0; i--) {
      if (callback(array[i], i, array)) {
        return i;
      }
    }
    return -1;
  }

const loadTexture2d = (url: string):Promise<cc.SpriteFrame> => {
    return new Promise((resolve, reject) => {
        cc.loader.load(url, (err: Error, texture: cc.Texture2D) => {
            if (err) {
              cc.error(err.message || err);
              reject(err)
            }
            const spriteFrame = new cc.SpriteFrame(texture);
            resolve(spriteFrame)
          });
    })
}

export {
  CryptoEncodeMD5,
  randomIndex,
  loadRes,
  findLastIndex,
  loadTexture2d,
  randomName,
}