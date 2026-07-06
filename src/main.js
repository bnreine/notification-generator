// const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
//
// const QUEUE_URL = process.env.QUEUE_URL;

async function run() {
    try {
        console.log('hello generator service')
    } catch (err) {
        console.log(err);
    }

  // const client = new SQSClient({});

  // while (true) {
  //   try {
  //     const response = await client.send(new ReceiveMessageCommand({
  //       QueueUrl: QUEUE_URL,
  //       MaxNumberOfMessages: 10,
  //       WaitTimeSeconds: 20,
  //     }));
  //
  //     for (const message of response.Messages ?? []) {
  //       console.log(JSON.stringify(message.Body));
  //
  //       await client.send(new DeleteMessageCommand({
  //         QueueUrl: QUEUE_URL,
  //         ReceiptHandle: message.ReceiptHandle,
  //       }));
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
