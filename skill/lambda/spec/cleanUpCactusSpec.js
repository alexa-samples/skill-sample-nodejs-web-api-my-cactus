const cactusUtil = require('../src/cactusUtil');
const moment = require('moment-timezone');

describe('cleanUpCactus', function() {
    it('should reset the cactus and badges.', function() {

        const profile = require('../spec/profiles/ss-dead-launch.json');

        const result = cactusUtil.cleanUpCactus(profile);

        // checking the default cactus values
        expect(result.cactus.waterLevel).toBe(5);
        expect(result.cactus.healthLevel).toBe(100);
        expect(result.cactus.daysAlive).toBe(0);

        expect(result.timesChecked).toBe(1);

        // checking the unlocked badges status

        expect(result.unlockedBadges.earlyBird).toBe(false);
        expect(result.unlockedBadges.nightOwl).toBe(false);
        expect(result.unlockedBadges.helicopterParent).toBe(false);

        for(let key in result.unlockedBadges.durations) {
            expect(result.unlockedBadges.durations[key]).toBe(false);
        }

        expect(result.unlockedBadges.lostAllBadges).toBe(true);
    });
});