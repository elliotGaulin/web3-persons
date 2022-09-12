var config = {};

config.mongo = {};

config.mongo.uri = 'mongodb://localhost:27017';
config.mongo.dbName = 'test';
config.mongo.collection = {};
config.mongo.collection.persons = "persons";

module.exports = config;