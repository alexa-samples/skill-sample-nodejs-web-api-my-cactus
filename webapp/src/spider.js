var spiderMixer, spiderSquishMixer;
var spiderSquishAction, spiderMoveAction, squishSound;
var spider, spiderSquish;

var debugLevel;
const THREE = require('three');
const SPIDER_OBJ_NAME = "Spider_2";
const SPIDER_ABDOMEN_NAME = "Abdomen";
const FLAT_SPIDER_OBJ_NAME = "FLAT_Spider";
const CLICKABLE_OBJS = [SPIDER_OBJ_NAME, FLAT_SPIDER_OBJ_NAME, SPIDER_ABDOMEN_NAME];

module.exports = {
    update(delta) {
        if(spiderSquishMixer){
            spiderSquishMixer.update(delta);
        }
        spiderMixer.update(delta);
    },
    shouldClick(selectedObjSet) {
        return CLICKABLE_OBJS.filter(value => selectedObjSet.has(value)).length !== 0;
    },
    init(startInfo, debugLevel) {
        this.debugLevel = debugLevel;
    },
    spawnSpider() {
        console.log("Spawning a creepy-crawly.");
        spider.visible = true;
        spiderMoveAction.reset().play();
    },
    loadAudio(listener) {
        var audioLoader = new THREE.AudioLoader();

        squishSound = new THREE.Audio(listener);
        audioLoader.load( './assets/audio/spiderSquish1.mp3', function(buffer) {
            squishSound.setBuffer(buffer);
            squishSound.setVolume(1.0);
        });
    },
    loadSquished(gltf) {
        spiderSquish = gltf.scene.getObjectByName(FLAT_SPIDER_OBJ_NAME);
        spiderSquish.visible = false;
        // spiderSquishMixer = new THREE.AnimationMixer(gltf.scene);
        // let spiderSquishClip = gltf.animations[0];
        // spiderSquishAction = spiderSquishMixer.clipAction(spiderSquishClip);
        // spiderSquishAction.setLoop(THREE.LoopOnce, 1);
    },
    loadWalk(gltf) {
        spiderMixer = new THREE.AnimationMixer(gltf.scene);
        const spiderClip = gltf.animations[0];

        spiderMoveAction = spiderMixer.clipAction(spiderClip);
        spiderMoveAction.setLoop(THREE.LoopOnce, 1).setEffectiveTimeScale(.2);

        spider = gltf.scene.getObjectByName(SPIDER_OBJ_NAME);
        spider.visible = false;
    },
    squish() {
        spiderSquish.position.set(spider.position.x, spider.position.y, spider.position.z);
        spider.visible = false;
        spiderSquish.visible = true;
        squishSound.play();
        spiderMoveAction.reset();
    },
    onClick(alexa) {
        console.log("Clicked spider");
        if(debugLevel >= 1) {
            infoElement.textContent = "poked spider";
        }
        this.squish();
        if(alexa !== null) {
            alexa.skill.sendMessage({
                intent:"SquishSpiderIntent"
            });
        }
    }
}