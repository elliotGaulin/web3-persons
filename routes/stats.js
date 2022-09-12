const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const config = require("../config");

const { body, validationResult } = require('express-validator');

var express = require('express');
var router = express.Router();

router.get('/eyeColor', async (req, res, next) => {
    const client = new MongoClient(config.mongo.uri);

    try {
        await client.connect();
        const db = client.db(config.mongo.dbName);
        const personsCollection = db.collection(config.mongo.collection.persons);

        let persons = await personsCollection.aggregate([
            { $group: { _id: "$eyeColor", count: { $sum: 1 } } }
        ]).toArray();

        res.json({ persons: persons });
    } catch (error) {
        console.log(error);
        await client.close();
        res.status(500).json({ error: error.message })
    }
});

router.get("/balance/:start/:end", async (req, res, next) => {
    let start = parseInt(req.params.start);
    let end = parseInt(req.params.end);;
    
    if(isNaN(start)){
        res.status(400).json({error: "Your start year is invalid" });
        return;
    }
    if(isNaN(end)){
        res.status(400).json({error: "Your end year is invalid" });
        return;
    }
    
    const client = new MongoClient(config.mongo.uri);
    try {
        await client.connect();
        const db = client.db(config.mongo.dbName);
        const personsCollection = db.collection(config.mongo.collection.persons);

        let persons = await personsCollection.aggregate([
            { 
                $addFields: {
                   year: { $regexFind: { input: "$registered", regex: /[0-9]{4}/ }  }
                } 
            },
            {
                $set: {
                    year: {$toInt : "$year.match"}
                }
            },
            {
                $match: { 
                    $and: [ 
                        { year: {$gte : start } },
                        { year: {$lte : end } },
                    ] 
                }
            },
            {
                $addFields: {
                  "balanceDouble": {$toDouble: {$replaceAll: {input: {$replaceAll: {input: "$balance", find: ",", replacement: ""}}, find: {$literal: "$"}, replacement: ""}}},
                },
            }, 
            {
                $group : {
                    _id: "average",
                    averageBalance : {$avg: "$balanceDouble"}
                }
            }, 
            {
                $project : {
                    _id: 0,
                    averageBalance: 1,
                }
            }
        ]).toArray();

        res.json({ persons: persons });
    } catch (error) {
        console.log(error);
        await client.close();
        res.status(500).json({ error: error.message })
    }
});

module.exports = router;
