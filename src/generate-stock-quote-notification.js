const finnhub = require('finnhub');
const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

let finnhubClient
let secret

const getSecret = async ()=> {
    if(secret) return secret
    const client = new SecretsManagerClient({});

    const response = await client.send(
        new GetSecretValueCommand({
            SecretId: 'finnhub-api-key',
        })
    );

    secret = JSON.parse(response.SecretString);
    return secret
}


const getFinnhubClient = async ()=> {
    if(finnhubClient) return finnhubClient
    const secret = await getSecret();
    finnhubClient = new finnhub.DefaultApi(secret.apiKey)
    return finnhubClient
}



async function getQuote(symbol) {
    const finnClient = await getFinnhubClient()
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s to not go over the rate limit of finnhub
    return await new Promise((resolve, reject) => {
        finnClient.quote(symbol, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

const generateStockQuoteNotification = async (notificationConfig)=>{
    const quoteData = await getQuote(notificationConfig.config.stock);
    console.log(quoteData)
    return {message: `The price of ${notificationConfig.config.stock} is $${quoteData.c}`}
}

module.exports = generateStockQuoteNotification