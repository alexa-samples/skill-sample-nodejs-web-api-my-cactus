const badgeUtil = require("../src/badgeUtil");

const moment = require("moment-timezone");

describe('evaluteBadges - timesChecked', function() {
    const profile = require('../spec/profiles/helicopter-parent.json');

    it('should unlock the helicopter parent badge', function() {
        const testMoment = moment.tz("2020-07-16 19:00:00", profile.timeZone);
        const result = badgeUtil.evaluate(profile, testMoment);

        //console.log(result);

    }); 
});


describe('evaluateBadges', function() {
    let profile =  require('../spec/profiles/night-time-blind-open.json');

    beforeEach(function() {
        profile.unlockedBadges.unlockHistory = [];
    });

    it('should unlock the lifetime 100 water unit badge', function() {
        const testMoment = moment.tz("2020-06-05 17:00:00", profile.timeZone);
        const result = badgeUtil.evaluate(profile, testMoment);
        
        expect(result.waterUnits.includes(100)).toBe(true);
    });

    it('should pop the early bird badge', function() {
        const testMoment = moment.tz("2020-06-05 04:00:00", profile.timeZone);
        const result = badgeUtil.evaluate(profile, testMoment);
        expect(result.earlyBird).toBe(true);
        expect(result.nightOwl).toBe(false);

        result.earlyBird = false;
        result.nightOwl = false;
    });

    it('should pop the night owl badge', function() {
        const testMoment = moment.tz("2020-06-05 00:00:00", profile.timeZone);
        const result = badgeUtil.evaluate(profile, testMoment);
        expect(result.earlyBird).toBe(false);
        expect(result.nightOwl).toBe(true);
    });    

    it('should be alive for 365 days', function() {
        const testMoment = moment.tz("2021-05-07 18:28:10", profile.timeZone);
        const result = badgeUtil.evaluate(profile, testMoment);

        let allTrue = true;
        // named key to '_' because we don't need it.
        for ( const [_, value] of Object.entries(result.durations)) {
            if (!value) {
                allTrue = false;
                break;
            }
        }

        expect(result.latest).toBe('For keeping your cactus alive for 365 days');
        expect(allTrue).toBe(true);
    });

    it('should be a helicopter parent', function() {
        const currentTime = moment.tz("2020-06-05 00:00:00", profile.timeZone);

        const result = badgeUtil.evaluate(profile, currentTime);
        expect(result.helicopterParent).toBe(true);
    });
});