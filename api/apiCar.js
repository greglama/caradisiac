const fetch = require("node-fetch");
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');

/**
 * 
 * @param {Number} sizeOfPacket 
 *
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


const main = async () =>
{
    const models = await fetchAllModels(20);
}
main();