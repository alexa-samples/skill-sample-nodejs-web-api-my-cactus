const FLOWERING_AGE = 30;
const SECOND_ARM_AGE = 20;
const FIRST_ARM_AGE = 10;

var debugLevel;
const THREE = require('three');

const CACTUS_BODY_OBJ_NAME = "cactus_large";
const CACTUS_LG_ARM_OBJ_NAME = "cactus_medium";
const CACTUS_SM_ARM_OBJ_NAME = "cactus_small";
const CACTUS_FLOWER_OBJ_NAME = "flower";
const CLICKABLE_OBJS = [CACTUS_BODY_OBJ_NAME, CACTUS_LG_ARM_OBJ_NAME, CACTUS_SM_ARM_OBJ_NAME];

module.exports = {
    update(delta) {
        this.cactusMixer.update(delta);

        //CactusBody is a parent object of the other cactus pieces. Scaling scales ALL.
        setObjScaleAndPosition(this.cactusBody, this.happyDays, FIRST_ARM_AGE);
        console.log("Happy days are: " + this.happyDays);
        //Set the correct things to visible
        if(this.happyDays > FLOWERING_AGE) {
            //all is visible
            this.cactusFlower.visible = true;
            this.cactusBody.visible = true;
            this.cactusArmSmall.visible = true;
            this.cactusArmLarge.visible = true;
        } else if(this.happyDays > SECOND_ARM_AGE) {
            this.cactusBody.visible = true;
            this.cactusFlower.visible = false;
            this.cactusArmSmall.visible = true;
            this.cactusArmLarge.visible = true;
            setObjScaleAndPosition(this.cactusBody, FLOWERING_AGE, SECOND_ARM_AGE);
        } else if(this.happyDays > FIRST_ARM_AGE) {
            setObjScaleAndPosition(this.cactusBody, SECOND_ARM_AGE, FIRST_ARM_AGE);
            this.cactusFlower.visible = false;
            this.cactusBody.visible = true;
            this.cactusArmSmall.visible = false;
            this.cactusArmLarge.visible = true;
        } else if (this.happyDays < 0) {
            this.cactusBody.visible = false;
            this.cactusFlower.visible = false;
            this.cactusArmSmall.visible = false;
            this.cactusArmLarge.visible = false;
        }
    },
    init(daysAlive, debugLevel) {
        this.happyDays = daysAlive;
        this.debugLevel = debugLevel;
    },
    shouldClick(selectedObjSet) {
        return CLICKABLE_OBJS.filter(value => selectedObjSet.has(value)).length !== 0;
    },
    load(gltf) {
        var scene = gltf.scene;
      
        //Set up our object references
        this.cactusBody = scene.getObjectByName(CACTUS_BODY_OBJ_NAME);
        this.cactusArmLarge = this.cactusBody.getObjectByName(CACTUS_LG_ARM_OBJ_NAME);
        this.cactusArmSmall = this.cactusArmLarge.getObjectByName(CACTUS_SM_ARM_OBJ_NAME);
        this.cactusFlower = this.cactusArmLarge.getObjectByName(CACTUS_FLOWER_OBJ_NAME);
        this.pot = scene.getObjectByName("pot");

        this.cactusMixer = new THREE.AnimationMixer(scene);
        const cactusDanceClip = gltf.animations[0];
        this.cactusDanceAction = this.cactusMixer.clipAction(cactusDanceClip);
        this.cactusDanceAction.setLoop(THREE.LoopPingPong, 2);
        this.cactusDanceAction.play();

        //Set up cactus
        this.cactusArmSmall.visible = false;
        this.cactusArmLarge.visible = false;
        this.cactusFlower.visible = false;
    },
    dance() {
        this.cactusDanceAction.reset().play();
    },
    onClick() {
        if(debugLevel >= 1) {
            infoElement.textContent = "poked cactus";
        }
        this.dance();
    }
}

/**
 * Changes the scale and position of the object passed in according to a range from 0-maxAge
 * @param {*} object object to manipulate.
 * @param {*} normalizedAge value from 0-maxAge
 * @param {*} maxAge maximum value in scaling range
 * @param {*} startPosX defaults to 0 (local space)
 * @param {*} startPosY defaults to 0 (local space)
 * @param {*} endPosX defaults to 0 (local space)
 * @param {*} endPosY defaults to 0 (local space)
 * @param {*} maxScale minimum of the original model size to scale to.
 * @param {*} minScale Maximum of original model size to scale from.
 */
function setObjScaleAndPosition(object, age, maxAge, minAge=0, startPosX=0, startPosY=0, endPosX=0, endPosY=0, maxScale=1, minScale=.5) {
    const normalizedAge = getNormalizedAge(age, maxAge, minAge);
    const diffPosX = endPosX - startPosX;
    const diffPosY = endPosY - startPosY;
    const posY = startPosY + diffPosY * (normalizedAge / maxAge);
    const posX = startPosX + diffPosX * (normalizedAge / maxAge);
    const diffScale = maxScale - minScale;
    const scale = minScale + diffScale * (normalizedAge / maxAge);

    object.scale.set(scale, scale, scale);
    object.position.set(posX, posY, object.position.z);
}

/**
 * Calculates a normalized age given the minimum age boundary and maximum age boundary.
 * Returns a value that is between 0 and (max-min)
 * @param {*} age Raw age of the cactus
 * @param {*} max age boundary
 * @param {*} min age boundary
 */
function getNormalizedAge(age, max, min) {
    let normalizedAge =  max - age;
    if(age > max) {
        normalizedAge = max - min;
    } else {
        normalizedAge = age - min; 
    }
    return normalizedAge;
}
