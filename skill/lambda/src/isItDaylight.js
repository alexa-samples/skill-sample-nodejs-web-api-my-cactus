'use strict';

const moment = require("moment-timezone");

const isItDaylight = function(timeStamp, timeZone) {
    
    let isDayTime = false;
    const time =  moment(timeStamp).tz(timeZone);
    
    // console.log('isItDaylight - hour:', time.hour(), 'timeZone:', timeZone);
    
    // 8:00 - 19:59  = day
    // 20:00 - 7:59 = night
    if (time.hour() >= 8 && time.hour() < 20 ) {
        isDayTime = true;
    }
    return isDayTime;
};

module.exports = isItDaylight;