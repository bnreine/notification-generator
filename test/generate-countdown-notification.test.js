const generateCountdownNotification = require('../src/generate-countdown-notification')

const config = (targetAt) => ({config: {name: 'Greece Trip', type: 'countdown', targetAt, timezone: 'America/Costa_Rica'}})
const now = new Date('2026-10-14T18:00:00.000Z').getTime()

test('shows whole days until the event', async () => {
    const res = await generateCountdownNotification(config('2026-10-16T18:00:00.000Z'), now)
    expect(res.message).toBe('Greece Trip is in 2 days')
})

test('rounds to the nearest day', async () => {
    expect((await generateCountdownNotification(config('2026-10-16T05:00:00.000Z'), now)).message).toBe('Greece Trip is in 1 day')
    expect((await generateCountdownNotification(config('2026-10-16T07:00:00.000Z'), now)).message).toBe('Greece Trip is in 2 days')
})

test('handles today and past events', async () => {
    expect((await generateCountdownNotification(config('2026-10-14T20:00:00.000Z'), now)).message).toBe('Greece Trip is today!')
    expect((await generateCountdownNotification(config('2026-10-11T18:00:00.000Z'), now)).message).toBe('Greece Trip was 3 days ago')
})

test('throws on invalid targetAt', async () => {
    await expect(generateCountdownNotification(config('nope'), now)).rejects.toThrow('Invalid targetAt')
})
