const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const generateNotification = require('./generate-notification')
const storeNotification = require("./store-notification");
const passToDelivery = require("./pass-to-delivery");

async function runFn() {
  const client = new SQSClient({});

  while (true) {
    try {

      const response = await client.send(new ReceiveMessageCommand({
        QueueUrl: process.env.NOTIFICATION_GENERATOR_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      }));


      for (const message of response.Messages ?? []) {
        console.log(JSON.stringify(message.Body));
        const notificationConfig = JSON.parse(message.Body)
        const notificationToStore = await generateNotification(notificationConfig);
        const notification = await storeNotification(notificationToStore);
        await passToDelivery(notification);

        await client.send(new DeleteMessageCommand({
          QueueUrl: process.env.NOTIFICATION_GENERATOR_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  }
}

runFn().catch(console.error);


module.exports.run = runFn;