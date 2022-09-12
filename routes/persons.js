const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const config = require("../config");

const { body, validationResult } = require('express-validator');

const statsRouter = require("./stats");

var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  const client = new MongoClient(config.mongo.uri);

  try {
    await client.connect();
    const db = client.db(config.mongo.dbName);
    const personsCollection = db.collection(config.mongo.collection.persons);

    let persons = await personsCollection.find({}).toArray();
    res.json({ persons: persons });

  } catch (error) {
    console.log(error);
    await client.close();
    res.status(500).json({ error: error.message });
  }

});

router.get('/:id', async (req, res, next) => {
  const client = new MongoClient(config.mongo.uri);

  try {
    await client.connect();
    const db = client.db(config.mongo.dbName);
    const personsCollection = db.collection(config.mongo.collection.persons);

    let person = await personsCollection.findOne({ _id: mongo.ObjectId(req.params.id) });
    res.json({ person: person });

  }
  catch (error) {
    console.log(error);
    await client.close();
    res.status(500).json({ error: error.message });
  }

});

router.post('/',
  body('name').isObject(),
  body('name.first').isString(),
  body('name.last').isString(),
  body('age').isInt().not().isEmpty(),
  body('registered').matches(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\, (January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{1,2}\, [0-9]{4} [0-9]{1,2}:[0-9]{2} [AP]M$/gm), //Input en ISO8601 pour simplification des opérations de date
  body('balance').matches(/^\$([0-9]{1,3},([0-9]{3},)*[0-9]{3})(.[0-9][0-9])?$/gm),
  body('isActive').isBoolean(),
  body('picture').optional().isURL(),
  body('eyeColor').optional().isIn(['blue', 'brown', 'green']),
  body('company').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().isString(),
  body('about').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  body('tags').optional().isArray(),
  body('tags.*').isString(),
  body('friends').optional().isArray(),
  body('friends.*').isObject(),
  body('friends.*.name').isString(),
  body('greeting').optional().isString(),
  body('favoriteFruit').optional().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors);
      return;
    }

    const client = new MongoClient(config.mongo.uri);
    try {
      await client.connect();
      const db = client.db(config.mongo.dbName);
      const personsCollection = db.collection(config.mongo.collection.persons);

      let result = await personsCollection.insertOne(req.body);
      res.json({ result: result });

    } catch (error) {
      console.log(error);
      await client.close();
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete('/:id', async (req, res, next) => {
  const client = new MongoClient(config.mongo.uri);
  
  try {
    await client.connect();
    const db = client.db(config.mongo.dbName);
    const personsCollection = db.collection(config.mongo.collection.persons);

    let result = await personsCollection.deleteOne({ _id: mongo.ObjectId(req.params.id) });
    res.json({ result: result });

  } catch (error) {
    console.log(error);
    await client.close();
    res.status(500).json({ error: error.message });
  }

});

router.put('/:id',
  body('name').isObject(),
  body('name.first').isString(),
  body('name.last').isString(),
  body('age').isInt().not().isEmpty(),
  body('registered').matches(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\, (January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{1,2}\, [0-9]{4} [0-9]{1,2}:[0-9]{2} [AP]M$/gm), //Input en ISO8601 pour simplification des opérations de date
  body('balance').matches(/^\$([0-9]{1,3},([0-9]{3},)*[0-9]{3})(.[0-9][0-9])?$/gm),
  body('isActive').isBoolean(),
  body('picture').optional().isURL(),
  body('eyeColor').optional().isIn(['blue', 'brown', 'green']),
  body('company').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().isString(),
  body('about').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  body('tags').optional().isArray(),
  body('tags.*').isString(),
  body('friends').optional().isArray(),
  body('friends.*').isObject(),
  body('friends.*.name').isString(),
  body('greeting').optional().isString(),
  body('favoriteFruit').optional().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors);
      return;
    }

    const client = new MongoClient(config.mongo.uri);
    try {
      await client.connect();
      const db = client.db(config.mongo.dbName);
      const personsCollection = db.collection(config.mongo.collection.persons);

      let result = await personsCollection.updateOne({ _id: mongo.ObjectId(req.params.id) }, { $set: req.body });
      res.json({ result: result });

    } catch (error) {
      console.log(error);
      await client.close();
      res.status(500).json({ error: error.message });
    }
  }
);

router.use('/stats', statsRouter);



module.exports = router;
