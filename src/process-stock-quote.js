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

const processStockQuote = async (message)=>{
    const quoteData = await getQuote(message.config.stock);
    console.log(quoteData)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return
}

module.exports = processStockQuote