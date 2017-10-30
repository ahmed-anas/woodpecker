'use strict';

const https = require('https');
const config = require('./config');
//var prospectsfile = require('./test/prospects');
const async = require('async');
const _ = require('lodash');


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
    createCompany(reqData) {
        return new Promise((resolve, reject) => {
            this.options.path = '/rest/v1/agency/companies/add';
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
    getProspectsFromSpecficCampaigns(ids, page = false,per_page=false) {
        return new Promise((resolve, reject) => {
            let url ='/rest/v1/prospects?campaigns_id=' + ids;
            if(page){
                url+='&page='+page;
            }
            if(per_page){
                url+='&per_page='+per_page;
            }
            this.options.path = url;

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
    getProspectList(ids) {
        return new Promise((resolve, reject) => {
            this.options.path = '/rest/v1/prospects'

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
    createProspectForCampaign(reqData) {

        return new Promise((resolve, reject) => {
            let campaign_id = reqData.campaign.campaign_id;
            let prospects = reqData.prospects;
            prospects = _.chunk(prospects, 50);
            async.mapSeries(prospects, this.createReqBody(campaign_id, this.options), function (err, responses) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(responses);
                }
            })
        });

    }
    deleteProspect(prospectIds, campaign_id = false) {
        prospectIds = prospectIds.trim();
        return new Promise((resolve, reject) => {
            var subUrl = prospectIds
            if (campaign_id) {
                subUrl += '&campaigns_id=' + campaign_id
            }
            this.options.path = '/rest/v1/prospects?id=' + subUrl
            this.options.method = "Delete"
            let req = https.request(
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
    createReqBody(campaign_id, options) {
        return function (prospects, callback) {
            setTimeout(function () {
                var reqData = {
                    campaign: {
                        campaign_id: campaign_id
                    },
                    update: true,
                    prospects: prospects
                }
                options.path = '/rest/v1/add_prospects_campaign';
                options.method = "Post"
                var resReturned = "";
                var request = https.request(options, function (response) {
                    response.setEncoding('utf8');
                    response.on("data", function (chunk) {
                        resReturned += chunk;
                    });
                    response.on("end", function () {
                        var responseToSend = null;
                        if (!resReturned) {
                            responseToSend = emptyObj;
                        }
                        else {
                            try {
                                responseToSend = JSON.parse(resReturned);
                            }
                            catch (error) {
                                console.log(error);
                                return callback(null, emptyObj);
                            }
                        }
                        callback(null, (!resReturned) ? emptyObj : responseToSend);
                    });
                }).on("error", function (error) {
                    callback(error, null);
                });

                request.end(JSON.stringify(reqData));
            }, 30000);
        }
    }

}
module.exports = Woodpecker;

let x = new Woodpecker(config.woodpecker_api_key);
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
// x.getCampaignList().then(res =>{
// console.log(res);
// }).catch(err =>{
//     console.error(err);
// })
// x.deleteProspect("25577616,25577617").then(ls => {
//     console.log(ls);
// }).catch(err => {
//     console.error(err);
// })

// var prospectReq = {
//     "campaign": {
//         "campaign_id": 72593
//     },
//     "update": "true",
//     "prospects": prospectsfile
// }
// var startTime = new Date().getTime();
// x.createProspectForCampaign(prospectReq).then(ls => {
//     console.log(ls);
//     var endTime = new Date().getTime();
//     let sec = (endTime - startTime) / 1000;
//     let min = sec / 60;
//     console.log("time in sec:", sec, "sec");
//     console.log("time in min:", min, "min");
// }).catch(err => {
//     console.error(err);
// })
// console.log(prospectReq)