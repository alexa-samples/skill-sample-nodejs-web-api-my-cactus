const profileUtil = require('../src/profileUtil');
describe('cleanUpCactus', function() {
    it('should reset the cactus and badges.', function() {

        const profile = require('../spec/profiles/dead-launch.json');

        const result = profileUtil.cleanUpCactus(profile);

        // checking the default cactus values
        expect(result.cactus).toBe(null);

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