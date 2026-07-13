const generateReminderNotification = async (notificationConfig)=>{
    console.log(notificationConfig.config.message)
    return {message: notificationConfig.config.message}
}

module.exports = generateReminderNotification