const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const processMessage = require('./process-message')

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
        const parsedMessageBody = JSON.parse(message.Body)
        await processMessage(parsedMessageBody);

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