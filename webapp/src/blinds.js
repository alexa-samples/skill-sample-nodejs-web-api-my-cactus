var blindsUpAction, blindsDownAction, blindsMixer;
var debugLevel;
const THREE = require('three');
const BLINDS_UP_ANIM = "animateBlindsUP";
const BLINDS_DOWN_ANIM = "animateBlindsDown";
let blindsOpen = false;
const BLINDS_OBJ_NAME = "blinds";

module.exports = {
    update(delta) {
        blindsMixer.update(delta);
    },
    init(startInfo, debugLevel) {
        this.debugLevel = debugLevel;
        blindsOpen = startInfo.blindState === "open";
        console.log(startInfo);
        if(blindsOpen) {
            this.raise();
            console.log("raising blinds");
        } else {
            this.lower();
            console.log("lowering blinds");
        }
    },
    shouldClick(selectedObjSet) {
        return selectedObjSet.has(BLINDS_OBJ_NAME);
    },
    load(gltf) {
        //TODO fix animation setup
        blindsMixer = new THREE.AnimationMixer(gltf.scene);
        let blindsUpClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_UP_ANIM);
        let blindsDownClip = THREE.AnimationClip.findByName(gltf.animations, BLINDS_DOWN_ANIM);

        blindsUpAction = blindsMixer.clipAction(blindsUpClip);
        // blindsUpAction.clampWhenFinished = true;
        blindsUpAction.loop = THREE.LoopOnce;

        blindsDownAction = blindsMixer.clipAction(blindsDownClip);
        // blindsDownAction.clampWhenFinished = true;
        blindsDownAction.loop = THREE.LoopOnce;
    },
    lower() {
        blindsMixer.stopAllAction();
        blindsDownAction.reset().play();
        console.log(blindsMixer);
    },
    raise() {
        blindsMixer.stopAllAction();
        blindsUpAction.reset().play();
    },
    onClick(alexa) {
        console.log("Clicked Blinds");
        // blindsSound.play();
        if(blindsOpen) {
            blindsOpen = false;
            blindsDownAction.reset().play()
        } else {
            blindsOpen = true;
            blindsUpAction.reset().play()
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