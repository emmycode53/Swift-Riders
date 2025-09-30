

const app = require('./app');
console.log("server.js is starting...");

const PORT = process.env.PORT|| 5000;

console.log("Loaded app.js ✅");
app.listen(PORT, ()=>{
    console.log(`server has started listening on http://localhost:${PORT}`)
})
