const app = require('./app');
const path = require('path');
const connectDatabase = require('./config/database');


connectDatabase();

const server = app.listen(process.env.PORT, (req,res) =>{
    console.log(`SERVER IS LISTENING AT http://localhost:${process.env.PORT} in ${process.env.NODE_ENV}`)
    
})

process.on('unhandledRejection', (err) =>{
    console.log(`Error ${err.message}`);
    console.log("Shutting down the server due to unhandled rejection")
    server.close(()=>{
        process.exit(1);   //if any unhandled error occurs it shut down the server and shows the error
    })
})

process.on('uncaughtException', (err)=>{
    console.log(`Error ${err.message}`);
    console.log("Shutting down the server due to uncaught exception error")
    server.close(()=>{
        process.exit(1);   //if any unhandled error occurs it shut down the server and shows the error
    })
})

