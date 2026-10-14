const MS_PER_DAY = 24 * 60 * 60 * 1000

const generateCountdownNotification = async (notificationConfig, now = Date.now()) => {
    const {name, targetAt} = notificationConfig.config
    const targetMs = new Date(targetAt).getTime()
    if (Number.isNaN(targetMs)) {
        throw new Error(`Invalid targetAt for countdown "${name}": ${targetAt}`)
    }

    const days = Math.round((targetMs - now) / MS_PER_DAY)

    if (days === 0) return {message: `${name} is today!`}
    if (days < 0) {
        const ago = Math.abs(days)
        return {message: `${name} was ${ago} ${ago === 1 ? 'day' : 'days'} ago`}
    }
    return {message: `${name} is in ${days} ${days === 1 ? 'day' : 'days'}`}
}

module.exports = generateCountdownNotification
