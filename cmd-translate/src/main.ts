import * as querystring from "querystring";
import md5 = require("md5");
import {appId, appSecret} from "./private";
import {checkServerIdentity} from "tls";
const https = require('https');

export  const translate = (word)=>{

    const salt = Math.random()
    const sign = md5(appId+word+salt+appSecret)

    const query:string = querystring.stringify({
        q:word,
        from:'en',
        to:'zh',
        appid:appId,
        salt:salt,
        sign:sign
    })

    const options = {
        hostname: 'fanyi-api.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?'+query,
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let chunks = []

        res.on('data', (chunk) => {
            chunks.push(chunk)
        });

        res.on('end',()=>{
            const string = Buffer.concat(chunks).toString()

            type BaiduResult = {
                error_code?:string,
                error_msg?:string,
                from:string,
                to:string,
                trans_result:{
                    src:string,
                    dst:string
                }[]
            }

            const  object:BaiduResult = JSON.parse(string)
            if (object.error_code){
                console.log(object.error_msg);
                process.exit(2)
            }else {
                console.log(object.trans_result[0].dst);
                process.exit(0)
            }

        })
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();

}