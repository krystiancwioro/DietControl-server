const config = {
    port: process.env.PORT || 3000,
    databaseUrl: process.env.MONGODB_URI || 'mongodb+srv://test:test@cluster0.df9w6.mongodb.net/diet-control',
    JwtSecret: process.env.JWT_SECRET || 'secret'
};

module.exports = config;
