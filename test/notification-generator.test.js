const {run} = require('../src/main.js')

test('testing', async () => {
    const ret = await run()
    expect(1).toBe(1);
}, 30000);
