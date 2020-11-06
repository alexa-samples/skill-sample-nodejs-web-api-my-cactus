var canMixer, waterCactusAction;
var pail;
var debugLevel;
const THREE = require('three');
const PAIL_OBJ_NAME = "can";

module.exports = {
    update(delta) {
        canMixer.update(delta);
    },
    init(debugLevel) {
        this.debugLevel = debugLevel;
        //TODO Make glowing if low number
    },
    load(gltf) {
        canMixer = new THREE.AnimationMixer(gltf.scene);
        const canClip = gltf.animations[0];
        waterCactusAction = canMixer.clipAction(canClip);
        waterCactusAction.clampWhenFinished = true;
        waterCactusAction.loop = THREE.LoopOnce;

        pail = gltf.scene.getObjectByName(PAIL_OBJ_NAME);
    },
    shouldClick(selectedObjSet) {
        return selectedObjSet.has(PAIL_OBJ_NAME);
    },
    water() {
        waterCactusAction.reset().play();
    },
    onClick(alexa, textElement) {
        const clickPromise = new Promise((resolve, reject) => {
            if(debugLevel >= 1) {
                console.log("Playing watering pail click");
                infoElement.textContent = "poked watering pail";
            }
            waterCactusAction.reset().play();
            if(alexa !== null) {
                alexa.skill.sendMessage({
                    intent:"WaterCactusIntent"
                },
                function(messageSendResponse) {
                    textElement.appendChild(document.createTextNode("\n" + JSON.stringify(messageSendResponse)));
                    console.log(messageSendResponse.statusCode);
                    switch(messageSendResponse.statusCode) {
                        case 500:
                        case 429:
                            //TODO check messageSendResponse.rateLimit.timeUntilResetMs and timeUntilNextRequestMs
                            //USe these fields for smart retries split from 500 when this happens
                            console.error(messageSendResponse.reason);
                            reject(messageSendResponse.reason);
                            break;
                        case 200:
                        default:
                            resolve("Successfully called backend.");
                    }
                });
            } else {
                resolve("Alexa not enabled, animation successful.");
            }
        });
        return clickPromise;
    }
}