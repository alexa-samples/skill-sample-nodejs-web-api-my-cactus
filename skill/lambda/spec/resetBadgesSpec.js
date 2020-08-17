const badgeUtil = require('../src/badgeUtil.js');

describe('resetBadges', function(){
    it('should reset all badges', function() {
        const badges = {
            "waterUnits": [],
            "earlyBird": true,
            "nightOwl": true,
            "durations": {
                "1": true,
                "3": true,
                "7": true,
                "14": false,
                "30": false,
                "90": false,
                "180": false,
                "365": false
            },
            "helicopterParent": true
        };
        const result = badgeUtil.reset(badges);

        expect(result.earlyBird).toBe(false);
        expect(result.nightOwl).toBe(false);
        expect(result.helicopterParent).toBe(false);

        for(let key in result.durations) {
            expect(result.durations[key]).toBe(false);
        }

        expect(result.lostAllBadges).toBe(true);
    });
});