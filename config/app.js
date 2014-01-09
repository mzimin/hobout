module.exports = {

    port: process.env.PORT || 80,
    defaultApplication: process.env.DEFAULT_APP || "democlient",
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost/hobout',
    clientApp: process.env.CLIENTAPP || 'http://local.hobout.com',
    fbAppId: process.env.APP_ID || '1406370232936920',
    fbAppSecret:  process.env.APP_SECRET || 'e9bd1dd07c6d702c8c4f0bc6bdb33681',
    fbCallbackUrl: process.env.FB_CALLBACK || 'http://api.hobout.com/auth/facebook/callback'

}