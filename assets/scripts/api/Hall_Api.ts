import http from '../utils/http'
import { NanChangeMj } from '../interface_ts/playGames'

export const api_createRoom = <T>(config: T, gameType: string) => { // 创建房间
    return http('room/createRoom', 'POST', {
        ...config,
        gameType
    })
}

// export const api_joinRoom = (user: User) => { // 加入房间
//     return http("room/joinRoom", 'POST', {
//         ...user
//     })
// }