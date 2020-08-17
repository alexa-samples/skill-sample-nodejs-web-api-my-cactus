'use strict';

const statusUtil = require('../src/statusUtil');
const moment = require('moment-timezone');

describe('computeStatus', function() {
    // elapsed time less than one hour
    it('should not modify lastUpdated', function() {
        const ssOneHourLess = require("./profiles/one-hour-less.json");
        const latestInteraction = moment(ssOneHourLess.cactus.latestInteraction);

        const status = statusUtil.computeStatus(ssOneHourLess, latestInteraction, ssOneHourLess.timeZone);
        expect(status.lastUpdated).toBe(1588890484157);
    });
    
    const ssOneHourGreater = require("./profiles/one-hour-greater.json");
    const OneHourGreaterLatestInteraction = moment(ssOneHourGreater.cactus.latestInteraction);
    const status = statusUtil.computeStatus(ssOneHourGreater, OneHourGreaterLatestInteraction, ssOneHourGreater.timeZone);

    // elapsed time greater than one hour
    it('healthLevel should be 90', function() {
        // console.log(status.healthLevel);
        expect(status.healthLevel).toBe(100);
    });

    it('should modify lastUpdated', function() {
        // console.log(status.lastUpdated, 1588890484157,status.lastUpdated !== ssOneHourGreater.lastUpdated);
        // console.log(status);
        expect(status.lastUpdated !== 1588890484157).toBe(true);
    });

    it('healthLevel should be 40', function() {
        const ssOneHourGreaterNoWater49Hp =  require('./profiles/one-hour-greater-no-water-50-health.json');
        const latestInteraction = moment(ssOneHourGreaterNoWater49Hp.cactus.latestInteraction);
        // console.log('running test - ','epoch', ssOneHourGreaterNoWater49Hp.cactus.latestInteraction, 'moment', latestInteraction);
        const status2 = statusUtil.computeStatus(ssOneHourGreaterNoWater49Hp, latestInteraction, ssOneHourGreaterNoWater49Hp.timeZone);
        expect(status2.healthLevel).toBe(40);
    });

    
    it('healthLevel should be less than 0', function() {
        const ssNightTimeBlindsOpen = require('./profiles/night-time-blind-open.json');
        const nightTimeBlindOpenLatestInteraction =  moment(ssNightTimeBlindsOpen.cactus.latestInteraction);
        const status3 = statusUtil.computeStatus(ssNightTimeBlindsOpen, nightTimeBlindOpenLatestInteraction, ssNightTimeBlindsOpen.timeZone);        
        expect(status3.healthLevel).toBeLessThan(0);
    });

    it('should determine the cactus is dead', function() {
        const deadProfile = require('./profiles/negative-water-postive-health.json');
        
        // TODO: consider adding a distinct test case for this file/profile.
        // const deadProfile = require('./profiles/prod-profile.json');

        const latestInteraction = moment();

        const status4 = statusUtil.computeStatus(deadProfile, latestInteraction, deadProfile.timeZone);

        expect(status4.healthLevel).toBeLessThan(0);
    });  
});