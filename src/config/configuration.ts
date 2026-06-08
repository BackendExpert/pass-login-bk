export default () => ({
    // SERVER_MONGO_URI: process.env.SERVER_MONGO_URI,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    PROJECT_NAME: process.env.PROJECT_NAME,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BACKEND_SERVER: process.env.BACKEND_SERVER,
})