const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const generateNotificationPayload = require('./generate-notification-payload')
const storeNotification = require("./store-notification");
const passToDelivery = require("./pass-to-delivery");
const {connectDB} =require('./connect-db');

async function runFn() {
    try {
        const client = new SQSClient({});

        await connectDB()

        while (true) {
                const response = await client.send(new ReceiveMessageCommand({
                    QueueUrl: process.env.NOTIFICATION_GENERATOR_QUEUE_URL,
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                }));


                for (const message of response.Messages ?? []) {
                    try {
                        console.log(JSON.stringify(message.Body));
                        const notificationConfig = JSON.parse(message.Body)
                        const notificationPayload = await generateNotificationPayload(notificationConfig);
                        const notification = await storeNotification({notificationPayload, notificationConfig});
                        await passToDelivery(notification);

                        await client.send(new DeleteMessageCommand({
                            QueueUrl: process.env.NOTIFICATION_GENERATOR_QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle,
                        }));
                    } catch (err) {
                        // catch message level here and alow the process to move on
                        console.log(err)
                    }
                }
        }

    } catch (err) {
        // catches client, connect db, and receive message errors and causes the process to exit and restart another container
        console.error(err);
        throw err
    }

}

if(process.env.NODE_ENV !== 'dev') {
    runFn().catch((err) => {
        console.log(err)
        process.exit(1);
    });
}


module.exports.run = runFn;