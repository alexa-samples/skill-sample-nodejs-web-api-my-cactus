const THREE = require('three');
const GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader');
const selector = require('./selector');
const screenShake = require('./screenShake');
const badges = require('./badges');
const OrbitControls = require('three/examples/jsm/controls/OrbitControls');
const startInfo = require('./mockStartupData.json');

const blinds = require('./blinds.js');
const cactus = require('./cactus.js');
const pail = require('./pail.js');
const spider = require('./spider');

//Debug level 2 shows camera logs in update., level 1 basic logging.
var debugLevel = 1;
var fullControls = false;

//audio listeners
var listeners = []

var infoElement = document.getElementById("info");
var debugElement = document.getElementById("debugInfo");
var canvas = document.getElementById("webGLCanvas");
var waterStatusBar = document.getElementById("waterBar"); 
var healthSatusBar = document.getElementById("healthBar"); 
var nameElement = document.getElementById("name");
var badgeElement = document.getElementById("badgeHud"); 

infoElement.style.display = "none";

if(debugLevel < 1) { // hide the debug element if no debugging.
    infoElement.style.display = "none";
    debugElement.style.display = "none";
}

var camera, scene, renderer, clock; // set in init()

var hemiLight; // TODO follow up on lighting. 
var alexa; // Also set in init
var assetsLoaded = false; //waits that the 3D assets have loaded
var alexaLoaded = false; //waits that the Alexa module exists
var countGlbs = 0;
var NUMBER_GLBS = 6;//Update if adding another GLB to the game.

//Loader information
const sourceArtDir = "./assets/source-art/";
const backgroundHealthyAsset = sourceArtDir + "Pete_Background-Healthy.png";
const backgroundNeutralAsset = sourceArtDir + "Pete_Background-Neutral.png";
const backgroundSickAsset = sourceArtDir + "Pete_Background-Sick.png";

const SPIDER_TIMER = 5000;

//Render loop
var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    update();
};

//Actual code execution
try {
    init();

    //Start the process.
    render();

    //Create a Spider after some time.
    if(assetsLoaded) {
        window.setTimeout(function() {
            spider.spawnSpider();
        }, SPIDER_TIMER);
    }
    
    console.log("post init");
} catch(err) {
    const errMessage = `error: ${err.name}, message: ${err.message}, stack: ${err.stack}`;
    debugElement.textContent = JSON.stringify(errMessage);
    cloudLog(errMessage);
}

//Update function
function update() {
    var delta = clock.getDelta();

    // Update scale and position of the cactus.
    if(countGlbs >= NUMBER_GLBS && !assetsLoaded) {
        setUpScene();
    }
    
    if(debugLevel >= 2) {
        console.log("Camera Pos: " + JSON.stringify(camera.position));
        console.log("Camera Rot: " + JSON.stringify(camera.rotation));
    }

    //Handle selections
    const selectedObjSet = selector.getSelectedObjSet();
    if(cactus.shouldClick(selectedObjSet)) {
        screenShake.shake(camera, 500, 200, 200);//TODO figure out or cut
        cactus.onClick(alexa);
    }
    if(blinds.shouldClick(selectedObjSet)) {
        blinds.onClick(alexa, debugElement);
    }
    if(pail.shouldClick(selectedObjSet)) {
        pail.onClick(alexa, debugElement);
    }
    if(spider.shouldClick(selectedObjSet)) {
        spider.onClick(alexa);
    }

    controls.update(); // TODO fix this later. Screen shake does not play nice.
    screenShake.update(delta * 1000); //delta time convert to millis

    if(debugLevel >= 1) {
        //more logging if needed
    }

    if(assetsLoaded) {
        spider.update(delta);
        pail.update(delta);
        blinds.update(delta);
        cactus.update(delta);
        
    } 
    selector.deselect();
}

/**
 * Logs a message locally and if alexa is initialized, pushes the message to the lambda to log.
 * @param {*} messageStr 
 */
function cloudLog(payload) {
    console.log(payload);
    if(alexaLoaded) {
        alexa.skill.sendMessage({
            intent: "log",
            log: payload
        });
    }
}

/**
 * Sets up the Alexa object and listeners.
 */
function setupAlexa() {
    alexa = new Alexa({ version: "0.2" });
    alexa.onReady((message) => {
        alexaLoaded = true;
        
        console.log("Startup Alexa success. Logging device and memory info");
        if(debugLevel >= 1) {
            alexa.performance.getMemoryInfo().then((memInfo) => cloudLog({
                display: JSON.stringify(alexa.capabilities.display),
                memory: JSON.stringify(memInfo),
                microphone: JSON.stringify(alexa.capabilities.microphone)
            }));
            debugElement.textContent = 'startup succeeded, time to start my game';
            infoElement.textContent = JSON.stringify(message);
        }
        refreshGameState(message);
        //Start BG Music when we know it is an Alexa-enabled device.
        bgMusic.play();
    });
    alexa.onReadyFailed((message) => {
        if(debugLevel >= 1) {
            debugElement.textContent =  'startup failed, better message customer';
            infoElement.textContent = 'startup failed, Sorry, customer.';
        }
        alexa = null;
    });
    alexa.speech.onStarted(() => {
        console.log('speech is playing');
        duckAudio();
    });
    alexa.speech.onStopped(() => {
        console.log('speech stopped playing');
        restoreAudio();
    });
    // Called every time a data payload comes from backend as a message Directive.
    alexa.skill.onMessage((message) => {
        if(message) {
            debugElement.textContent = JSON.stringify(message);
        }

        if(message.gameState) {
            refreshGameState(message.gameState);
        } else {
            console.error("Game state not found here is the payload: " + JSON.stringify(message));
        }

        console.log("Game State: " + JSON.stringify(message.gameState));
        if(message.gameState.newBadge) {
            console.log("Showing new badge");
            badges.showNewBadge(message.gameState.unlockedBadges.latestKey, message.gameState.unlockedBadges.latest);
        }

        //If in intent exists and matches one of the below, play all local animations/sounds.
        if(message.playAnimation === true) {
            switch(message.intent) {
                case "water":
                    pail.water();
                    break;
                case "blindsDown"://todo test this and blinds up
                    blinds.lower();
                    break;
                case "blindsUp":
                    blinds.raise();
                    break;
                case "showBadges":
                    badges.showBadges();
                    break;
                case "getStatus":
                case "newCactus":
                    cactus.dance();
                    break;
                default:
                    return;
            }
        }
    });
    //TODO add screen dimming.
    alexa.voice.onMicrophoneOpened(() => {
        // dimScreen();
        duckAudio();
        console.log("microphone opened");
    });
    alexa.voice.onMicrophoneClosed(() => {
        // undimScreen();
        restoreAudio();
        console.log("microphone closed");
    });

}

function dimScreen() {

}

function undimScreen() {

}

function duckAudio() {
    listeners.forEach(listener => {
        listener.setMasterVolume(.4);
    });
}

function restoreAudio() {
    listeners.forEach(listener => {
        listener.setMasterVolume(1);
    });
}

// initializes the scene, camera, and renderer.
function init() {
    setupAlexa();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 10000 );
    screenShake.init();

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    controls = new OrbitControls.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    //Set the camera control limitations iff fullcontrols is disabled
    if(!fullControls) {
        controls.enableKeys = false;
        controls.enableZoom = false;
        const LOCKED_ANGLE = 60 * Math.PI / 180;
        controls.maxPolarAngle = LOCKED_ANGLE;
        controls.minPolarAngle = LOCKED_ANGLE;
        controls.maxAzimuthAngle = 45 * Math.PI / 180;
        controls.minAzimuthAngle = -45 * Math.PI / 180;
    
        var MIN_CONTROL_PAN = new THREE.Vector3(-3, -3, 10);
        var MAX_CONTROL_PAN = new THREE.Vector3(3, 2, 100);
        //Sets the control to a min/max vector
        var copyVect = new THREE.Vector3();
        controls.addEventListener("change", function() {
            copyVect.copy(controls.target);
            controls.target.clamp(MIN_CONTROL_PAN, MAX_CONTROL_PAN);
            copyVect.sub(controls.target);
            camera.position.sub(copyVect);
        });
    }
    
    selector.init();

    //Register our event listeners to capture input.
    //Computer listeners for testing JS functionality
    document.addEventListener("keydown", onDocumentKeyDown, false);

    //Lots of different ways to do the same "click" depending on browser version and touch screen enabled.
    document.addEventListener("pointerdown", domClick, true);
    document.addEventListener("touchstart", domTouch, true);
    document.addEventListener("mousedown", domClick, true);

    badgeElement.onclick = function() {
        if(alexa != null) {
            alexa.skill.sendMessage({
                intent:"ShowBadgesIntent",
                clicked:"badgeButton"
            });
        }
        badges.showBadges();
    }

    //Load web Audio into the scene
    loadAudio();

    //Add the scene
    const gltfLoader = new GLTFLoader.GLTFLoader();
    gltfLoader.load(sourceArtDir + 'Cactus_scene.glb', function (gltf) { 
        scene.add(gltf.scene);
        countGlbs++;
        console.log(gltf);
        loadOtherScenes(gltfLoader);
    }, undefined, function (error) {
        console.error(error);
    });
    
    console.log(camera);
    setupLights();
}

function loadAudio() {
    //web audio setup.
    var listener1 = new THREE.AudioListener();
    listeners.push(listener1);
    spider.loadAudio(listener1);
    camera.add(listener1);

    var listener2 = new THREE.AudioListener();
    loadBackgroundMusic(listener2);
    listeners.push(listener2);
    // camera.add(listener2);
}

function loadBackgroundMusic(listener) {
    var audioLoader = new THREE.AudioLoader();

    bgMusic = new THREE.Audio(listener);
    audioLoader.load('./assets/audio/video_tunes_01_loopable.mp3', function(buffer) {
        bgMusic.setBuffer(buffer);
        bgMusic.setVolume(0.06);
        bgMusic.setLoop(true);
    });
}

/**
 * 
 * @param {*} dataPayload from the Alexa backend at startup and on other responses. 
 * Call only once assets are initialized and on every time there is a state update.
 */
function refreshGameState(dataPayload) {
    cactusState = dataPayload.cactus;
    if(debugLevel >= 1) {
        console.log(cactusState.waterLevel);
    }
    //initialize state of visible DOM elements not controlled by a class.
    nameElement.textContent = cactusState.name;
    waterStatusBar.max = cactusState.waterMax;
    waterStatusBar.value = cactusState.waterLevel;
    healthSatusBar.value = cactusState.healthLevel;

    //initialize state of objects
    blinds.init(cactusState, debugLevel);
    cactus.init(cactusState, debugLevel);

    badges.refreshBadges(dataPayload.unlockedBadges);
    
    // Adding the background texture.
    let bgTexture;
    if(cactusState.happiness === 1) {
        bgTexture = new THREE.TextureLoader().load(backgroundHealthyAsset);
    } else if(cactusState.happiness === 0) {
        bgTexture = new THREE.TextureLoader().load(backgroundNeutralAsset);
    } else {
        bgTexture = new THREE.TextureLoader().load(backgroundSickAsset);
    }
    scene.background = bgTexture;
}

function loadOtherScenes(gltfLoader) {
    //Load the cactus and dance anim
    gltfLoader.load(sourceArtDir + 'Cactus_plant_dance.glb', function (gltf) {
        scene.add(gltf.scene);
        cactus.load(gltf);
        countGlbs++;
        console.log(gltf);
    }, undefined, function (error) {
        console.error(error);
    });

    //Load the blinds and anim
    gltfLoader.load(sourceArtDir + 'Cactus_blinds_upDown-separated.glb', function (gltf) {
        scene.add(gltf.scene);
        blinds.load(gltf);
        countGlbs++;

        console.log(gltf);
    }, undefined, function (error) {
        console.error(error);
    });

    //Load the watering can
    gltfLoader.load(sourceArtDir + 'Cactus_watering-can.glb', function (gltf) {
        scene.add(gltf.scene);
        pail.load(gltf);        
        countGlbs++;
        console.log(gltf);
    }, undefined, function (error) {
        console.error(error);
    });

    //Load the spider squished
    gltfLoader.load(sourceArtDir + 'Cactus_flat_spider.glb', function (gltf) {
        scene.add(gltf.scene);
        spider.loadSquished(gltf);
        countGlbs++;
        console.log(gltf);
    }, undefined, function (error) {
        console.error(error);
    });

    //Load the spider and anim
    gltfLoader.load(sourceArtDir + 'Cactus_spider_walk.glb', function (gltf) {
        scene.add(gltf.scene);
        spider.loadWalk(gltf);
        countGlbs++;
        console.log(gltf);
    }, undefined, function (error) {
        console.error(error);
    });
}

function setUpScene() {
    console.log("Assets are loaded.");
    assetsLoaded = true;

    camera.position.set(12.49529444321625, 453.77789466125455, 652.0444919524163); // set the proper position of the camera
    controls.update();

    //Set up initial Game values. Acts on the assets. DO not call if Alexa was loaded as we will clobber it with mock data.
    if(!alexaLoaded) {
        refreshGameState(startInfo);
    }
}

function setupLights() {

    //Set up Lighting
    var light = new THREE.AmbientLight(0x404040, 8); // soft white light
    scene.add(light);

    // var sun = new THREE.DirectionalLight(0xFDB813, 2);
    // sun.position.set(-3, 1, -6);
    // sun.castShadow = false;
    // scene.add(sun);
    // Add a dot representing where the "sun" is
    // var dotGeometry = new THREE.Geometry();
    // dotGeometry.vertices.push(new THREE.Vector3(-3,1,-6));
    // var dotMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false, color: 0x888888 });
    // var dot = new THREE.Points(dotGeometry, dotMaterial);
    // scene.add(dot);

    // var overheadLight = new THREE.DirectionalLight(0x404040, 8);
    // scene.add(overheadLight);

    // hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.3 );
    // hemiLight.color.setHSL( 0.7, 1, 0.7 );
    // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    // hemiLight.position.set( 0, 15, 0 );
    // scene.add(hemiLight);

    // hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add(hemiLightHelper);
}

function createMaterialFromFilename(fileName) {
    let texture = new THREE.TextureLoader().load(fileName);
    let material = new THREE.SpriteMaterial({ map: texture });
    return material;
}

function normalize2DPoint(vector2) {
    return new THREE.Vector2(
        (vector2.x / window.innerWidth ) * 2 - 1, - (vector2.y / window.innerHeight ) * 2 + 1
    )
}

/**
 * when the DOM is clicked. Wrapper around our selection handler
 * @param {clickEvent} event 
 */
function domClick(event) {
    //start BG Music on click due to browser behavior.
    bgMusic.play();

    onClickOrTouch(event.clientX, event.clientY);
}

/**
 * when the DOM is touched. Note, Force uses the touch registered as the first touch if multitouch is involved.
 * @param {*} event 
 */
function domTouch(event) {
    onClickOrTouch(event.touches[0].clientX, event.touches[0].clientY);
}

/**
 * One place to handle the logic when a screen is selected.
 * @param {*} screenX 
 * @param {*} screenY 
 */
function onClickOrTouch(screenX, screenY) {
    cloudLog(`click/touch (${screenX}, ${screenY})`);
    const nonNormalPos = new THREE.Vector2(screenX, screenY);
    const screenVector = normalize2DPoint(nonNormalPos);
    const worldVector = new THREE.Vector3(screenX, screenY, -1).unproject(camera);
    if(debugLevel >= 1) {
        infoElement.textContent = "world  vector: " + JSON.stringify(worldVector) 
            + "\nclick  vector: " + JSON.stringify(nonNormalPos) 
            + "\nnormal vector: " + JSON.stringify(screenVector);
    }
    selector.select(screenVector, scene, camera);
    // selector.selectClickables(screenVector, clickableObjects, camera);
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 88) { // x
        camera.position.z *= 2;
    } else if (keyCode == 90) { // z
        camera.position.z *= .5;
    } else if (keyCode == 38) { // Up arrow / fireTV remote up
        0
    } else if (keyCode == 40) { // Down Arrow / fireTV remote down
        
    } //FireTV Codes: https://developer.amazon.com/docs/fire-tv/supporting-controllers-in-web-apps.html#usinginput
    else if(keyCode == 13) { // d-pad center
        // Perform a select
    } 
};