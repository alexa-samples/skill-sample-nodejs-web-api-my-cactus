'use strict';

const badgeUtil = require('./badgeUtil');
const isItDaylight = require('./isItDaylight')
const moment = require('moment-timezone');

const cleanUpCactus = function(profile) {

    const newCactus = defaultCactus(profile.timeZone);

    profile.cactus = newCactus;
    profile.unlockedBadges = badgeUtil.reset(profile.unlockedBadges);

    profile.timesChecked = 1;

    return profile;
};

const defaultCactus = function(timeZone) {
    return {
        waterLevel: 5, //TODO: thinking about randomly generating this with a threshold
        healthLevel: 100,
        dayOfBirth: moment.now(), //TODO: rename to dateOfBirth
        daysAlive: 0,
        blindState: `${isItDaylight(moment.now(), timeZone) ? 'closed' : 'open'}`,
        lastUpdated: moment.now()
    };
};

const defaultProfile = function (timeZone) {

    return {
        cactus: defaultCactus(timeZone),
        lifeTime: {
          waterUnits: 0
          
        },
        unlockedBadges: {
            latest: '',
            waterUnits: [],
            earlyBird: false,
            nightOwl: false,
            durations: {},
            helicopterParent: false
        },
        timesChecked: 0,
        latestInteraction: moment.now()
    };
};

module.exports = {
    cleanUpCactus,
    defaultCactus,
    defaultProfile
}
