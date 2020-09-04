'use strict';

const statusUtil = require('../src/statusUtil');

describe('getStatusNeeds', function() {
    it('should need water', function() {
        const needWaterProfile = require('./profiles/negative-water-postive-health.json');

        const status = statusUtil.getStatus(needWaterProfile);

        expect(status.needs.water).toBe(true)
        expect(status.needs.comfort).toBe(false);
        expect(status.message).toBeDefined();

    }); 


    it('should have no needs', function() {
        const noNeedsProfile = require('./profiles/no-needs.json');

        const status = statusUtil.getStatus(noNeedsProfile);

        expect(status.needs.water).toBe(false);
        expect(status.needs.comfort).toBe(false);
    });
});