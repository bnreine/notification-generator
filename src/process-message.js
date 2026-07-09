const processReminder = require('./process-reminder')
const processStockQuote = require('./process-stock-quote')

const mapping = {
    stockQuoteAlert: processStockQuote,
    reminder: processReminder
}

const processMessage = async (message) => {
    const {config} = message
    const mapped =  mapping[config?.type]
    if(mapped) {
        await mapped(message)
    }
}

module.exports = processMessage