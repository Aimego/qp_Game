import { User } from '../interface_ts/index'
import http from '../utils/http'

export const api_getServerInfo = () => { // 获取服务端信息
    return http('get_server_info')
}

export const api_register = (sign: string, username: string, avatar?: string) => { // 注册账号
    console.log('api_register', username)
    return http('user/register', 'POST', {
        sign,
        username,
        avatar
    })
}

export const api_getWxOpenId = (code: number) => {
    return http('user/getWxOpenId', 'POST', {
        code
    })
}

export const api_login = (sign: string, name: string) => { // 登录账号
    return http('user/login', 'POST', {
        sign,
        name
    })
}