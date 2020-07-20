let cam;
let amp;
let cameraPosOrigin;
const THREE = require('three');
let adjustmentsRemaining = -1;
let adjustmentLength;
let currentLerpTime;
let currentTargetPos;

module.exports = {
    init() {},
    shake(camera, durationMillis, amplitude, numberChanges = 10) {
        cam = camera;
        amp = amplitude;
        adjustmentLength = durationMillis / numberChanges;
        cameraPosOrigin = new THREE.Vector3();
        currentTargetPos = new THREE.Vector3();
        cameraPosOrigin.copy(camera.position);
        currentTargetPos.copy(cameraPosOrigin);
        adjustmentsRemaining = numberChanges;
        currentLerpTime = 0;
    },
    update(deltaTime) {
        if(adjustmentsRemaining < 0) {
            return;
        }
        //Update our lerp time
        currentLerpTime += deltaTime;

        //Set a new Target to lerp towards.
        if(currentLerpTime / adjustmentLength >= 1) {
            currentLerpTime = 0;
            currentTargetPos = new THREE.Vector3(
                cam.position.x + Math.random() * amp - amp / 2,
                cam.position.y + Math.random() * amp - amp / 2,
                cam.position.z
            );
            adjustmentsRemaining--;
        }
        
        if(adjustmentsRemaining === 0) {
            cam.position.lerp(cameraPosOrigin, currentLerpTime / adjustmentLength);
        } else if(adjustmentsRemaining === -1) { 
            // ensure it goes back to start. The math is slightly off because of the variability in deltaTime.
            cam.position.lerp(cameraPosOrigin, 1);
        } else {
            cam.position.lerp(currentTargetPos, currentLerpTime / adjustmentLength);
        }
    }
}