const badgeUtil = require("../src/badgeUtil");

const moment = require("moment-timezone");

describe('evaluateBadges', function() {
    let nightTimeBlindOpenProfile = require('../spec/profiles/night-time-blind-open.json');
    let badgeCollectorProfile = require('../spec/profiles/badge-colllector.json');

    beforeEach(function() {
        nightTimeBlindOpenProfile.unlockedBadges.unlockHistory = [];
        nightTimeBlindOpenProfile.unlockedBadges = {
            "waterUnits": [],
            "earlyBird": false,
            "nightOwl": false,
            "helicopterParent":false,
            "durations": {}
        }
        nightTimeBlindOpenProfile.newBadge = false;
        nightTimeBlindOpenProfile.unlockedBadges.latestKey = null;
        nightTimeBlindOpenProfile.timesChecked = 1;
    });

    it('should unlock the lifetime 100 water unit badge', function() {
        const testMoment = moment.tz("2020-06-05 17:00:00", nightTimeBlindOpenProfile.timeZone);
        const result = badgeUtil.evaluate(nightTimeBlindOpenProfile, testMoment);
        
        expect(result.waterUnits.includes(100)).toBe(true);
    });

    it('should pop the early bird badge and not the night owl', function() {
        const testMoment = moment.tz("2020-06-05 04:00:00", nightTimeBlindOpenProfile.timeZone);
        const result = badgeUtil.evaluate(nightTimeBlindOpenProfile, testMoment);
        expect(result.earlyBird).toBe(true);
        expect(result.nightOwl).toBe(false);
        expect(result.newBadge).toBe(true);

        expect(result.latestKey).toBe("earlyBird");
        expect(result.newBadge).toBe(true);
    });

    it('should pop the night owl badge and not the early bird', function() {
        const testMoment = moment.tz("2020-06-05 00:00:00", nightTimeBlindOpenProfile.timeZone);
        const result = badgeUtil.evaluate(nightTimeBlindOpenProfile, testMoment);
        expect(result.earlyBird).toBe(false);
        expect(result.nightOwl).toBe(true);

        expect(result.latestKey).toBe("nightOwl");
        expect(result.newBadge).toBe(true);
    });

    it('should still have almost all badges, but no new badges', function() {
        const testMoment = moment.tz("2020-06-05 08:00:00", badgeCollectorProfile.timeZone);
        const result = badgeUtil.evaluate(badgeCollectorProfile, testMoment);
        expect(result.earlyBird).toBe(true);
        expect(result.nightOwl).toBe(true);
        expect(result.helicopterParent).toBe(true);

        expect(result.latestKey).toEqual(null);
        expect(result.newBadge).toBe(false);
    });

    it('should be alive for 365 days', function() {
        const testMoment = moment.tz("2021-05-07 18:28:10", nightTimeBlindOpenProfile.timeZone);
        const result = badgeUtil.evaluate(nightTimeBlindOpenProfile, testMoment);

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
        let profile = require("../spec/profiles/helicopter-parent.json");
        const currentTime = moment.tz("2020-06-05 00:00:00", profile.timeZone);

        const result = badgeUtil.evaluate(profile, currentTime);
        expect(result.helicopterParent).toBe(true);

        expect(result.latestKey).toBe("helicopterParent");
        expect(result.newBadge).toBe(true);
    });
});