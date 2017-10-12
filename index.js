'use strict';

const https = require('https');

//TODO: make it so it doesn't alter globalagent
https.globalAgent.options.secureProtocol = 'TLSv1_method';
class Woodpecker {
    constructor(API_KEY) {
        this.API_KEY = API_KEY;
        this.authHeader = "Basic " + new Buffer(this.API_KEY + ':X').toString('base64');
        this.options = {
            hostname: 'api.woodpecker.co',
            path: '',
            headers: {
                'Authorization': this.authHeader
            }
        }
    }


    getCampaignList() {
        return new Promise((resolve, reject) => {
            this.options.path = '/rest/v1/campaign_list';
           let req = https.get(
               this.options,
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
    createCampaign(reqData) {
        return new Promise((resolve, reject) => {
            this.options.path = '/rest/v1/campaign';
            this.options.method = "Post"
            let req = https.request(
                this.options,
                (res) => {
                    var statusCode = res.statusCode;
                    res.on('data', (d) => {
                        if (statusCode < 200 || statusCode >= 300) {
                            reject(JSON.parse(d))
                           
                        }
                        else {
                            resolve(JSON.parse(d))
                        }
                    });
                });

            req.on('error', (e) => {
                reject(e)
            });
            req.end(JSON.stringify(reqData));
        })
    }
}


module.exports = Woodpecker;

// let x = new Woodpecker('18405.6524581ed2a3d81b36f7910dcc0d7746a2e8b61adbb07a15f5ccc5edd11fc754');
// var req = {
//     name: "First testing campaign",
//     status: "DRAFT",
//     from_name: "Waqas Iqbal",
//     from_email: "waqasiqbal740@gmail.com",
//     per_day: 2,
//     stats: {
//         emails: [
//             {
//                 subject: "create campaign testing api",
//                 msg: "campaign has been successfully addded ",
//                 timezone: "Europe/Warsaw",
//                 sunFrom: 0,
//                 sunTo: 0,
//                 monFrom: 0,
//                 monTo: 0,
//                 tueFrom: 0,
//                 tueTo: 0,
//                 wedFrom: 0,
//                 wedTo: 0,
//                 thuFrom: 0,
//                 thuTo: 0,
//                 friFrom: 0,
//                 friTo: 0,
//                 satFrom: 0,
//                 satTo: 0,
//                 follow_up:0


//             }]
//     }


// }
// x.createCampaign(req).then(ls => {
//     console.log(ls);
// }).catch(err => {
//     console.error(err);
// })