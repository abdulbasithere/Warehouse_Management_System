require('dotenv').config();
const { server } = require('./app.js');

server.listen(process.env.PORT, () => {
    console.log(`🚀 Listening on port ${process.env.PORT}`);
});