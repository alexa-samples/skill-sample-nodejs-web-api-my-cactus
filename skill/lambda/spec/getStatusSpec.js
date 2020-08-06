'use strict';

const statusUtil = require('../src/statusUtil');

describe('getgetStatusNeeds', function() {
    it('should need water', function() {
        const needWaterProfile = require('./profiles/ss-negative-water-postive-health.json');

        const status = statusUtil.getStatus(needWaterProfile);

        expect(status.water).toBe(true)
        expect(status.comfort).toBe(false);
        expect(status.message).toBeDefined();

    }); 


    it('should have no needs', function() {
        const noNeedsProfile = require('./profiles/ss-no-needs.json');

        const status = statusUtil.getStatus(noNeedsProfile);

        expect(status.water).toBe(false);
        expect(status.comfort).toBe(false);
    });
});