var canMixer, waterCactusAction;
var pail;
var debugLevel;
const THREE = require('three');
const PAIL_OBJ_NAME = "can";

module.exports = {
    update(delta) {
        canMixer.update(delta);
    },
    init(startInfo, debugLevel) {
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
    onClick(alexa) {
        console.log("Playing watering pail click");
        waterCactusAction.reset().play();
        if(alexa !== null) {
            alexa.skill.sendMessage({
                intent:"WaterCactusIntent"
            });
            cloudLog("Poked the Pail.");
        }
        if(debugLevel >= 1) {
            infoElement.textContent = "poked watering pail";
        }
    }
}