var debugLevel;
const THREE = require('three');
const BLINDS_UP_ANIM = "animateBlindsUP";
const BLINDS_DOWN_ANIM = "animateBlindsDown";
let initializedData = false;
let loadedVisual = false;

const BLINDS_OBJ_NAME = "blinds";

module.exports = {
    update(delta) {
        this.blindsMixerUp.update(delta);
        this.blindsMixerDown.update(delta);
    },
    init(blindsOpen, debugLevel) {
        this.debugLevel = debugLevel;
        this.blindsOpen = blindsOpen;
        initializedData = true;
        if(loadedVisual) {
            this.safeInitVisual();
        }
    },
    shouldClick(selectedObjSet) {
        return selectedObjSet.has(BLINDS_OBJ_NAME);
    },
    load(gltf) {
        this.blindsMixerUp = new THREE.AnimationMixer(gltf.scene);
        this.blindsMixerDown = new THREE.AnimationMixer(gltf.scene);
        let blindsUpClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_UP_ANIM);
        let blindsDownClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_DOWN_ANIM);

        this.blindsUpAction = this.blindsMixerUp.clipAction(blindsUpClip);
        this.blindsUpAction.clampWhenFinished = true;
        this.blindsUpAction.loop = THREE.LoopOnce;

        this.blindsDownAction = this.blindsMixerDown.clipAction(blindsDownClip);
        this.blindsDownAction.clampWhenFinished = true;
        this.blindsDownAction.loop = THREE.LoopOnce;

        loadedVisual = true;
        if(initializedData) {
            this.safeInitVisual();
        }
    },
    safeInitVisual() {
        //After the model has loaded, get it into the right state. 
        if(this.blindsOpen) {
            this.raise();
            console.log("raising blinds");
        } else {
            this.lower();
            console.log("lowering blinds");
        }
    },
    lower() {
        // blindsMixerDown.stopAllAction();
        this.blindsDownAction.reset().play();
        this.blindsOpen = false;
    },
    raise() {
        // blindsMixerUp.stopAllAction();
        this.blindsUpAction.reset().play();
        this.blindsOpen = true;
    },
    onClick(alexa, textElement) {
        const clickPromise = new Promise((resolve, reject) => {
            if(debugLevel >= 1) {
                infoElement.textContent = "poked blinds";
                console.log("Clicked Blinds");
            }
            if(this.blindsOpen) {
                this.lower();
            } else {
                this.raise();
            }
            if(alexa != null) {
                alexa.skill.sendMessage({
                    intent: this.blindsOpen? "OpenBlindsIntent" : "CloseBlindsIntent",
                    clicked: "blinds"
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