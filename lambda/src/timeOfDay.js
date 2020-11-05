const moment = require("moment-timezone");

// determines time of day either, morning, afternoon, night
// returns:
// -1 Night
//  0 Afternoon
//  1 Morning
const timeOfDay = function(timeStamp, timeZone) {
    const time = moment(timeStamp).tz(timeZone);

    let result = 0;

    // 6 - 9 = morning
    if (time.hour() >= 6 && time.hour() < 10) {
        result = 1;
    } else if(time.hour() >= 22 || time.hour() >=0 && time.hour() < 6) { // 10 pm to 6 am = night
        result = -1;
    }

    return result;
};

module.exports = timeOfDay;