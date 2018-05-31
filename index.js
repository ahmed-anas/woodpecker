'use strict';

const https = require('https');
const config = require('./config');
var prospectsfile = require('./test/prospects');
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
        this.firstRequest = true;
        this.lastActionTime = new Date();
        this.webhookEvent = {
            REPLIED: 'prospect_replied',
            CLICKED: 'link_clicked',
            OPENED: 'email_opened',
            BOUNCED: 'prospect_bounced',
            INVALID: 'prospect_invalid',
            INTERESTED: 'prospect_interested',
            'MAYBE-LATER': 'prospect_maybe_later',
            'NOT-INTERESTED': 'prospect_not_interested',
            AUTOREPLIED: 'prospect_autoreplied',
            FOLLOWUP: 'followup_after_autoreply'
        }
    }


    getCampaignList(campaign_id = undefined) {
        let url = 'campaign_list';
        if (campaign_id) {
            url += "?id=" + campaign_id;
        }
        return this.req(url, null, "Get")


    }
    createCampaign(reqData) {
        let url = 'campaign';
        return this.req(url, reqData, "Post")

    }

    updateCampaign(reqData) {
        return createCampaign(reqData);
    }
    createCompany(reqData) {
        let url = 'agency/companies/add';
        return this.req(url, reqData, "Post")
    }
    getProspectsFromSpecficCampaigns(ids, page = false, per_page = false) {

        return new Promise((resolve, reject) => {
            let url = '/rest/v1/prospects?campaigns_id=' + ids;
            if (page) {
                url += '&page=' + page;
            }
            if (per_page) {
                url += '&per_page=' + per_page;
            }
            this.options.path = url;
            let response = {
                count: 0,
                rows: []
            }
            let req = https.get(
                this.options,
                (res) => {
                    let data = '';
                    let totalItems = +(res.headers['x-total-count']);
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            if (!data) {
                                return resolve(response);
                            }
                            response.count = totalItems,
                                response.rows = JSON.parse(data)

                            resolve(response)
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
    getProspects(queryParams = undefined) {

        return new Promise((resolve, reject) => {
            let url = '/rest/v1/prospects';
            if (queryParams) {
                url += '?' + queryParams;
                url = url.trim();
            }
            this.options.path = url;
            let response = {
                count: 0,
                rows: []
            }
            let req = https.get(
                this.options,
                (res) => {
                    let data = '';
                    let totalItems = +(res.headers['x-total-count']);
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            if (!data) {
                                return resolve(response);
                            }

                            response.count = totalItems,
                                response.rows = JSON.parse(data)

                            resolve(response)
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
        let url = 'prospects';
        return this.req(url, null, "Get")
    }
    createProspectForCampaign(reqData) {

        return new Promise((resolve, reject) => {
            let campaign_id = reqData.campaign.campaign_id;
            let prospects = reqData.prospects;
            prospects = _.chunk(prospects, 50);
            async.mapSeries(prospects, (prospects, callback) => {
                let reqData = {
                    campaign: {
                        campaign_id: campaign_id
                    },
                    update: true,
                    prospects: prospects
                }
                this.options.path = '/rest/v1/add_prospects_campaign';
                this.options.method = "Post";
                if (this.firstRequest) {
                    let response = this.createReqBody(reqData, callback);
                    this.firstRequest = false;
                }
                else {
                    setTimeout(() => {
                        let response = this.createReqBody(reqData, callback);
                    }, 5000);
                }


            }, function (err, responses) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(responses);
                }
            })
        });

    }
    deleteProspect(prospectIdArr, campaign_id = false) {
        return new Promise((resolve, reject) => {

            if (typeof prospectIdArr === 'string') {
                prospectIdArr = prospectIdArr.split(',');
            }
            prospectIdArr = _.chunk(prospectIdArr, 50);
            async.mapSeries(prospectIdArr, (prospectIdArr, callback) => {
                let prospectIds = prospectIdArr.join(',');
                let subUrl = prospectIds.trim();
                if (campaign_id) {
                    subUrl += '&campaigns_id=' + campaign_id
                }
                let url = 'prospects?id=' + subUrl
                this.req(url, null, "Delete")
                    .then(x => {
                        callback();
                    }).catch(err => {
                        callback();
                    })


            }, function (err, response) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(response);
                }
            })
        });
    }
    // secondary filter of prospects

    createReqBody(reqData, callback) {

        var resReturned = "";
        var emptyObj = {};
        var request = https.request(this.options, function (response) {
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

    }
    configureMailBox(reqData) {
        let url = "mailbox/add";
        return this.req(url, reqData, "Post")
    }
    configureGoogleOauthEndPoint(reqData) {
        let url = "mailbox/oauth";
        return this.req(url, reqData, "Post")

    }
    configureGoogleAddEndPoint(reqData) {
        let url = "mailbox/add";
        return this.req(url, reqData, "Post")

    }
    getMailBox(mailbox_id = undefined) {
        let url = "mailbox";
        if (mailbox_id) {
            url += "?id=" + mailbox_id;
        }
        return this.req(url, null, "GET")

    }
    deleteSmtp(smtp_id) {
        return this.req("mailbox/delete?id=" + smtp_id, null, "Delete")


    }
    mailBoxSetting(reqData) {
        return this.req("mailbox/settings", reqData, "Post")

    }
    updateMailBox(reqData) {
        return this.req("mailbox/update", reqData, "Post")

    }


    req(url, reqData, method) {
        method = method.toUpperCase();
        return new Promise((resolve, reject) => {

            let timeToWait = Math.max(0, 500 - (new Date()).getTime() - this.lastActionTime.getTime());
            this.lastActionTime = new Date();
            setTimeout(() => {
                this.lastActionTime = new Date()
                this.options.path = '/rest/v1/' + url;
                this.options.method = method || 'GET'
                let req = https.request(
                    this.options,
                    (res) => {

                        let data = '';
                        res.on('data', (chunk) => {
                            this.lastActionTime = new Date()
                            data += chunk;
                        });
                        res.on('end', () => {
                            this.lastActionTime = new Date()
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

                    });

                req.on('error', (e) => {
                    this.lastActionTime = new Date()
                    reject(e)
                });
                if (method == 'POST') {
                    req.end(JSON.stringify(reqData));
                }
                else {
                    req.end();
                }
            }, timeToWait)
        })

    }
    webhooks() {
        return {
            subscribe: (url, event) => {
                return this.req('webhooks/subscribe', { target_url: url, event: event }, 'POST')
            },
            unsubscribe: (url, event) => {
                return this.req('webhooks/unsubscribe', { target_url: url, event: event }, 'POST')
            }
        }
    }
}
module.exports = Woodpecker;

let x = new Woodpecker(config.woodpecker_api_key);
var req = {
    name: "-1 issue",
    status: "DRAFT",
    from_name: "Waqas Iqbal",
    from_email: "waqasiqbal740@gmail.com",
    per_day: 2,
    stats: {
        emails: [
            {
                subject: "create campaign testing api",
                msg: "campaign has been successfully addded ",
                timezone: "Europe/Warsaw",
                sunFrom: -1,
                sunTo: -1,
                monFrom: 0,
                monTo: 0,
                tueFrom: 0,
                tueTo: 0,
                wedFrom: 0,
                wedTo: 0,
                thuFrom: 0,
                thuTo: 0,
                friFrom: 0,
                friTo: 0,
                satFrom: 0,
                satTo: 0,
                follow_up: 0


            }]
    }


}
// x.createCampaign(req).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err)
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
//console.log(prospectReq)