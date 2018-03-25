const carApi = require("./carApi.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.get('/', (request, response) => {
    response.sendFile("index.html"); // help page ? it might be nice to have a Jdoc over there
});

app.get('/cars',  (request, response) => {
    //TODO
});

//add only one model to the data base
app.post('/populate', async (request, response) => {
    const document = request.body.document;
    console.log(document);
    const answer = await carApi.indexDocument("models","model",document);

    response.json(answer);
});

//add an array of models to the database
app.post('/populateArray', (request, response) => {
    const documents = request.body.documents;
    console.log(documents);
    carApi.indexArrayOfDocument("models","model",documents);
    response.send("the sent documents has been received");
});

app.listen(3000, function()
{
    console.log("listening on port 3000");
});