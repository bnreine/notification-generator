const generateReminderNotification = require('./generate-reminder-notification')
const generateStockQuoteNotification = require('./generate-stock-quote-notification')

const mapping = {
    stockQuoteAlert: generateStockQuoteNotification,
    reminder: generateReminderNotification
}

const generateNotification = async (notificationConfig) => {
    const {config} = notificationConfig
    const mapped =  mapping[config?.type]
    if(mapped) {
        return await mapped(notificationConfig)
    }
    throw new Error('Unable to generate reminder notification')
}

module.exports = generateNotification