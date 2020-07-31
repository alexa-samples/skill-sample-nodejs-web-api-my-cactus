var blindsUpAction, blindsDownAction, blindsMixerUp, blindsMixerDown;
var debugLevel;
const THREE = require('three');
const BLINDS_UP_ANIM = "animateBlindsUP";
const BLINDS_DOWN_ANIM = "animateBlindsDown";
let blindsOpen = false;
const BLINDS_OBJ_NAME = "blinds";

module.exports = {
    update(delta) {
        blindsMixerUp.update(delta);
        blindsMixerDown.update(delta);
    },
    init(startInfo, debugLevel) {
        this.debugLevel = debugLevel;
        blindsOpen = startInfo.blindState === "open";
        console.log(startInfo);
    },
    shouldClick(selectedObjSet) {
        return selectedObjSet.has(BLINDS_OBJ_NAME);
    },
    load(gltf) {
        blindsMixerUp = new THREE.AnimationMixer(gltf.scene);
        blindsMixerDown = new THREE.AnimationMixer(gltf.scene);
        let blindsUpClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_UP_ANIM);
        let blindsDownClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_DOWN_ANIM);

        blindsUpAction = blindsMixerUp.clipAction(blindsUpClip);
        blindsUpAction.clampWhenFinished = true;
        blindsUpAction.loop = THREE.LoopOnce;

        blindsDownAction = blindsMixerDown.clipAction(blindsDownClip);
        blindsDownAction.clampWhenFinished = true;
        blindsDownAction.loop = THREE.LoopOnce;

        //After the model has loaded, get it into the right state. 
        if(blindsOpen) {
            this.raise();
            console.log("raising blinds");
        } else {
            this.lower();
            console.log("lowering blinds");
        }
    },
    lower() {
        // blindsMixerDown.stopAllAction();
        blindsDownAction.reset().play();
        blindsOpen = false;
    },
    raise() {
        // blindsMixerUp.stopAllAction();
        blindsUpAction.reset().play();
        blindsOpen = true;
    },
    onClick(alexa) {
        console.log("Clicked Blinds");
        // blindsSound.play();
        if(blindsOpen) {
            this.lower();
        } else {
            this.raise();
        }

        if(alexa != null) {
            alexa.skill.sendMessage({
                intent:blindsOpen? "OpenBlindsIntent" : "CloseBlindsIntent",
                clicked:"blinds"
            });
            cloudLog("Poked the blinds.");
        }
        if(debugLevel >= 1) {
            infoElement.textContent = "poked blinds";
        }
    }
}