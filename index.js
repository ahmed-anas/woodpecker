'use strict';

const https = require('https');

//TODO: make it so it doesn't alter globalagent
https.globalAgent.options.secureProtocol = 'TLSv1_method';
class Woodpecker {
    constructor(API_KEY) {
        this.API_KEY = API_KEY;
        this.authHeader = "Basic " + new Buffer(this.API_KEY + ':X').toString('base64');

    }

    getCampaignList() {
        return new Promise((resolve, reject) => {

            let req = https.get(
                {
                    hostname: 'api.woodpecker.co',
                    path: '/rest/v1/campaign_list',
                    headers: {
                        'Authorization': this.authHeader
                    },
                    port: 443
                },
                (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            if (!data) {
                                return resolve([]);
                            }
                            resolve(JSON.parse(data))
                        }
                        catch (e) {
                            reject(e);
                        }
                    })
                }
            );
            req.on('error', e => {
                reject(e);
            })
            req.end();
        })
    }
}


module.exports = Woodpecker;



// let x = new Woodpecker('18504.eea2395e72b502b65a6a915e860d612444900b05cdff78edf9a7bd3b5597faff');
// x.getCampaignList().then(ls => {
//     console.log(ls);
// }).catch(err => {
//     console.error(err);
// })