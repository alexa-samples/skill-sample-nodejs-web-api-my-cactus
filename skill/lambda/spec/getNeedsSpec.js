'use strict';

const statusUtil = require('../src/statusUtil');

describe('getNeeds', function() {

    const ssOneHourGreaterNoWater49Hp = require("./profiles/one-hour-greater-no-water-50-health.json");
    const status = statusUtil.getNeeds(ssOneHourGreaterNoWater49Hp);  

    it('should need water and light', function(){
        const expectedComfortMessage = "Sharpie Sharp needs light. You can open the blinds.";
        expect(status.water).toBe(true);
        expect(status.comfort).toBe(true);
    })

    // it('should be out of water and need light', function() {    
    //     expect(status).toBe('Sharpie Sharp is out of water and needs light.');
    // });

    // const ssNightTimeBlindsOpen = require('./profiles/night-time-blind-open.json');
    // const status2 = computeStatus(ssNightTimeBlindsOpen);

    // it('should ', function() {
    //     expect(status2).toBe('Sharpie Sharp is bloated and in danger of being over watered and is cold.');
    // });
});