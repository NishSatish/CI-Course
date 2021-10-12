// GLOBAL JEST SETUP: EXECUTES ADDITIONAL CODE SINCE JEST DOES NOT EXECUTE ANYTHING
// OTHER THAN .test.js FILES
require('../models/User');
const mongoose = require('mongoose');
const keys = require('../config/keys');
console.log(keys.mongoURI);

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });