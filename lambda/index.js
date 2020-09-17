// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const util = require('./util.js');

const statusUtil = require('./src/statusUtil');
const badgeUtil = require('./src/badgeUtil');
const profileUtil = require('./src/profileUtil');

const moment = require('moment-timezone');

const SOUND_FX = require('./src/soundFX');

// BIG TODOS:

// 1. SSML additions 

// Bug Bash

// Fix edge condition on prompt when there are no needs.
// HasCactusOpenBlindsIntentHandler
// HasCactusCloseBlindsIntentHandler

//TODO change this URL to your publicly accessible HTTPS endpoint.
const webAppBaseURL = `https://${process.env.Domain}`;

const MESSAGE_REQUEST = 'Alexa.Presentation.HTML.Message';
const WATER_INCREMENT = 10;

// TODO evaluate if we really want to keep this constant since we are not
// really using it now.
const WATER_LEVEL_PER_LITER = 84;

const FALLBACK_REPROMPT = "What would you like to do?";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {

        let speakOutput = `${SOUND_FX.STARTUP_TONE} `;
        speakOutput += 'Your shelf is empty, ';
        speakOutput += 'but <amazon:emotion name="excited" intensity="medium">';
        speakOutput += 'don\’t despair;</amazon:emotion> <break time=".5s"/>';
        speakOutput += 'I\’m here to pair you with the right prickly pear; ';
        speakOutput += '<break time=".5s"/>Water and light are what it ';
        speakOutput += 'needs;<break time=".5s"/>';
        speakOutput += "Treat this succulent well, and they’ll reward your "; 
        speakOutput += 'good deeds!<break time=".1s"/> ';
        speakOutput += 'To choose just the right cactus that needs ';
        speakOutput += '<amazon:emotion name="excited" intensity="medium">your ';
        speakOutput += 'assistance,</amazon:emotion> '
        
        let reprompt = '<break time=".5s"/>';
        reprompt += 'tell me: If you could go anywhere in the world, where ';
        reprompt += 'would <amazon:emotion name="excited" intensity="medium">';
        reprompt += 'you visit?</amazon:emotion>';

        speakOutput += reprompt;
        conditionallyLaunchWebApp(handlerInput);
        handlerInput.responseBuilder.speak(ssmlWrapDomain(speakOutput));
            
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        return handlerInput.responseBuilder
            .reprompt(ssmlWrapDomain(reprompt))
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
                uri: webAppBaseURL + "/dist/index.html",
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

/**
 * Checks if a fireTV is requesting our skill. 
 * If so, use this to NOT include a reprompt to avoid push to talk experience.
 * @param {*} handlerInput 
 */
function isHTMLCapableFireTV(handlerInput) {
    return supportsHTMLInterface(handlerInput) 
            && Alexa.getViewportProfile(handlerInput.requestEnvelope).includes("TV")
}

const HasCactusLaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
    
        const attributesManager = handlerInput.attributesManager;
        let profile = attributesManager.getSessionAttributes();
        
        const status = statusUtil.getStatus(profile);
        
        if (!status.alive) {            
            profile = profileUtil.cleanUpCactus(profile);
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);   
        }
        
        conditionallyLaunchWebApp(handlerInput);
        handlerInput.responseBuilder.speak(status.message);
        
        if(!isHTMLCapableFireTV(handlerInput) && status.reprompt !== '') {
            handlerInput.responseBuilder.reprompt(status.reprompt)    
        }

        return handlerInput.responseBuilder.getResponse();            
    }
};

const hasCactusCaptureDestinationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureDestination'
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput){
        handlerInput.responseBuilder.speak('We already have a cactus')

        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder//TODO, do we need a reprompt?
            .getResponse();
    }
}

const ssmlWrapDomain = function(text) {
    return `<amazon:domain name="long-form">${text}</amazon:domain>`;
};

const CaptureDestinationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureDestination';
    },
    async handle(handlerInput) {
        
        const profile = getProfile(handlerInput);
        const name = await getRandomName();

        profile.cactus.name = name.replace(/"/g,"");
        profile.cactus.voice = util.getRandomItemFromList(["Brian", "Emma"]);
        //TODO: save the destination and determine a flower color
        
        console.log("CaptureDestinationHandler", JSON.stringify(profile));
        
        const attributesManager =  handlerInput.attributesManager;
    
        attributesManager.setPersistentAttributes(profile);
        attributesManager.savePersistentAttributes();

        
        let speakOutput = "${SOUND_FX.DESTINATION_TONE} ";
        speakOutput += 'I found the <prosody pitch="high">perfect</prosody> ';
        speakOutput += '<prosody volume="loud">cactus for you!</prosody> ';
        speakOutput += `Meet ${name}. They need water, and sunlight to thrive. `; 
        speakOutput += '<prosody rate="110%">They’re just a sprout right now, ';
        speakOutput += 'but keep them happy and they’ll grow a ';
        speakOutput += '<prosody pitch="high">little</prosody> each day. ';
        speakOutput += '</prosody> <break time="1s"/><prosody rate="110%">You ';
        speakOutput += 'can ask me to water your cactus; but not ';
        speakOutput += '<emphasis level="strong"></emphasis>';
        speakOutput += '<prosody pitch="high">too much!</prosody></prosody> ';
        speakOutput += 'Or you can ask me to open and close the blinds. ';
        speakOutput += `<prosody rate="110%">${name} needs lots of sun, but `;
        speakOutput += 'they’ll get <prosody pitch="high">chilly</prosody> at ';
        speakOutput += 'night if you don’t close them!</prosody> ';

    
        // let speakOutput = `${SOUND_FX.DESTINATION_TONE} I found the perfect cactus for you. `;
        // speakOutput += `Meet ${name}. `;
        // speakOutput += 'They need water and sunlight to thrive. ';
        // speakOutput += 'They\'re just a sprout right now, but keep them happy ';
        // speakOutput += 'and they\'ll grow a little each day. ';
        
        // speakOutput += 'You can ask me to water - but not too much! ';
        // speakOutput += 'Or you can ask me to open and close the blinds. ';
    
        let repromptOutput = `${name} needs sun, you can open the blinds.`;        
        
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

        handlerInput.responseBuilder.speak(ssmlWrapDomain(speakOutput + repromptOutput))
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        return handlerInput.responseBuilder
            .reprompt(ssmlWrapDomain(repromptOutput))
            .getResponse();
    }
};

// TODO: refactor and move to a different file - does this belong in the status util? 
// Maybe we need an action util?
const DRINK_MESSAGES = [
    '<emphasis level="strong">Ah!</emphasis> That’s <prosody pitch="high">refreshing!</prosody>',
    '<prosody rate="90%">That <prosody pitch="+20%">water</prosody> is <prosody pitch="+20%">refreshing</prosody> stuff.</prosody>',
    '<prosody rate="90%"><prosody pitch="+20%">Ah!</prosody> That hit the <prosody pitch="+20%">Spot!</prosody></prosody>',
    '<prosody rate="90%"><prosody pitch="+20%">Thanks. </prosody>I\'m feeling like a fish in <prosody pitch="+20%">water again!</prosody></prosody>',
    '<prosody rate="90%">It’s good to <prosody pitch="+20%">feel wet </prosody>behind <prosody pitch="+20%">my ears again!</prosody></prosody>',
    '<prosody rate="90%"><prosody pitch="+20%">Ah!</prosody> Even <prosody pitch="+20%">cacti</prosody></prosody> need <prosody pitch="+20%"> a shower</prosody> sometimes.',
    '<prosody rate="90%"><prosody pitch="+20%">Thank you!</prosody> I feel <prosody pitch="+20%">quenched</prosody></prosody> now!',
    '<prosody rate="90%">Those <prosody pitch="+20%">showers sure beat </prosody> flash floods <prosody pitch="+20%"> on the prairie!</prosody></prosody>',
    '<prosody rate="90%">Even a <prosody pitch="+20%">cactus</prosody> needs a<prosody pitch="+20%"> drink sometimes! Thanks pal!</prosody></prosody>',
    '<prosody rate="90%">I feel like an <prosody pitch="+20%">oasis</prosody> in a<prosody pitch="+20%"> desert now! Thank you!</prosody></prosody>'
];

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
    
        let speakOutput = `${SOUND_FX.WATER} ${SOUND_FX.SLURP} `;

        const status = statusUtil.getStatus(profile);

        //TODO: think about a different drink sound effect when the cactus is overwatered
        //TODO: talk with Alison about warning messages about over watering 
        //TODO: figure out max waterLevel based upon cactus size (no hardcoding to 20)
        if (!status.alive) {
            profile = profileUtil.cleanUpCactus(profile);
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);               
            // TODO: investigate what to do about latestInteraction

            speakOutput += status.message;
        } else {
            speakOutput += ssmlUtil.wrapCactusVoice(profile, util.getRandomItemFromList(DRINK_MESSAGES));
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

        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder
            .reprompt(status.reprompt)
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
        handlerInput.responseBuilder.speak('You already have a cactus.')
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder
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


const DeadCactusNoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
            && !getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        let speakOutput = "Ok. I'll give you time to grieve. I have lots "; 
        speakOutput += "more cacti in need of homes when you decide you're "; 
        speakOutput += "ready to try again. Goodbye";

        return handlerInput.responseBuilder
            .speak(speakOutput)
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
        handlerInput.responseBuilder.speak("You already have a cactus that's alive and well. You water the water the cactus, or open and close the blinds. Which will it be?")
            
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder
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
        const {
            messageQueue
        } = handlerInput.requestEnvelope.request.message;
        messageQueue.forEach(message => {
            const {
                level,
                log
            } = message;
            switch (level) {
                case "error":
                    console.error(log);
                    break;
                case "warn":
                    console.warn(log);
                    break;
                case "info":
                    console.log(log);
                    break;
            }
        });

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

        const prompt = "What would you like to do?";
        speakOutput += prompt;
        
        
        if(supportsHTMLInterface(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                "type":"Alexa.Presentation.HTML.HandleMessage",
                "message": {
                    "intent":"showBadges",
                    "playAnimation": true,
                    "gameState": profile
                }
            });
        }
        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        return handlerInput.responseBuilder
            .reprompt(prompt)
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
        
        const status = statusUtil.getStatus(profile);
        
        console.log('GetStatusIntentHandler', status);
        
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
        handlerInput.responseBuilder.speak(status.message)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        return handlerInput.responseBuilder
            .reprompt(status.reprompt)
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

const OPEN_BLINDS_MESSAGES = [
    '<prosody rate="90%">Let there be <prosody pitch="+20%">light!</prosody></prosody>',
    '<prosody rate="90%">Hello<prosody pitch="+20%"> sun shine!</prosody></prosody>',
    '<prosody rate="90%">Thanks for being my <prosody pitch="+20%">sun shine!</prosody></prosody>',
    '<prosody rate="90%">Ah. Sweet <prosody pitch="+20%">warmth!</prosody></prosody>. Thank you.',
    '<prosody rate="90%">I better get my <prosody pitch="+20%">sunglasses!</prosody></prosody>', 
];

const HasCactusOpenBlindsIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenBlindsIntent') ||
            (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'OpenBlindsIntent')
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        
        let speakOutput = `${SOUND_FX.BOING} But ... the blinds are already open. `;
        
        const profile = getProfile(handlerInput);
        
        if (profile.cactus.blindState !== 'open') {
            
            speakOutput = `${SOUND_FX.SHORT_CHIME} ${SOUND_FX.BIRD_FOREST_02} ${util.getRandomItemFromList(OPEN_BLINDS_MESSAGES)} `;
            
            profile.cactus.blindState = "open";    
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
        
            attributesManager.setSessionAttributes(profile);            
        }

        const status = statusUtil.getStatus(profile);

        speakOutput += status.message;
        
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
        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        // TODO: investigate if we should use a different reprompt string 
        return handlerInput.responseBuilder
            .reprompt(FALLBACK_REPROMPT)
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

const CLOSE_BLINDS_MESSAGES = [
    '<prosody pitch="high">Hey! </prosody><prosody rate="115%"><prosody pitch="x-high">who</prosody> turned out <emphasis level="strong">all</emphasis> the <prosody pitch="high">lights?</prosody></prosody>',
    '<prosody rate="90%">I guess it\'s time to <prosody pitch="+20%">go to bed.</prosody> Now if only I had a <prosody pitch="+20%">pillow.</prosody></prosody>',
    'Did it get dark in here suddenly?',
    '<prosody rate="90%">I guess the <prosody pitch="+20%">sun</prosody> will come out <prosody pitch="+20%">tomorrow!</prosody></prosody>',
    '<prosody rate="90%">Well it\'s no scenic <prosody pitch="+20%">sunset,</prosody>but I guess that<prosody pitch="+20%">works too!</prosody></prosody>'
];

const HasCactusCloseBlindsIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CloseBlindsIntent')
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === MESSAGE_REQUEST
            && getMessageIntent(handlerInput.requestEnvelope) === 'CloseBlindsIntent')
            && getProfile(handlerInput).cactus.name;
    },
    handle(handlerInput) {
        
        let speakOutput = `${SOUND_FX.BOING} But ... the blinds are already closed. `;
        
        const profile = getProfile(handlerInput);
        
        if (profile.cactus.blindState !== "closed") {
            speakOutput = `${SOUND_FX.SHORT_CHIME} ${util.getRandomItemFromList(CLOSE_BLINDS_MESSAGES)} `;
        
            profile.cactus.blindState = "closed";
            
            const attributesManager = handlerInput.attributesManager;
            attributesManager.setPersistentAttributes(profile);
            attributesManager.savePersistentAttributes();
            attributesManager.setSessionAttributes(profile);            
        }

        const status = statusUtil.getStatus(profile);

        speakOutput += status.message;
        
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
        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        
        return handlerInput.responseBuilder
            .reprompt(FALLBACK_REPROMPT)
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

        let speakOutput = "This is my cactus. A cactus raising simulation game. ";
        speakOutput += "I have lots of cacti in need of care! To match you ";
        speakOutput += "with the right one for you to raise as your own though, ";
        speakOutput += "I’ll need to know a bit about you. If you could go ";
        speakOutput += "anywhere in the world, <prosody volume=\"x-loud\">where ";
        speakOutput += "would you visit?</prosody>";
        
        const profile = getProfile(handlerInput);

        if (profile.cactus.name) {
            speakOutput = `You’re raising a cactus named ${profile.cactus.name}. `;
            speakOutput += "You can open the blinds during the day to make sure they get enough sunshine, "
            speakOutput += "but don’t forget to close them at night or they’ll get cold! "        
            speakOutput += "Pay close attention to their water, too. "
            speakOutput += "Over-watering is just as bad as a drought! "            
        }
        handlerInput.responseBuilder.speak(ssmlWrapDomain(speakOutput));
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder
            .reprompt(FALLBACK_REPROMPT)
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

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = `${SOUND_FX.ERROR} I'm not sure about that. ${FALLBACK_REPROMPT}`;
        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }

        return handlerInput.responseBuilder
            .reprompt(FALLBACK_REPROMPT)
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

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `<amazon:emotion name="disappointed" intensity="high">Aww no, The code is broken.</amazon:emotion>`;
        handlerInput.responseBuilder.speak(speakOutput)
        if(isHTMLCapableFireTV(handlerInput)) {
            return handlerInput.responseBuilder.getResponse();
        }
        return handlerInput.responseBuilder
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

        const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope);
        const timeZone = await util.getTimeZone(handlerInput, deviceId);
        console.log("loadProfileInterceptor - timezone", timeZone);
        
        // If no profile initiate a new one - first interaction with skill
        if (!profile.hasOwnProperty("cactus")) {
            profile = profileUtil.defaultProfile(timeZone);
            console.log('initializing profile', profile);
        } else {
            profile.cactus = statusUtil.computeStatus(profile, moment(), timeZone);
            badgeUtil.evaluate(profile, moment());
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
const ssmlUtil = require('./src/ssmlUtil.js');

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

const createAdapter = function() {

    let adapter;
    if (process.env.S3_PERSISTENCE_BUCKET) {
        const S3Adapter = require('ask-sdk-s3-persistence-adapter');
        adapter = new S3Adapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    } else {
        const localAdapter = require('./localPersistenceAdapter');
        adapter = new localAdapter.localPersistenceAdapter({"path": "./local_persistence_bucket"})
    }
    return adapter;
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
        FallbackIntentHandler,
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
        createAdapter()
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
    