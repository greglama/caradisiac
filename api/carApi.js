const fs = require("fs");
const fetch = require("node-fetch");
const elasticClient = require("./elasticsearch.js")

const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');

const INDEX_NAME = "models";
const TYPE_NAME = "model";

/**
 * @param {number} sizeOfPacket 
 * fetches all the models and send queries by packet of a defined size
 */
const fetchAllModels = async(sizeOfPacket) =>{
    const brands = await getBrands();

    let result = [];

    let index = 0;

    while (index < brands.length)
    {
        console.log("Fetching models " + String(index) + " to " + String(index + sizeOfPacket - 1));

        const promiseModels = [];

        for(let i = 0; i< sizeOfPacket; i++)
        {
            promiseModels.push(getModels(brands[index]));
            index ++;
        }

        const models = await Promise.all(promiseModels);
        models.map(m => result = result.concat(m));
    }

    console.log("all models have been fetched");

    return result;
}

/**
 * @param {string} indexName 
 * Creates an index in elasticSearch
 */
const creatIndex = async indexName =>{
    try
    {
        const result = await elasticClient.indices.create({index: indexName});
        console.log("index has been successfuly added to elasticSearch");
        return result;
    }
    catch(err)
    {
        if(err.body.error.type === "resource_already_exists_exception")
        {
            console.log("The index '" + indexName + "' already exists, it will not be add");
        }
        else
        {
            console.log("An error has occured : ")
            console.log(err);
        }
        return err;
    }
}

/**
 * 
 * @param {string} index 
 * @param {string} type 
 * @param {object} document 
 * Indexes a document in elasticSearch
 */
const indexDocument = async (index, type, document) =>{
    try{
        const result = await elasticClient.index({
            index:index,
            id: document.uuid,
            type:type,
            body:document
        });
    
        return result;
    }
    catch(err)
    {
        console.log("The document " + String(document.uuid) + " cannot be add...");
        console.log(err);
        return err;
    }
}

/**
 * @param {string} index 
 * @param {string} type 
 * @param {object} documents 
 * Just like indexDocument but takes an array of documents instead
 * It indexes documents by packet of 100 (there is a limit of 200 in elasticSearch queue)
 */
const indexArrayOfDocument = async (index, type, documents) =>{

    let packetSize = 100;

    let indx = 0;
    let resultatsArray = [];

    while(indx < documents.length)
    {
        const arrayDoc = [];

        if(documents.length - indx < packetSize)
        {
            packetSize = documents.length - indx;
            console.log(packetSize);
        }

        for(let i = 0; i < packetSize; i++)
        {
            arrayDoc.push(indexDocument(index, type, documents[indx]));
            indx ++;
        }

        const results = await Promise.all(arrayDoc);

        resultatsArray.concat(results);

        console.log(String(indx) + "/" + String(documents.length - 1));
    }

    return resultatsArray;
}

/**
 * @param {string} path 
 * @param {string} data 
 * saves some data in a file (the purpose here is to save the 'node-car-api' data to use it offline)
 */
const saveFechedData = async (path, data) => await fs.writeFile(path, JSON.stringify(data));

/**
 * @param {string} path 
 * Retrieves the saved models
 */
const getFetchedData = async (path) => JSON.parse(fs.readFileSync(path, "utf-8"));

module.exports = {
    INDEX_NAME: INDEX_NAME,
    TYPE_NAME: TYPE_NAME,
    fetchAllModels: fetchAllModels,
    creatIndex: creatIndex,
    indexDocument: indexDocument,
    indexArrayOfDocument: indexArrayOfDocument,
    saveFechedData: saveFechedData,
    getFetchedData: getFetchedData
};