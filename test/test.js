'use strict';

var expect = require('chai').expect;
var Woodpecker = require('../index');
const eventually = require('./test-helper').eventually;
const TestConfig = require('./test-config');

var woodpecker = null;

describe('Woodpecker API calls', function () {

    it('should be able to create woodpecker object', function () {
        woodpecker = new Woodpecker(TestConfig.API_KEY);
    })
    var initialLength = 0;;
    it('should get list of campaigns', function (done) {
        woodpecker.getCampaignList().then(eventually(done, (ls => {
            expect(ls).to.be.an.instanceOf(Array);
            expect(ls.length).to.be.above(0);
            initialLength = ls.length;
        }))).catch(err => {
            done(err);
        });

    })
    it('should get list of prospects from specific campaigns', function (done) {
        woodpecker.getProspectsFromSpecficCampaigns(71359).then(eventually(done, (ls => {
            expect(ls).to.be.an.instanceOf(Array);
            expect(ls.length).to.be.above(0);
            initialLength = ls.length;
        }))).catch(err => {
            done(err);
        });

    })
    var req = {
        name: "First testing campaign 2",
        status: "DRAFT",
        from_name: "",
        from_email: "",
        per_day: 2,
        stats: {
            emails: [
                {
                    subject: "create campaign testing api",
                    msg: "campaign has been successfully addded ",
                    timezone: "Europe/Warsaw",
                    sunFrom: 0,
                    sunTo: 0,
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

                }]
        }
    }
    it('should create campaign', function (done) {

        req.stats.emails[0].follow_up = 0;
        woodpecker.createCampaign(req).then(eventually(done, (ls => {
            expect(ls).to.be.an.instanceOf(Object);

        }))).catch(err => {
            done(err);
        });

    })
    it("shouldn't create campaign", function (done) {
        delete req.stats.emails[0].follow_up;
        woodpecker.createCampaign(req).then(eventually(done, (ls => {
            done(new Error('error'))

        }))).catch(err => {
            done();
        });

    })
    
    it('should create company', function (done) {

        let req = {
            name: "Testing company",
            api_key: "generate"
        }
        woodpecker.createCompany(req).then(eventually(done, (ls => {
            expect(ls).to.be.an.instanceOf(Object);
            expect(ls).to.have.own.property('id');

        }))).catch(err => {
            done(err);
        });

    })
    it("shouldn't create company", function (done) {
        let req = {
            name: "Testing company",
            api_key: "generate"
        }
        woodpecker.createCompany(req).then(eventually(done, (ls => {
            done(new Error('error'))

        }))).catch(err => {
            done();
        });

    })
})


