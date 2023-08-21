import { Config } from '../config'
import { Response } from '../interface_ts';
import gameMgr from '../gameMgr';
export default function sendRequest(url: string, method: string = 'GET', data?) {
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText) as Response
                    console.log(response)
                    if(response.code === 200) {
                        console.log('200')
                        resolve(response.data)
                    }else {
                        reject('Request failed. Response code: ' + response.code)
                    }
                } else {
                    reject('Request failed. Status code: ' + xhr.status)
                }
            }
        };
        xhr.open(method, `${Config.URL}/${url}`, true);
        if (gameMgr.Instance().TOKEN) {
            xhr.setRequestHeader('authorization', gameMgr.Instance().TOKEN);
        }
        if (method === 'POST') {
            // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Content-type', 'application/json')
        }
        xhr.send(JSON.stringify(data));
    })
}