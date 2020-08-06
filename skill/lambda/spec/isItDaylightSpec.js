'use strict';

const isItDaylight = require('../src/isItDaylight');

// todo: make edge condition tests for:
// 8:00 - 19:59  = day
// 20:00 - 7:59 = night
describe('isItDaylight', function() {
    it('should be true', function() {
        expect(isItDaylight(1589492464719, "America/New_York")).toBe(true);
    });

    it('should be false', function() {
        //change the profile to a night time
        expect(isItDaylight(1589514064719, "America/New_York")).toBe(false);
    });
});