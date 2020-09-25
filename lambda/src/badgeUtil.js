const moment = require("moment-timezone");

const HELICOPTER_THRESHOLD = 5;

// TODO: use cactus.daysAlive instead of actualDuration because we already have computed it :)
const evaluate = function(profile, currentTime) {

    const unlockedBadges = profile.unlockedBadges;
    unlockedBadges.newBadge = false;// Currently one turn behind since this is run in the request interceptor.
    unlockedBadges.latestKey = null;
    
    const waterUnits = profile.lifeTime.waterUnits;
    const waterThreshold = Math.pow(2, unlockedBadges.waterUnits.length) * 100;    

    if(waterUnits > 99 && waterUnits >= waterThreshold) {
        // update the badges
        unlockedBadges.waterUnits.push(waterUnits);
        unlockedBadges.latest = `Lifetime water units for giving your cactus over ${waterThreshold} units of water.`;
    }

    // early bird badge rules check
    if(currentTime.hour() >= 4 && currentTime.hour() <= 7) {
        if(!unlockedBadges.earlyBird) {
            unlockedBadges.latestKey = "earlyBird";
            unlockedBadges.newBadge = true;
        }
        unlockedBadges.earlyBird = true;
        unlockedBadges.latest = 'The early badge for checking your cactus between the hours of 4 to 7 am.';
    }

    // night owl badge rules check
    if(currentTime.hour() >= 0 && (currentTime.hour() <= 3 && currentTime.minutes() <= 59 )) {
        if(!unlockedBadges.nightOwl) {
            unlockedBadges.latestKey = "nightOwl";
            unlockedBadges.newBadge = true;
        }
        unlockedBadges.nightOwl = true;
        unlockedBadges.latest = 'The night owl badge for check your cactus from midnight to 3 am.';
    }

    //TODO investigate why changing back to dateOfBirthday still passes tests
    const actualDuration = moment.duration(currentTime.diff(profile.cactus.dayOfBirth));

    const badgeDurations = [
        1,  // 1 day
        3,  // 3 days
        7,  // 1 Week
        14, // 2 weeks
        30, // 1 Month
        90, // 3 months
        180, //6 months
        365, //12 months
    ];

    badgeDurations.forEach((badgeDuration, _) => {
        if(unlockedBadges.durations[badgeDuration]) {
            return;
        }
        if(actualDuration.asDays() >= badgeDuration) {
            unlockedBadges.durations[badgeDuration] = true;
            unlockedBadges.latest = `For keeping your cactus alive for ${badgeDuration} day${badgeDuration == 1 ? '' : 's'}`;
        } else {
            unlockedBadges.durations[badgeDuration] = false;
        }
    });

    //helicopter parent
    if (!unlockedBadges.helicopterParent && profile.timesChecked >= HELICOPTER_THRESHOLD) {
        if(!unlockedBadges.helicopterParent) {
            unlockedBadges.latestKey = "helicopterParent";
            unlockedBadges.newBadge = true;
        }
        unlockedBadges.helicopterParent = true;
        unlockedBadges.latest = `For hovering over your cactus like a helicopter parent by checking on your cactus ${HELICOPTER_THRESHOLD} times in one day.`
    }

    return unlockedBadges
}


const reset = function(badges) {

    badges.earlyBird = false;
    badges.nightOwl = false;
    badges.helicopterParent = false;
    badges.latest = '';

    for(let key in badges.durations) {
        badges.durations[key] = false;
    }

    // callout for OxygenBox :)
    badges.lostAllBadges = true;

    return badges;

};

module.exports = {
    evaluate,
    reset
};