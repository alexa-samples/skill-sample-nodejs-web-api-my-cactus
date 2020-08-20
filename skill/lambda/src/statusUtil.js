const isItDaylight = require('./isItDaylight');
const moment = require('moment-timezone');
const SOUND_FX = require('./soundFX');

const WATER_THRESHOLD = 20;

const NO_NEEDS = [
    "is healthy.",
    "is healthy as an ox. A very prickly ox.",
    "is feeling healthy and strong.",
    "is still going strong.",
    "is feeling fit as a fiddle.",
    "feels like a million bucks.",
    "is feeling fresh today.",
    "is flourishing.",
    "is in good shape right now.",
    "is feeling well."
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
    "Today I did yoga in the window for 16 hours. I'm best at cactus pose.",
    "Today a bird flew into the window. I think it meant to build a nest in me.",
    "Today a spider made a web between my spines. I was so flattered he pricked me.",
    "Today I meditated for 16 hours. I think there was a spike in my brain activity.",
    "This weather we're having sure prickles my fancy.",
    "Today I watched dogs out the window. It made me glad that I don't live near the sidewalk.",
    "Today I watched the grass grow. Fascinating stuff, that grass.",
    "Today I watched the neighbor mow the lawn. It was horrifying.",
    "I'm feeling very succulent today.",
    "I'm feeling a little prickly today.",
    "Today I listened to the radio – I wish those talk show guys would get to the point.",
    "Today I offered a fly a free hug. I don't know why he didn't want one.",
    "Today I watched a cat do its business in our yard. It was yucca.",
    "Today I sat in the sun. Tomorrow I expect I'll do the same.",
    "Today I watched the cars go by and wondered why my pot doesn't have wheels. Then I wondered where I'd go.",
    "Today I counted the number of pebbles in my pot. No, I haven't lost all my rocks.",
    "Today I asked the spider living in my spines if he'd ever leaf me. He didn't get my joke. I don't think he likes me.",
    "I just wanted to tell you that Aloe you vera much.",
    "Today I listened to a dog bark all day. I wonder what it was so stuck on.",
    "Today was a good day. I hope your day was plant-tastic.",
    "I'm really enjoying this window. I think it was mint to be.",
    "I survive on photosynthesis alone – like a moss.",
    "Today a fly kept landing on me. I asked him to leaf me alone.",
    "Today I watched a pizza delivery driver bring a pizza. I've never eaten pizza but it looks yucca.",
    "Today the fire alarm went off. I tried to romaine calm.",
    "Today I saw a firetruck come. It turned out to be no fig deal.",
    "I'm really growing quite frond of this window.",
    "Today I met a caterpillar. He was looking sharp.",
    "Today I wondered what it might be like to ride a bike. I decided that would be a thorny proposition.",
    //TODO: Replace with actual sound effect
    "Today I ate a fly. I don't think it agreed with my stomach. <sound FX>",
    "The cat taught me this today. It means 'I love you' <purr sound FX>",
    "The dog taught me this today. It means go away or I'll eat you. <dog bark FX> ",
    "The dog taught me this today. It means I'm hungry. <dog bark FX> ",
    "When I have a thorny day, I find my happy place. Today my happy place is ... <place sound FX>",
    "When I get sand in my spines, I find my happy place. Today my happy place is ... <place sound FX>",    
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
    
        statusMessage = `${SOUND_FX.DEATH_TONE} ${profile.cactus.name} ${getDeathNote(causeOfDeath)} `;
        prompt = "Want to start over with a new cactus?";
    }
    // otherwise it has needs
    else {
        
        if (!needs.water && !needs.comfort) {
            statusMessage = `${profile.cactus.name} ${getRandomItemFromList(NO_NEEDS)} ${getRandomItemFromList(WISDOM_MESSAGES)}`;        
        } else if (needs.water || needs.comfort) {
            
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
            
            statusMessage = getRandomItemFromList(ONE_NEED);
            
        } else {
            
            statusMessage = `${profile.cactus.name} ${getRandomItemFromList(TWO_NEEDS)}`;
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

const getRandomItemFromList = function(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

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

    // console.log('final health level', cactus.healthLevel);
    // console.log('cactus age',cactus.daysAlive);
    return cactus;
};

const getDeathNote = function(causeOfDeath) {
    
    let deathNote;

    switch (causeOfDeath) {
        case "dehydration":
            deathNote = "Insert dehydration message here. ";
            break;
        case "drowning":
            deathNote = "Insert drowning message here. ";
            break;
        // default cod is neglect
        default:
            deathNote = "Insert neglect message here. ";
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