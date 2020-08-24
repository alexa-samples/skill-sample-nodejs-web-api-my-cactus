
const MESSAGE_CADENCE_MS = "500";
let currentTime = 0;
let messageQueue = [];
let alexaClient;

module.exports = {
    init(alexa) {
        alexaClient = alexa;
    },
    /**
     * Call this every frame of your local web app. When necessary, it will send a batch of messages. 
     * @param {*} deltaTime change in time in milliseconds. 
     */
    update(deltaTime) {
        if(currentTime >= MESSAGE_CADENCE_MS) {
            //reset time tracker
            currentTime = currentTime - MESSAGE_CADENCE_MS;
            //Clear message queue
            this.flushMessageQueue(messageQueue);
            messageQueue = []; // clear the message queue.
        } else {
            currentTime += deltaTime;
        }
    },
    flushMessageQueue(queue) {
        if(queue.length <= 0) {
            return Promise.resolve("No messages in queue.");
        }
        const messagePromise = new Promise((resolve, reject) => {
            alexaClient.skill.sendMessage({
                intent:"log",
                messageQueue:queue
            },
            function(messageSendResponse) {
                console.log(messageSendResponse.statusCode);
                switch(messageSendResponse.statusCode) {
                    case 500:
                    case 429:
                        //TODO check messageSendResponse.rateLimit.timeUntilResetMs and timeUntilNextRequestMs
                        //USe these fields for smart retries split from 500 when this happens
                        console.error(messageSendResponse.reason);
                        reject(messageSendResponse.reason);
                        break;
                    case 200:
                    default:
                        resolve("Successfully called Alexa skill.");
                }
            });
        });
        return messagePromise;
    },
    log(payload) {
        //Print locally.
        console.log(payload);
        //Push a new log onto the end of the queue.
        this.pushMessage(payload, "info");
    },
    error(payload) {
        //Print locally.
        console.error(payload);
        //Push a new log onto the end of the queue.
        this.pushMessage(payload, "error");
    },
    warn(payload) {
        //Print locally.
        console.log(payload);
        //Push a new log onto the end of the queue.
        this.pushMessage(payload, "warn");
    },
    pushMessage(payload, level) {
        messageQueue.push({
            level: level,
            log: payload
        });
    }
}