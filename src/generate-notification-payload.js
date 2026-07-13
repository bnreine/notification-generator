const generateReminderNotification = require('./generate-reminder-notification')
const generateStockQuoteNotification = require('./generate-stock-quote-notification')

const mapping = {
    stockQuoteAlert: generateStockQuoteNotification,
    reminder: generateReminderNotification
}

const generateNotificationPayload = async (notificationConfig) => {
    const {config} = notificationConfig
    const mapped =  mapping[config?.type]
    if(mapped) {
        return await mapped(notificationConfig)
    }
    throw new Error('Unable to generate notification')
}

module.exports = generateNotificationPayload