const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const QUEUE_URL = process.env.NOTIFICATION_DELIVERY_QUEUE_URL;
const client = new SQSClient({});

const passToDelivery = async (notification) => {
    await client.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(notification),
    }));
};

module.exports = passToDelivery;
