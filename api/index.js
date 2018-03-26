const carApi = require("./carApi.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.get('/', (request, response) => {
    response.sendFile("index.html"); // help page ? it might be nice to have a Jdoc over there
});

app.get('/cars',  async (request, response) => {
    const result = await carApi.get10BiggestVolume();
    const hits = result.hits.hits.map(hit => hit._source);
    response.json(hits);
});

//add only one model to the data base
app.post('/populate', async (request, response) => {
    const document = request.body.document;
    console.log(document);
    const answer = await carApi.indexDocument("models","model",document);

    //send the elaticSearch answer
    response.json(answer);
});

//add an array of models to the database
app.post('/populateArray', async (request, response) => {
    const documents = request.body.documents;
    console.log(documents);
    const answer = await carApi.indexArrayOfDocument("models","model",documents);

    //send an array of elasticSearch answer
    response.json(answer);
});

/**
 * 1) creates an index
 * 2) retrieves saved models
 * 3) add them into elasticSearch
 * 
 * return true if success, return false else
 */
const initDataBase = async() =>{
    try
    {
        await carApi.creatIndex(carApi.INDEX_NAME);
        
        const fetchedData = await carApi.getFetchedData("models.json");

        //change the volume from string to int
        const formatData = fetchedData.map(model =>{
            if(model.volume === "")
            {
                model.volume = 0;
            }
            else
            {
                model.volume = parseInt(model.volume);
            }
            return model;
        });

        console.log("Updating the documents of data base");
        await carApi.indexArrayOfDocument(carApi.INDEX_NAME, carApi.TYPE_NAME, formatData);
        return true;
    }
    catch(err)
    {
        console.log("An error occured while trying to set up the data base...");
        return false;
    }
}

initDataBase().then(r =>{
    if(r)
    {
        console.log("The data base has been initialized");
    }
    app.listen(3000, function(){
        console.log("listening on port 3000");
    });
})

