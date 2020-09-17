/**
 * Badges object from backend has the form:
"unlockedBadges": {
    "latest": "",
    "waterUnits": [],
    "earlyBird": false,
    "nightOwl": false,
    "durations": {
        "1": false,
        "3": false,
        "7": false,
        "14": false,
        "30": false,
        "90": false,
        "180": false,
        "365": false
    },
    "helicopterParent": false
}
 * 
 */

var infoElement = document.getElementById("info");
var debugElement = document.getElementById("debugInfo");
var waterStatusBar = document.getElementById("waterBar"); 
var healthSatusBar = document.getElementById("healthBar"); 
var nameElement = document.getElementById("name");
var badgeElement = document.getElementById("badgeHud"); 
var displayElementsGame = document.getElementById("onScreenHud");

var oldBadgeObj = null;
var badgeButtonElement = document.getElementById("badgeButton");
var fullScreenBadgeOverlay = document.getElementById("allBadges");
var scrollingBadgeOverlay = document.getElementById("scrollingBadge");
var fullScreenNewBadgeOverlay = document.getElementById("newBadge");
var canvas = document.getElementById("webGLCanvas");

const SOURCE_ART_DIR = "./assets/source-art/"
const BADGE_ART_DIR = SOURCE_ART_DIR + "badges/";
const NEW_BADGE_BG = BADGE_ART_DIR + "Pete_Background-Badge.png";
const ALL_BADGE_BG = BADGE_ART_DIR + "Pete_Background-All.png";
const OVERLAY_IMAGE = SOURCE_ART_DIR + "Pete_FullComp.png"

const backFromTheBrink = document.getElementById("backFromTheBrink");
const earlyBird = document.getElementById("earlyBird");
const greenThumb = document.getElementById("greenThumb");
const helicopterParent = document.getElementById("helicopterParent");
const newParent = document.getElementById("newParent");
const nightOwl = document.getElementById("nightOwl");

const loadingDiv = document.getElementById("loading");

let showingBadges = false;

const badgeFiles = {
    helicopterParent: {fileName: "Pete_Badge-BackFromTheBrink.png", domElement: helicopterParent},
    earlyBird: {fileName: "Pete_Badge-EarlyBird.png", domElement: earlyBird},
    nightOwl: {fileName: "Pete_Badge-NightOwl.png", domElement: nightOwl}
}

const TOTAL_TIME_BADGES_SHOWN = 10000;

module.exports = {
    update(deltaTime) {
        if(showingBadges) {
            let moveDist = (scrollingBadgeOverlay.scrollHeight - window.innerHeight) * deltaTime / TOTAL_TIME_BADGES_SHOWN;
            scrollingBadgeOverlay.scrollTop += moveDist + .5; // hack. Cannot move less than 1 pixel. Add .5 so we can round up.
        }
    },
    hideLoadingScreen() {
        loadingDiv.style.display = "none";
    },
    refreshBadges(badgeData) {
        //DO our comparison.
        for (const [key, value] of Object.entries(badgeFiles)) {
            console.log(`changing badge with ${JSON.stringify(key)}, ${JSON.stringify(value)}`);
            //if a badge changed, show it.
            this.updateBadge(value.domElement, badgeData[key]);
        }
    },
    showNewBadge(badgeKey, description) { // TODO debug this. not working correctly.
        const badgeFileName = badgeFiles[badgeKey].fileName;

        fullScreenNewBadgeOverlay.style.display = "block";
        canvas.style.display = "none";
        fullScreenBadgeOverlay.style.display = "none";
        //Add the text description of the badge
        const newBadgeTxt = document.createTextNode(description);
        var descriptionAbsolute = document.createElement("div");
        descriptionAbsolute.style.top = "70%";
        descriptionAbsolute.style.left = "50%";        
        descriptionAbsolute.style.position = "absolute";

        var badgeDescription = document.createElement("div");
        badgeDescription.style.left = "-50%";        
        badgeDescription.style.position = "relative";
        badgeDescription.appendChild(newBadgeTxt);
        descriptionAbsolute.appendChild(badgeDescription);

        fullScreenNewBadgeOverlay.insertBefore(descriptionAbsolute, fullScreenNewBadgeOverlay.childNodes[0]);

        //Add the image of the badge
        const newBadgeImg = document.createElement('img');
        newBadgeImg.src = BADGE_ART_DIR + "On/" + badgeFileName;
        newBadgeImg.style.position = "absolute";
        newBadgeImg.style.marginLeft = "37%";
        fullScreenNewBadgeOverlay.insertBefore(newBadgeImg, fullScreenNewBadgeOverlay.childNodes[0]);
        this.hideStatus();

        window.setTimeout(() => {
            this.showBadges();
            newBadgeImg.parentNode.removeChild(newBadgeImg);
        }, 10000);
    },
    showBadges() {
        showingBadges = true;
        fullScreenNewBadgeOverlay.style.display = "none";
        fullScreenBadgeOverlay.style.display = "block";
        
        canvas.style.display = "none";
        this.hideStatus();

        window.setTimeout(() => {
            this.hideBadges();
        }, TOTAL_TIME_BADGES_SHOWN);
    },
    hideBadges() {
        this.showStatus();
        showingBadges = false;
        fullScreenBadgeOverlay.style.display = "none";
        fullScreenNewBadgeOverlay.style.display = "none";
        canvas.style.display = "inline";
        
    },
    updateBadge(badgeReference, value) {
        if(value) {
            console.log(badgeReference.src);
            badgeReference.src = badgeReference.src.replace("Off", "On");
        } else {
            console.log(badgeReference.src);
            badgeReference.src = badgeReference.src.replace("On", "Off");
        }
    },
    hideStatus() {
        displayElementsGame.style.display = "none";
    }, 
    showStatus() {
        displayElementsGame.style.display = "block";
    }
}