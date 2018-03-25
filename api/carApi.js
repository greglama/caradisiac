const fs = require("fs");
const fetch = require("node-fetch");
const elasticClient = require("./elasticsearch.js")

const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');

const INDEX_NAME = "models";
const TYPE_NAME = "model";

/**
 * @param {number} sizeOfPacket 
 * fetch all the models and send queries by packet of a defined size
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
 * Create an index in elasticSearch
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
            console.log("This index already exists, it will not be add");
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
 * Index a document in elasticSearch
 */
const indexDocument = async (index, type, document) =>{
    const result = await elasticClient.index({
        index:index,
        id: document.uuid,
        type:type,
        body:document
    });

    return result;
}

/**
 * @param {string} index 
 * @param {string} type 
 * @param {object} documents 
 * Just like indexDocument but takes an array of documents instead
 */
const indexArrayOfDocument = async (index, type, documents) =>{

    await Promise.all(documents.map(doc => indexDocument(index, type, doc)))
}

/**
 * @param {string} path 
 * @param {string} data 
 * save some data in a file (the purpose here is to save the 'node-car-api' data to use it offline)
 */
const saveFechedData = async (path, data) => await fs.writeFile(path, JSON.stringify(data));

module.exports = {
    indexName: INDEX_NAME,
    typeName: TYPE_NAME,
    fetchAllModels : fetchAllModels,
    creatIndex: creatIndex,
    indexDocument:indexDocument,
    indexArrayOfDocument: indexArrayOfDocument,
    saveFechedData: saveFechedData
};