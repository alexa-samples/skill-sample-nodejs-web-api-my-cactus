// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const util = require('util.js');

const moment = require('moment-timezone');
// const isItDaylight = require('./isItDaylight');


// BIG TODOS:
// 0. Refactor Code into other other seperate files (add the jasmine node and unit tests to the github project)
// 1. Address what to when the user says NO
// 2. SSML additions 
// 3. DEATH_NOTES - Split based upon cause of death

// Bug Bash


const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
//TODO change this URL to your publicly accessible HTTPS endpoint.
const webAppBaseURL = "https://502df56c596e.ngrok.io";

const MESSAGE_REQUEST = 'Alexa.Presentation.HTML.Message';
const WATER_INCREMENT = 10;
const WATER_THRESHOLD = 20;
const HELICOPTER_THRESHOLD = 2;

const WATER_LEVEL_PER_LITER = 84;


const FX_WATER = '<audio src="soundbank://soundlibrary/household/water/pour_water_01"/>';
const FX_SLURP = '<audio src="soundbank://soundlibrary/human/amzn_sfx_drinking_slurp_01"/>';
const FX_BOING = '<audio src="soundbank://soundlibrary/cartoon/amzn_sfx_boing_med_1x_02"/>';
const FX_SHORT_CHIME = '<audio src="soundbank://soundlibrary/musical/amzn_sfx_bell_short_chime_02"/>';

const FX_STARTUP_TONE = '<audio src="soundbank://soundlibrary/video_tunes/video_tunes_07"/>';
const FX_DESTINATION_TONE = '<audio src="soundbank://soundlibrary/video_tunes/video_tunes_10"/>';
const FX_DEATH_TONE = '<audio src="soundbank://soundlibrary/video_tunes/video_tunes_05"/>';

const DEATH_NOTES = [
    "is dead.",
    "has passed away.",
    "has met a sandy grave.",
    "has croaked.",
    "has expired.",
    "has succumbed to neglect.",
    "has kicked the bucket.",
    "has gone to meet its maker. Whoever that was.",
    "has departed for greener pastures. Or maybe it was sandier deserts. Anyway ...",
    "has returned to the great cactus patch in the Amazon cloud."
];

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
    "The cat taught me this today. It means ‘I love you'” <purr sound FX>",
    "The dog taught me this today. It means go away or I'll eat you. <dog bark FX> ",
    "The dog taught me this today. It means I'm hungry. <dog bark FX> ",
    "When I have a thorny day, I find my happy place. Today my happy place is ... <place sound FX>",
    "When I get sand in my spines, I find my happy place. Today my happy place is ... <place sound FX>",
    "Cacti <break time='.2s'/>+ Cact, you <break time='.3s'/>= Cact, us."
];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        let speakOutput = `${FX_STARTUP_TONE} Your shelf is empty, but don\'t despair. `; 
        speakOutput += 'I\'m here to pair you with the right prickly pear. ';
        speakOutput += 'Water, food, and light is what it needs. ';
        speakOutput += 'Treat your succulent well, and it\'ll reward your good deeds. ';
        
        speakOutput += 'To choose just the right cactus that needs your assistance, tell me ';
        speakOutput += 'If you could go anywhere in the world, where would you visit?';
        conditionallyLaunchWebApp(handlerInput);
        
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function conditionallyLaunchWebApp(handlerInput) {
    if(supportsHTMLInterface(handlerInput)) {
        console.log("Supports HTML");
        
        handlerInput.responseBuilder.addDirective({
            type:"Alexa.Presentation.HTML.Start",
            data: createStateFromSessionAttr(handlerInput.attributesManager.getSessionAttributes()),
            request: {
                uri: webAppBaseURL + "/dist/",
                method: "GET"
            },
            configuration: {
               "timeoutInSeconds": 300
            }});
    }
}

function createStateFromSessionAttr(sessionAttrs) {
    let dataPayload = sessionAttrs;
    return dataPayload;
}

function supportsHTMLInterface(handlerInput) {
    const supportedInterfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
    const htmlInterface = supportedInterfaces['Alexa.Presentation.HTML'];
    console.log(supportedInterfaces);
    
    return htmlInterface !== null && htmlInterface !== undefined;
}

const HasCactusLaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
    
        const attributesManager = handlerInput.attributesManager;
        let profile = attributesManager.getSessionAttributes();
        
        const status = getStatus(profile);
        
        let speakOutput = status.message;
        
        if ( profile.cactus.healthLevel <= 0 ) {
            speakOutput = `${FX_DEATH_TONE} ${profile.cactus.name} ${getRandomItemFromList(DEATH_NOTES)} `;
            speakOutput += "Want to start over with a new cactus?";
            
            profile = cleanUpCactus(profile);
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);   
            
        }
        
        conditionallyLaunchWebApp(handlerInput);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const hasCactusCaptureDestinationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureDestination'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput){
        return handlerInput.responseBuilder
            .speak('We already have a cactus')
            .getResponse();
    }
}

const CaptureDestinationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureDestination';
    },
    async handle(handlerInput) {
        
        const profile = getProfile(handlerInput);
        const name = await getRandomName();
        profile.cactus.name = name.replace(/"/g,"");    
        //TODO: save the destination and determine a flower color
        
        console.log("CaptureDestinationHandler", JSON.stringify(profile));
        
        const attributesManager =  handlerInput.attributesManager;
    
        attributesManager.setPersistentAttributes(profile);
        attributesManager.savePersistentAttributes();
        
        let speakOutput = `${FX_DESTINATION_TONE} I found the perfect cactus for you. `;
        speakOutput += `Meet ${name}. `;
        speakOutput += 'They need water and sunlight to thrive. ';
        speakOutput += 'They\'re just a sprout right now, but keep them happy ';
        speakOutput += 'and they\'ll grow a little each day. ';
        
        speakOutput += 'You can ask me to water - but not too much! ';
        speakOutput += 'Or you can ask me to open and close the blinds. ';
    
        let repromptOutput = `${name} needs sun, you can open the blinds`;        
        
        if (profile.cactus.blindState === "open") {
            repromptOutput = `${name} is cold, gets chilly at night! You can close the blinds.`;        
        }
        
        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"newCactus",
                    "playAnimation": true,
                    "gameState": profile
                }
            });
        }
        
        
        return handlerInput.responseBuilder
            .speak(speakOutput + repromptOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const WaterCactusIntentHandler = {
    canHandle(handlerInput) { // Check for existence of HTML Message OR an intent Request and perform the same actions.
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaterCactusIntent') ||
            (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'WaterCactusIntent');
    },
    handle(handlerInput) {
        let profile = getProfile(handlerInput);
        
        profile.cactus.waterLevel += WATER_INCREMENT;
        profile.lifeTime.waterUnits += WATER_INCREMENT;
        
        let speakOutput = `${FX_WATER} ${FX_SLURP} Thanks. I'm feeling like a fish in water again.`;
        
        
        //TODO: talk with Alison about warning messages about over watering 
        //TODO: figure out max waterLevel based upon cactus size (no hardcoding to 20)
        if (profile.cactus.waterLevel > WATER_THRESHOLD) {
          
            speakOutput = `Oh no! You've overwatered ${profile.cactus.name}. ${FX_DEATH_TONE} ${profile.cactus.name} ${getRandomItemFromList(DEATH_NOTES)} `;
            speakOutput += "Want to start over with a new cactus?";
            
            profile = cleanUpCactus(profile);
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);   
            
            // TODO: investigate what to do about latestInteraction
            
        }
        
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setPersistentAttributes(profile);
        attributesManager.savePersistentAttributes();
        attributesManager.setSessionAttributes(profile);

        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"water",
                    "playAnimation": Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest',
                    "gameState": profile
                }
            });
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const HasCactusYesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('You already have a cactus.')
            .reprompt('You already have a cactus.')
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        return LaunchRequestHandler.handle(handlerInput);
    }
};


// TODO: Ask Alison for new rejection response.
const DeadCactusNoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
            && !getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Aw too bad. The next time you open the skill, you can start over again.')
            .getResponse();
    }
};

// TODO: Ask Alison for a better response.
const HasCactusNoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("You already have a cactus that's alive and well. You water the water the cactus, or open and close the blinds. Which will it be?")
            .reprompt("You already have a cactus that's alive and well. You water the water the cactus, or open and close the blinds. Which will it be?")
            .getResponse();
    }
};


/**
 * Simple handler for logging messages sent from the webapp
 */
const WebAppCloudLogger = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'log';
    },
    handle(handlerInput) {
        const messageToLog = handlerInput.requestEnvelope.request.message.log;
        console.log(messageToLog);
        return handlerInput.responseBuilder
            .getResponse();
    }
}

function getMessageIntent(requestEnvelope) {
    const requestMessage = requestEnvelope.request.message;
    if(requestMessage) {
        if(requestMessage.intent) {
            return requestMessage.intent;
        }
    }
    return null; // Otherwise no intent found in the message body
}

// TODO: come up with a "database" of badge and their metadata
// create an unlock table that tracks when a badge was unlocked for a user
const ShowBadgesIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ShowBadgesIntent') || 
            (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'ShowBadgesIntent');
    },
    handle(handlerInput) {
        const profile = getProfile(handlerInput);
        const latest = profile.unlockedBadges.latest;
        
        let speakOutput = "You haven't unlocked any badges yet. Keep playing and I'm sure you'll unlock something. ";
        
        if (latest !== '') { 
            speakOutput = `Your last unlocked badge is ${latest} `;
        }

        speakOutput += "What would you like to do?";
        
        handlerInput.responseBuilder.addDirective({
            "type":"Alexa.Presentation.HTML.HandleMessage",
            "message": {
                "intent":"showBadges",
                "playAnimation": true,
                "gameState": getProfile(handlerInput)
            }
        });
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetStatusIntentHandler = {
    canHandle(handlerInput) {
        return getProfile(handlerInput).cactus.name && (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetStatusIntent') 
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'GetStatusIntent');
    },
    handle(handlerInput) {
        //TODO add the status to the frontend and respond with appropriate message directive
        const profile = getProfile(handlerInput);
        
        console.log('GetStatusIntentHandler', JSON.stringify(profile));
        
        const status = getStatus(profile);
        
        const speakOutput = status.message;
        
        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"getStatus",
                    "playAnimation": true,
                    "gameState": profile
                }
            });
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const OpenBlindsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenBlindsIntent';
    },
    handle(handlerInput) {
        // const speakOutput ="";
        
        // return handlerInput.responseBuilder
        //     .speak(speakOutput)
        //     .reprompt(speakOutput)
        //     .getResponse();
        return LaunchRequestHandler.handle(handlerInput);
    }
};

const HasCactusOpenBlindsIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenBlindsIntent') ||
            (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'OpenBlindsIntent')
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        
        let speakOutput = `${FX_BOING} But ... the blinds are already open.`;
        
        const profile = getProfile(handlerInput);
        
        if (profile.cactus.blindState !== 'open') {
            
            speakOutput = `${FX_SHORT_CHIME} I better get my sunglasses`;
            
            profile.cactus.blindState = "open";    
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
        
            attributesManager.setSessionAttributes(profile);            
        }
        
        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"blindsUp",// only play animation when it is a voice request.
                    "playAnimation": Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest',
                    "gameState": profile
                }
            });
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const CloseBlindsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CloseBlindsIntent';        
    },
    handle(handlerInput) {
        return LaunchRequestHandler.handle(handlerInput);
    }
};

const HasCactusCloseBlindsIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CloseBlindsIntent')
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'CloseBlindsIntent')
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        
        let speakOutput = `${FX_BOING} But ... the blinds are already closed.`;
        
        const profile = getProfile(handlerInput);
        
        if (profile.cactus.blindState !== "closed") {
            speakOutput = `${FX_SHORT_CHIME} Hey who turned out all the lights?`;
        
            profile.cactus.blindState = "closed";
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);            
        }
        
        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"blindsDown",// only play animation when it is a voice request.
                    "playAnimation": Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest',
                    "gameState": profile
                }
            });
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const FallbackMessageRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST;
    },
    handle(handlerInput) {
        console.warn("Failed to find request hander for message: " + handlerInput.requestEnvelope.request.message);
        return handlerInput.responseBuilder
            .getResponse();
    }
}


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Help Intent';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const getTimeZone = async function(handlerInput) {
    const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope);
    const serviceClientFactory = handlerInput.serviceClientFactory;
    
    let userTimeZone;
    try {
        const upsServiceClient = serviceClientFactory.getUpsServiceClient();
        userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
        
    } catch (error) {
        if (error.name !== 'ServiceError') {
            return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
        }
        console.log('error', error.message);
    }    
    
    return userTimeZone
}

const isItDaylight = function(timeStamp, timeZone) {
    
    let isDayTime = false;
    const time =  moment(timeStamp).tz(timeZone);
    
    console.log('isItDaylight - hour:', time.hour(), 'timeZone:', timeZone);
    
    // 8:00 - 19:59  = day
    // 20:00 - 7:59 = night
    if (time.hour() >= 8 && time.hour() < 20 ) {
        isDayTime = true;
    }
    return isDayTime;
};

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

    let statusMessage;
    if (!needs.water && !needs.comfort) {
        //Cactus is happy
        profile.cactus.happiness = 1;
        statusMessage = `${profile.cactus.name} ${getRandomItemFromList(NO_NEEDS)} ${getRandomItemFromList(WISDOM_MESSAGES)}`;        
    } else if (needs.water || needs.comfort) {
        //cactus is nuetral
        profile.cactus.happiness = 0;
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
        //Sad cactus
        profile.cactus.happiness = -1;

        statusMessage = `${profile.cactus.name} ${getRandomItemFromList(TWO_NEEDS)}`;
    }
    
    let prompt = "";
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

    //TODO: Ask Alison what to prompt after cactus wisdom for no needs.
    needs.message = `${statusMessage} ${prompt}`;

    return needs;
};

const computeStatus = function(profile, latestInteraction, timeZone) {

    console.log('starting computeStatus:', latestInteraction);
    const cactus = profile.cactus;
    
    const lastUpdated = moment(cactus.lastUpdated);
    const dayOfBirth = moment(cactus.dayOfBirth);

    const daysAlive = moment.duration(latestInteraction.diff(dayOfBirth));
    cactus.daysAlive = Math.floor(daysAlive.asDays());

    const hoursSinceLastUpdate = moment.duration(latestInteraction.diff(lastUpdated)).asHours();


    console.log('latest:', latestInteraction, 'lastUpdated:', lastUpdated);
    console.log(hoursSinceLastUpdate);

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

    return cactus;
};


// TODO: use cactus.daysAlive instead of actualDuration because we already have computed it :)
const evaluateBadges = function(profile, currentTime) {

    const unlockedBadges = profile.unlockedBadges;
    profile.newBadge = false;// Currently one turn behind since this is run in the request interceptor.

    const waterUnits = profile.lifeTime.waterUnits;
    const waterThreshold = Math.pow(2, unlockedBadges.waterUnits.length) * 100;    

    if(waterUnits > 99 && waterUnits >= waterThreshold) {
        // update the badges
        unlockedBadges.waterUnits.push(waterUnits);
        profile.unlockedBadges.latest = `Lifetime water units for giving your cactus over ${waterThreshold} units of water.`;
    }

    // early bird badge rules check
    if(currentTime.hour() >= 4 && currentTime.hour() <= 7) {
        if(!unlockedBadges.earlyBird) {
            profile.unlockedBadges.latestKey = "earlyBird";
            profile.newBadge = true;
        }
        unlockedBadges.earlyBird = true;
        unlockedBadges.latest = 'The early badge for checking your cactus between the hours of 4 to 7 am.';
    }

    // night owl badge rules check
    if(currentTime.hour() == 0 && (currentTime.hour() <= 3 && currentTime.minutes()) <= 59 ) {
        if(!unlockedBadges.nightOwl) {
            profile.unlockedBadges.latestKey = "nightOwl";
            profile.newBadge = true;
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
            profile.unlockedBadges.latestKey = "helicopterParent";
            profile.newBadge = true;
        }
        unlockedBadges.helicopterParent = true;
        unlockedBadges.latest = `For hovering over your cactus like a helicopter parent by checking on your cactus ${HELICOPTER_THRESHOLD} times in one day.`
    }

    return unlockedBadges
}

const resetBadges = function(badges) {

    badges.earlyBird = false;
    badges.nightOwl = false;
    badges.helicopterParent = false;

    for(let key in badges.durations) {
        badges.durations[key] = false;
    }

    // callout for OxygenBox :)
    badges.lostAllBadges = true;

    return badges;
};


// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `<amazon:emotion name="disappointed" intensity="high">Justin you broke the code.</amazon:emotion>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const getProfile = function (handlerInput) {
    return handlerInput.attributesManager.getSessionAttributes();
};

const NewSessionRequestInterceptor = {
  async process(handlerInput) {
    console.log('NewSessionRequestInterceptor:', JSON.stringify(handlerInput.requestEnvelope.request));
    
    const profile = getProfile(handlerInput);

    if (handlerInput.requestEnvelope.session.new && profile.cactus.name) {
        
        const currentDateTime = moment.tz(profile.timeZone);
        const latestInteraction = moment(profile.latestInteraction).tz(profile.timeZone);
        
        console.log("current date:", currentDateTime.dayOfYear(), "latestInteraction:", latestInteraction.dayOfYear());
        
        if (currentDateTime.dayOfYear() !== latestInteraction.dayOfYear()) {
            profile.timesChecked = 0;
        }
        profile.timesChecked += 1;
        
        handlerInput.attributesManager.setPersistentAttributes(profile);
        handlerInput.attributesManager.savePersistentAttributes();
    }
  }
};


// TODO: rename to LoadProfileRequestInterceptor
const loadProfileInterceptor = {
    async process(handlerInput) {
        console.log("WHOLE REQUEST: " + JSON.stringify(handlerInput.requestEnvelope));
        const attributesManager = handlerInput.attributesManager;
        
        let profile = await attributesManager.getPersistentAttributes();

        const timeZone = await getTimeZone(handlerInput);
        console.log("loadProfileInterceptor - timezone", timeZone);
        
        // If no profile initiate a new one - first interaction with skill
        if (!profile.hasOwnProperty("cactus")) {
            profile = await defaultProfile(handlerInput);
            console.log('initializing profile', profile);
        } else {
            profile.cactus = computeStatus(profile, moment(), timeZone);
            evaluateBadges(profile, moment());
        }
        
        profile.timeZone = timeZone;
        
        attributesManager.setSessionAttributes(profile);
        console.log("loadProfileInterceptor", JSON.stringify(attributesManager.getSessionAttributes()));
    }
}

const UpdateLatestInteractionResponseInterceptor = {
    process(handlerInput) {
        const profile = getProfile(handlerInput);
        
        //console.log("UpdateLatestInteractionResponseInterceptor", JSON.stringify(profile))
        
        profile.latestInteraction = moment.now();
        
        handlerInput.attributesManager.setPersistentAttributes(profile);
        handlerInput.attributesManager.savePersistentAttributes();
    }
}

const defaultCactus = function(timeZone) {
    return {
        waterLevel: 5, //TODO: thinking about randomly generating this with a threshold
        healthLevel: 100,
        waterMax: WATER_THRESHOLD,//TODO make this not static
        dayOfBirth: moment.now(), //TODO: rename to dateOfBirth
        daysAlive: 0,
        blindState: `${isItDaylight(moment.now(), timeZone) ? 'closed' : 'open'}`,
        lastUpdated: moment.now(),
        happiness:0
    };
};

const cleanUpCactus = function(profile) {

    const newCactus = defaultCactus(profile.timeZone);

    profile.cactus = newCactus;
    profile.unlockedBadges = resetBadges(profile.unlockedBadges);

    profile.timesChecked = 1;

    return profile;
};


const defaultProfile = async function (handlerInput) {
    const timeZone = await getTimeZone(handlerInput);

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

// "YYYY-MM-DD HH:mm:ss"

const getNameUrl = "https://5d3pod58ac.execute-api.us-east-1.amazonaws.com/stage/getName";
const cactusAPIHost = "5d3pod58ac.execute-api.us-east-1.amazonaws.com";
const stage = (process.env.environment === 'prod') ? "prod" : "stage" ;
const getNamePath = "getName";


const getRandomName = async function() {
    const options = {
        hostname: cactusAPIHost,
        path: `${stage}/${getNamePath}`, 
        port: 443,
        method: 'GET',
    }
    console.log(JSON.stringify(options))
    return await getHTTP(options);
}

const https = require('https');

function getHTTP(options) {
  return new Promise(((resolve, reject) => {
    const request = https.get(getNameUrl, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
      }

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(returnData);
      });

      response.on('error', (error) => {
          console.log(error);
        reject(error);
      });
    });
    request.end();
  }));
} 

const getRandomItemFromList = function(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        ShowBadgesIntentHandler,
        HasCactusYesIntentHandler,
        YesIntentHandler,
        DeadCactusNoIntentHandler,
        HasCactusNoIntentHandler,
        HasCactusLaunchRequestHandler,
        LaunchRequestHandler,
        hasCactusCaptureDestinationHandler,
        CaptureDestinationHandler,
        WaterCactusIntentHandler,
        WebAppCloudLogger,
        HasCactusOpenBlindsIntentHandler,
        OpenBlindsIntentHandler,
        HasCactusCloseBlindsIntentHandler,
        CloseBlindsIntentHandler,
        GetStatusIntentHandler,
        HelpIntentHandler,
        FallbackMessageRequestHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(
        loadProfileInterceptor,
        NewSessionRequestInterceptor
    )
    .addResponseInterceptors(
        UpdateLatestInteractionResponseInterceptor
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();