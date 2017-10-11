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
    it('should get list of campaigns', function (done) {
        woodpecker.getCampaignList().then(eventually(done, (ls => {
            expect(ls).to.be.an.instanceOf(Array);
            expect(ls.length).to.be.above(0);
            
        }))).catch(err => {
            done(err);
        });

    })
})


