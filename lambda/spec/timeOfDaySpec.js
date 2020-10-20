
const timeOfDay = require('../src/timeOfDay');

describe('timeOfDay', function() {

    // all times are 10/6/2020 - times are on the hour unless specified in comment
    const six_am = 1601989200000;
    const five_am = 1601989199000; // 5:59:59
    const nine_am = 1602000000000;
    const ten_am = 1602003600000;
    const nine_pm = 1602046799000 // 9:59:59
    const ten_pm = 1602046800000;
    const timeZone = "America/Los_Angeles";

    it('should be afternoon', function() {

        const ten_am_actual = timeOfDay(ten_am, timeZone);
        const nine_pm_actual = timeOfDay(nine_pm, timeZone)
        expect(ten_am_actual).toBe(0);
        expect(nine_pm_actual).toBe(0);
    });

    it('should be morning', function() {

        const six_am_actual = timeOfDay(six_am, timeZone);
        const nine_am_actual = timeOfDay(nine_am, timeZone)

        expect(six_am_actual).toBe(1);
        expect(nine_am_actual).toBe(1);
    });
    
    it('should be night', function() {

        const ten_pm_actual = timeOfDay(ten_pm, timeZone);
        const five_am_actual = timeOfDay(five_am, timeZone);

        expect(ten_pm_actual).toBe(-1);
        expect(five_am_actual).toBe(-1);

    });
});