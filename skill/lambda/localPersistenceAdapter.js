
/** 
 * Amazon Alexa Local Persistence Adapter by Greg Bulmash 
 * 
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Amazon Software License, Version 1.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at: https://aws.amazon.com/asl/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License 
 * for the specific language governing permissions and limitations under the License.
 * 
 */

const fs = require("fs");
const sha = require("js-sha512").sha384;

Object.defineProperty(exports, "__esModule", { value: true });

var localPersistenceAdapter = /** @class */ (function () {
  function localPersistenceAdapter(config = {}) {
    this.pathPrefix = (config.hasOwnProperty('path')) ? config.path : "./persistence"
    console.log("\n\n constructing: " + __dirname + this.pathPrefix + " \n\n")
  }

  /**
   * Gets persistent attributes, returns a promise, eventually a string.
   * @returns {object} an attributes object (key:value)
   */

  localPersistenceAdapter.prototype.getAttributes = function (request_envelope) {

    let userId = request_envelope.session.user.userId;
    userId = sha(userId);
    var filepath = __dirname + "/" + this.pathPrefix + '/' + userId + '.json';

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(filepath)) {
        var userData = fs.readFileSync(filepath);
        userData = JSON.parse(userData);
      } else {
        console.log("\n\n no attributes \n\n");
        var userData = {};
      }
      resolve(userData);
    });
  };

  /**
   * Saves persistent attributes, returns a promise, eventually a string.
   * @returns {void} nothing on success, or error
   */

  localPersistenceAdapter.prototype.saveAttributes = function (request_envelope, attributes) {
    var userId = request_envelope.session.user.userId;
    userId = sha(userId);
    var save_path = __dirname + "/" + this.pathPrefix + '/' + userId + '.json';
    return new Promise(function (resolve, reject) {
      let userText = JSON.stringify(attributes);
      fs.writeFileSync(save_path, userText, { encoding: 'utf8', flag: 'w' });
      resolve(void {});
    });
  };

  /**
   * Saves persistent attributes, returns a promise, eventually a string.
   * @param {object} request_envelope a request envelope.
   * @returns {void} nothing on success, or error
   */

  localPersistenceAdapter.prototype.deleteAttributes = function (request_envelope) {
    var userId = request_envelope.session.user.userId;
    userId = sha(userId);
    var file_path = __dirname + "/" + this.pathPrefix + '/' + userId + '.json';
    return new Promise(function (resolve, reject) {
      fs.unlinkSync(file_path);
      resolve(void {});
    });
  };
  return localPersistenceAdapter;
})();

exports.localPersistenceAdapter = localPersistenceAdapter;
