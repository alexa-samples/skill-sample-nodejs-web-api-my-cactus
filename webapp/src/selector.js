const THREE = require('three');
var raycaster, selectedObjs = new Set();

module.exports = {
    deselect() {
        selectedObjs = new Set();
    },
    getSelectedObjSet() {
        return selectedObjs;
    },
    init() {
        raycaster = new THREE.Raycaster();
        selectedObj = null;
    },
    selectClickables(normalizedPosition, clickableSet, camera) {
        selectedObjs = new Set();
        raycaster.setFromCamera(normalizedPosition, camera);
        clickableSet.forEach(element => {
            if(this.isObjectSelected(element)) {
                selectedObjs.add(element.name);
            }
        });
    },
    select(normalizedPosition, scene, camera) {
        selectedObjs = new Set();
        // TODO Figure out a better method of selection!
        // Also something seems wrong with the selection logic..
        
        // cast a ray
        raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = raycaster.intersectObjects(scene.children, true);
        intersectedObjects.forEach(element => {
            console.log("Object: " + JSON.stringify(element.object.name));
            if(element.object.type != null) {
                selectedObjs.add(element.object.name);
            }
        });
    },
    isObjectSelected(object) {
        var inverseMatrix = new THREE.Matrix4(), ray = new THREE.Ray();

        inverseMatrix.getInverse(object.matrixWorld);
        ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
        const boundingBox = object.geometry.boundingBox;
        if(boundingBox !== null) {
            return ray.intersectsBox(boundingBox);
        }
    }
}

