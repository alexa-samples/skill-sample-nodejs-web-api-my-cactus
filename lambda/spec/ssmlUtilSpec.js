'use strict';

const ssmlUtil = require('../src/ssmlUtil');

describe('wrapDomain', function() {
    it('should be wrapped in the domain ssml tag', function() {
        const speakOutput = `Hello there, I'm a cactus.`;

        const actual = ssmlUtil.wrapDomain(speakOutput);
        const expected = '<amazon:domain name="long-form">Hello there, I\'m a cactus.</amazon:domain>';

        expect(actual).toEqual(expected);

    })
});

describe('wrapCactusVoice', function() {
    it('Should wrap in output with Brian\'s voice', function() {

        const speakOutput = `Hello there, I'm a cactus.`;
        const profile = require('./profiles/no-needs.json');

        const actual = ssmlUtil.wrapCactusVoice(profile,speakOutput);
        const expected = '<voice name="Brian">Hello there, I\'m a cactus.</voice>';
        
        expect(actual.includes("Brian")).toBe(true);
        expect(actual).toEqual(expected);

    });
});