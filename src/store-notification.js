const {getDbPool} = require('./connect-db');

const storeNotification = async ({ notificationPayload, notificationConfig }) => {
    try {
        const dbPool = getDbPool();

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await dbPool.query(
            'INSERT INTO "Notification" ("id", "userId", "configId", "configSnapshot", "eventPayload", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [id, notificationConfig.userId, notificationConfig.Id, notificationConfig.config, notificationPayload, createdAt]
        );

        const queryString = `select * from  "Notification" where "id" = '${id}'`

        const response = await dbPool.query(
            queryString
        );
        return response.rows[0];
    } catch (err){
        throw new Error(err)
    }
};

module.exports = storeNotification;
