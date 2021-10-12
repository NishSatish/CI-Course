
// OVERWRITING ORIGINAL MONGOOSE SOFTWARE

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient();
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function () {
    // 'this' refers to the query that .cache() will be attached to
    // Ex: Blog.find(...).cache()
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function () {
    // 'this' refers to the object calling this whole function. Like 'Blog' or 'User'
    if (!this.useCache) {
        // RUNNING THE ORIGINAL EXEC FUNCTION THAT WE HAVE NOT TOUCHED (BECAUSE CACHE IS OFF)
        console.log("NOT SERVING FROM CACHE");
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        // WE WANT TO COMBINE THE PROPERTIES OF getQueries AND the collection name
        // SO WE CREATE A NEW OBJECT AND THEN COPY THESE PROPERTIES INTO IT
        // 1ST ARG: THE OBJECT TO BE MODIFIED, 2ND,3RD,....: THE DIFF OBJECTS
        // FROM WHICH THE PROPS ARE TO BE COPIED 
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    const cachedData = await client.get(key);

    if (cachedData) {
        // Return right away if cached data found. But the below statement won't work as we are returning
        // just chachedData as JSON, while the actual function expects a mongoose model

        //return cachedData;        

        //SO THE FIX 

        const doc = JSON.parse(cachedData);
        // Basicaly the this.model statement creates a Mongoose model out of the JSON
        // If the cached data is an array (list of blogs), then return a new array 
        // where each item is converted to a model
        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }
    
    const result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result), 'EX', 10);
    
    return result;
}