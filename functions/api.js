const express    = require("express");
const cors       = require('cors')
const serverless = require("serverless-http")
const path       = require('path');
const bodyParser = require('body-parser');
const sendEmail  = require('./emailSender.js');


const app    = express()
const router = express.Router()

DEVELOPMENT = true;
if (DEVELOPMENT)
{
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
        optionSuccessStatus: 200
    }));
}
else 
{
    app.use(cors());
}

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));


router.post("/test", (req, response) => {
    response.json("TEST");
});


router.post("/request_account", (req, res) => {
    console.log("REQUEST TO ADMIN");
    res.json("REQUEST TO ADMIN IS SUCCESS");
});




router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build'), 'index.html');
});
app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);

npom