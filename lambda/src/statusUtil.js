const isItDaylight = require('./isItDaylight');
const moment = require('moment-timezone');
const SOUND_FX = require('./soundFX');
const util = require('../util');
const ssmlUtil = require('./ssmlUtil');

const WATER_THRESHOLD = 20;


const NO_NEEDS = [
    '<amazon:emotion name="excited" intensity="medium">is healthy.</amazon:emotion>',
    '<amazon:emotion name="excited" intensity="medium">is healthy as an ox. </amazon:emotion>A very <amazon:emotion name="disappointed" intensity="high">prickly ox.</amazon:emotion>',
    'is feeling <amazon:emotion name="excited" intensity="high">healthy and strong.</amazon:emotion>',
    'is <amazon:emotion name="excited" intensity="medium">still going strong.</amazon:emotion>',
    'is <amazon:emotion name="excited" intensity="medium">feeling fit as a fiddle!</amazon:emotion>',
    'feels <amazon:emotion name="excited" intensity="high">like a million bucks!</amazon:emotion>',
    'is feeling <prosody pitch="x-high">fresh</prosody> today! ',
    '<amazon:emotion name="excited" intensity="high">is flourishing.</amazon:emotion>',
    'is in <amazon:emotion name="excited" intensity="high">good shape </amazon:emotion>right now.',
    'is <amazon:emotion name="excited" intensity="high">feeling swell.</amazon:emotion>.'
];

const NO_NEEDS_PROMPTS = [
    '<prosody rate="105%">I have everything I need <prosody pitch="+33%">right here</prosody> for now.</prosody>.',
    '<prosody rate="105%">I have everything I need <prosody pitch="+33%">right here.</prosody>Check back later.</prosody>.',
    '<prosody rate="105%">All is well in this pot.<prosody pitch="+33%">Thanks for checking!</prosody></prosody>',
    '<prosody rate="105%">I\'m in potted <prosody pitch="high">paradise.</prosody><prosody pitch="+33%">No complaints for now!</prosody></prosody>',
    '<prosody rate="105%"><prosody pitch="+20%">I don\'t have any complaints right now.</prosody><prosody pitch="high">Thanks for asking!</prosody></prosody>',
    '<prosody rate="105%"><prosody pitch="+20%">I don\'t need anything right now,</prosody><prosody pitch="high">thank you!</prosody></prosody>',
];

const TWO_NEEDS = [
    "is feeling sick.",
    "isn’t feeling well.",
    "is feeling under the weather.",
    "is looking a bit green. And not in a good way.",
    "is feeling depressed.",
    "is feeling a bit melancholy.",
    "is in a somber mood.",
    "isn’t feeling like themselves.",
    "is a bit out of sorts.",
    "is looking forlorn."    
];

const WISDOM_MESSAGES = [
    
    '<prosody rate="110%">Today I did yoga in the window for 16 hours.</prosody><break time="300ms"/> I\'m best at <break time="300ms"/><prosody volume="x-loud">cactus</prosody> pose.', 
    '<prosody rate="110%">Today a bird flew into the window. I think it meant to build a <break time="300ms"/><prosody volume="x-loud">nest</prosody> in me.</prosody>',
    '<prosody rate="110%">Today a spider made a web between my spines. I was so flattered he pricked me.</prosody>',
    '<prosody rate="110%">Today I meditated for 16 hours.</prosody><break time="300ms"/> I think there was a <break time="300ms"/><prosody rate="75%">spike</prosody>in my brain activity.',
    'This weather we’re having sure <emphasis level="moderate">prickles</emphasis> my fancy.',
    '<prosody rate="110%">Today I watched dogs out the window. It made me <emphasis level="strong">glad</emphasis> that I don’t live near the <prosody pitch="+25%">sidewalk.</prosody></prosody>',
    "Today I watched the grass grow. Fascinating stuff, that grass.",
    '<prosody rate="110%">Today I watched the <emphasis level="moderate">neighbor</emphasis></prosody> <prosody rate="100%">mow the lawn.</prosody> It was <emphasis level="moderate"><prosody volume="x-loud">horrifying.</prosody></emphasis>',
    'I’m feeling very <emphasis level="moderate">succulent </emphasis>today.',
    '<prosody rate="80%"> I\'m feeling a little</prosody><break time=".2s"/> <prosody pitch="+15%">prickly</prosody> today.',
    '<prosody rate="90%">Today I listened to the radio – I wish those talk show guys would get to the</prosody><break time=".2s"/>point<break time=".2s"/> already.',
    '<prosody rate="90%">Today I offered a fly a free hug. I don’t know why he didn’t want one.</prosody>',
    '<prosody rate="90%"> Today I watched a cat do its business in our yard. It was</prosody><break time=".2s"/><prosody pitch="+15%">yucca</prosody>',
    '<prosody rate="90%">Today I sat in the sun. Tomorrow I expect I’ll do the same.</prosody>',
    '<prosody rate="90%">Today I watched the cars go by and wondered why my pot doesn\'t have wheels. Then I wondered where I\'d go.</prosody>',
    '<prosody rate="115%">Today I counted the number of pebbles in my pot.</prosody><break time="300ms"/> No, I haven\'t lost all my <break time="150ms"/><prosody volume="x-loud">rocks.</prosody></lang>',
    '<prosody volume="x-loud">Agahvay</prosody><break time="80ms"/> <prosody rate="115%">myself</prosody> a B+ for my cactus puns.',
    '<prosody rate="120%">Today I asked the spider living in my spines if he’d ever</prosody><break time="300ms"/> <prosody rate="75%">leaf</prosody>me. <prosody rate="120%">He didn’t get my joke. I don’t think he likes me.</prosody>',
    'I just wanted to tell you that <emphasis level="moderate">Aloe you vera much </emphasis>',
    'Today I listened to a dog bark all day. I wonder what it was so <emphasis level="moderate">stuck on.</emphasis>',
    'Today was a <prosody pitch="+40%">good day.</prosody> I hope your day was <prosody pitch="+40%">plant-tastic.</prosody>',
    'I\'m <prosody pitch="+40%">really enjoying this window.</prosody> I think <emphasis level="moderate">it was mint</emphasis> to be.',
    'I survive on photosynthesis alone. <emphasis level="moderate">Like a moss.</emphasis>',
    '<prosody rate="115%">Today a fly kept landing on me. I asked him to </prosody><break time="300ms"/> <prosody rate="75%">leaf</prosody>me alone.',
    'Today I watched a pizza delivery driver bring a pizza. I\'ve never eaten pizza but it looks <break time="300ms"/> <emphasis level="moderate">yucca.</emphasis>',
    'Today the fire alarm went off. I tried to<break time="300ms"/> <emphasis level="moderate">row main</emphasis>calm.',
    'Today I saw a firetruck come. It turned out to be no <break time="300ms"/> <emphasis level="strong">fig deal.</emphasis>',
    'I\'m really growing quite <break time="300ms"/> <emphasis level="strong">frond</emphasis> of this window.',
    'Today I met a catapillar. He was looking <break time="300ms"/><emphasis level="strong">Sharp.</emphasis>',
    'Today I wondered what it might be like to ride a bike. I decided that would be a <break time="300ms"/> <emphasis level="strong">thorny </emphasis>proposition.',
    // TODO: Refactor 
    `<prosody rate="90%">The cat taught me this today. It means \'I love you\'.</prosody> ${SOUND_FX.CAT_PURR}`,
    `<prosody rate="90%">The dog taught me this today. It means go away or I’ll eat you. </prosody> ${SOUND_FX.DOG_BARK_TWICE} ${SOUND_FX.DOG_GROWL}`,
    `<prosody rate="90%">The dog taught me this today. It means I’m hungry. </prosody> ${SOUND_FX.DOG_BARK_ONCE}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.OCEAN_WAVE_SURF}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.BIRD_FOREST_01} ${SOUND_FX.BIRD_FOREST_02}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.HORROR}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.SNOWMOBILE}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.MUSICAL_DRONE}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.BASKETBALL}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.FOOTBALL}`,
    `<prosody rate="90%">When I have a<prosody volume="x-loud"> thorny</prosody> day, I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.CAR_ACCELERATE}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.TOILET_FLUSH}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.GAME_SHOW}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.CHRISTMAS_01} ${SOUND_FX.CHRISTMAS_02}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.FIREPLACE_CRACKLE}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.FAIRY_MELODIC_CHIMES}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.CROWDS}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.FISHING_POLE_07} ${SOUND_FX.FISHING_POLE_05}`,
    `<prosody rate="90%">When I get sand in my <prosody volume="x-loud"> spines,</prosody> I find my <prosody pitch="high">happy</prosody> place. Today my happy place is … </prosody> ${SOUND_FX.THUNDER}`,
    
    // TODO Get ssml for this message
    // "Today I ate a fly. I don't think it agreed with my stomach. <sound FX>",

];

const getNeeds = function(profile) {

    const isDaylight = isItDaylight(profile.cactus.latestInteraction, profile.timeZone);

    const needs = {
        water: false,
        comfort: false,
    };

    if (profile.cactus.waterLevel <= 0) {
        needs.water = true;
    }

    if ((isDaylight && profile.cactus.blindState === 'closed')
            || (!isDaylight && profile.cactus.blindState === 'open')) {
        needs.comfort = true
    } 

    return needs;
}

const getStatus = function(profile) {
    const needs = getNeeds(profile);

    const status = {
        alive: true,
        needs: needs
    };

    let statusMessage;
    let prompt = "";
    // Determined that the cactus is dead.
    if (profile.cactus.healthLevel <= 0 
            || profile.cactus.waterLevel >= WATER_THRESHOLD 
            || profile.cactus.waterLevel <= (-1 * WATER_THRESHOLD)) {

        // dehydration, >= -20 water
        // drowning,   <=20 water
        // neglect,    0 health

        status.alive = false;

        let causeOfDeath = "neglect";
        if (profile.cactus.waterLevel <= (-1 * WATER_THRESHOLD)) {
            causeOfDeath = "dehydration";
        } else if (profile.cactus.waterLevel >= WATER_THRESHOLD) {
            causeOfDeath = "drowning";
        }
        status.causeOfDeath = causeOfDeath;
    
        statusMessage = `${SOUND_FX.DEATH_TONE} ${getDeathNote(profile.cactus.name, causeOfDeath)} `;
        prompt = "Want to start over with a new cactus?";
    }
    // has no needs
    else if (!needs.water && !needs.comfort) { // has no needs
        const wisdom = ssmlUtil.wrapCactusVoice(profile, util.getRandomItemFromList(WISDOM_MESSAGES));
        statusMessage = `${profile.cactus.name} ${util.getRandomItemFromList(NO_NEEDS)} ${wisdom}`;
        prompt =  ssmlUtil.wrapCactusVoice(profile, util.getRandomItemFromList(NO_NEEDS_PROMPTS));
    }
    // else it has needs
    else {
        if (needs.water || needs.comfort) { // has one need
            
            // TODO: move this to API gateway and make sure that the items are not global 
            const ONE_NEED = [
                `${profile.cactus.name} is feeling fine.`,
                `${profile.cactus.name} is feeling just fine.`,
                `All is OK with ${profile.cactus.name}.`,
                `All is fine with ${profile.cactus.name}.`,
                `${profile.cactus.name} is feeling just OK.`,
                `${profile.cactus.name} is feeling indifferent.`,
                `${profile.cactus.name} is doing alright.`,
                `${profile.cactus.name} is doing alright, considering the circumstances.`,
                `${profile.cactus.name} is feeling neutral right now.`,
                `${profile.cactus.name} is feeling a bit blase.`, 
            ];
            
            statusMessage = util.getRandomItemFromList(ONE_NEED);
            
        } else { // has two needs
            
            statusMessage = `${profile.cactus.name} ${util.getRandomItemFromList(TWO_NEEDS)}`;
        }
        
        if(needs.water) {
            prompt = `You can water ${profile.cactus.name}.`;
        }
        
        if (needs.water && needs.comfort) {
            prompt += " or ";
        }
        
        if (needs.comfort) {
            prompt +=  ` you can ${profile.cactus.blindState === 'closed' ?  'open' : 'close'} the blinds.`;
        }
        
        if (needs.water && needs.comfort) {
            prompt += " Which do you want?";
        }

    }
    //TODO: Ask Alison what to prompt after cactus wisdom for no needs.

    status.message = `${statusMessage} ${prompt}`;
    status.reprompt = `${prompt}`;

    return status;
};

const computeStatus = function(profile, latestInteraction, timeZone) {

    // console.log('starting computeStatus:', latestInteraction);
    const cactus = profile.cactus;
    
    const lastUpdated = moment(cactus.lastUpdated);
    const dayOfBirth = moment(cactus.dayOfBirth);

    const daysAlive = moment.duration(latestInteraction.diff(dayOfBirth));
    cactus.daysAlive = Math.floor(daysAlive.asDays());

    const hoursSinceLastUpdate = moment.duration(latestInteraction.diff(lastUpdated)).asHours();


    // console.log('latest:', latestInteraction, 'lastUpdated:', lastUpdated);
    // console.log(hoursSinceLastUpdate);

    //TODO: investigate if it's better to take the floor or the ceiling of the
    // hoursSinceLastUpdate to determine how many times to loop through the simulation.

    if (hoursSinceLastUpdate >= 1) {
        // run the simulation
        // console.log('perform the update');

        for(let i = 0; i < Math.floor(hoursSinceLastUpdate) && cactus.healthLevel > 0; i++) {
            // JBNunn effect - sun bias
            cactus.waterLevel -= 1;

            // health decrementors

            // subtract 7  water level is less than 0
            let healthDecrementor = 0;
            if (cactus.waterLevel <= 0) {
                healthDecrementor += 7;
            }

            // console.log('computeStatus', cactus.latestInteraction);

            // subtract 7 if cold or lacks sunlight
            if ((isItDaylight(lastUpdated, timeZone) && cactus.blindState === 'closed') 
                    || (!isItDaylight(lastUpdated, timeZone) && cactus.blindState === 'open') ) {
                healthDecrementor += 7;
            } 

            // health incrementor
            let healthIncrementor = 0;
            if (cactus.healthLevel >= 50) {
                healthIncrementor += 10;
            } else if (cactus.healthLevel <= 10) {
                healthIncrementor += 3;
            } else {
                healthIncrementor += 5;
            }

            // console.log("health:", cactus.healthLevel, "dec:", healthDecrementor, "inc:", healthIncrementor);

            let result = cactus.healthLevel - healthDecrementor + healthIncrementor;

            // TODO: create a seperate function to calculate status of the cactus.
            // status -> healthy? 
            // does it need water?
            // is it cold?
            if (result > 100) {
                result = 100;
            }

            cactus.healthLevel = result;

            // console.log('healthLevel', cactus.healthLevel);
            cactus.lastUpdated = moment.now();

            lastUpdated.add(1, 'hour');
        }
    }

    // console.log('cactus age',cactus.daysAlive);
    return cactus;
};

const getDeathNote = function(cactusName, causeOfDeath) {
    
    let deathNote = `Here lies ${cactusName}; Its life you took into your hands; `;
    deathNote += "Agreeing to meet their every demand. ";

    switch (causeOfDeath) {
        case "dehydration":
            deathNote += "But inattentive, you were; ";
            deathNote += "there was one task you didn't bother; ";
            deathNote += "and today we learned that even virtual cacti need water. ";
            deathNote += `You forgot to water ${cactusName}. They've perished from dehydration. `;
            break;
        case "drowning":
            deathNote += "But overenthusiastic, you were; ";
            deathNote += "though your intentions were sound; Today we learned at even virtual cacti can drown. ";
            deathNote += `You over-watered ${cactusName}. They've died from drowning. `;
            break;
        // default cod is neglect
        default:
            deathNote += "But slack off, you did, it's plain to see, ";
            deathNote += "And today we learned that even virtual cacti have needs."
            deathNote += `You let ${cactusName}'s heath score drop to 0. `;
            break;
    }
    return deathNote;
}

module.exports = {
    getStatus,
    getNeeds,
    computeStatus,
    getDeathNote
}