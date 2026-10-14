const generateReminderNotification = require('./generate-reminder-notification')
const generateStockQuoteNotification = require('./generate-stock-quote-notification')

const generateCountdownNotification = require('./generate-countdown-notification')

const mapping = {
    stockQuoteAlert: generateStockQuoteNotification,
    reminder: generateReminderNotification,
    countdown: generateCountdownNotification
}

const generateNotificationPayload = async (notificationConfig) => {
    const {config} = notificationConfig
    const mapped =  mapping[config?.type]
    if(mapped) {
        return await mapped(notificationConfig)
    }
    throw new Error('Unable to generate notification payload, type not implemented')
}

module.exports = generateNotificationPayload