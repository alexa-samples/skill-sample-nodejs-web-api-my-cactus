const wrapDomain = function(speakOutput) {
    return `<amazon:domain name="long-form">${speakOutput}</amazon:domain>`;
}

const wrapCactusVoice = function(profile, speakOutput) {
    return `<voice name="${profile.cactus.voice}">${speakOutput}</voice>`;
}

module.exports = {
    wrapDomain,
    wrapCactusVoice
}