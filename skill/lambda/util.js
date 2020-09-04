const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

const getS3PreSignedUrl = function(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

const getTimeZone = async function(handlerInput, deviceId) {
    
    const serviceClientFactory = handlerInput.serviceClientFactory;
    
    let userTimeZone;
    try {
        const upsServiceClient = serviceClientFactory.getUpsServiceClient();
        userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
        
    } catch (error) {
        if (error.name !== 'ServiceError') {
            return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
        }
        console.log('error', error.message);
    }    
    
    return userTimeZone
}

const getRandomItemFromList = function(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

module.exports = {
    getS3PreSignedUrl,
    getTimeZone,
    getRandomItemFromList
}