const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

async function runFn() {
    console.log('hello generator service v3');
    console.log('env url: ',process.env.NOTIFICATION_GENERATOR_QUEUE_URL)
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