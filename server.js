// express load
const express = require("express");
const app = express();
var path = require('path');
const logger = require('./logger/logger').Logger
const mongoClient = require("mongodb").MongoClient;

let db;
//connect to mongodb
mongoClient.connect("mongodb+srv://MongoDbUser:DbUser1@cw2.8lvlz.mongodb.net/", (err, client) => {
    db = client.db('webstore');
})

//parse request params
app.use(express.json());

//Logs all request
app.use(logger);

// Public files and folders

app.use(express.static('frontend'))

//get collection name
app.param("collectionName", (request, response, next, collectionName) => {
    request.collection = db.collection(collectionName)
    return next()
})

//message for root path to show api is working
app.get('/', (request, response, next) => {
    response.sendFile('frontend/index.html', {root: __dirname })
})
// retrieve all objects from an collection
app.get("/collection/:collectionName", (request, response, next) => {
    request.collection.find({}, {limit: 5, sort: [['price', -1]]}).toArray((e, results) => {
        if (e) return next(e);
        response.send(results);
    })
})

// this is to add an object
app.post('/collection/:collectionName', (request, response, next) => {
    request.collection.insertMany(request.body, (e, results) => {
        console.log('insert', request.body)
        if (e) return next (e);
        response.send(results.ops)
    })
})
// this is to retrieve object via mongodb ID
const ObjectID = require ('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.findOne({_id: new ObjectID(request.params.id) }, (e, result) => {
        if (e) return next(e)
        response.send(result)
    })
})
// this will modify object by ID
app.put("/collection/:collectionName/:id", (request, response, next) => {
    console.log(request.body , request.params.id)
    request.collection.updateOne(
        {id: Number(request.params.id)},
        {$set: request.body},
        { multi: false},
        (e, result) => {
            if (e) return next(e);
            console.log(result)
            response.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})
// this will delete an object
app.delete('collection/:collectionName/:id', (request, response, next) => {
    request.collection.deleteOne(
        {_id: ObjectID(request.params.id)},
        (e, result) => {
            if (e) return next(e)
            response.send((result.result.n === 1) ? {msg:'success'} : {msg:'error'})
        }
    )
})

app.listen(process.env.PORT ||3000, ()=> {
    console.log("express server is running at local host 3000")
})