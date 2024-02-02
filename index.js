const express = require('express');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
require("dotenv").config()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("gift list server running")
})

app.listen(port, () => {
    console.log(`gist list sever running on ${port}`)
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbsccmb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const userCollection = client.db(`${process.env.DB_USER}`).collection("userCollection")
        const giftCollection = client.db(`${process.env.DB_USER}`).collection("giftCollection")
        app.post("/user", async (req, res) => {

            const result = await userCollection.insertOne(req.body)
            res.send(result);
        })

        app.post("/giftData/:email", async (req, res) => {
            const email = req.params.email;
            const giftData = req.body;
            const _id = Math.floor(Math.random() * 1000).toString();
            giftData.id = _id


            const findCollection = await giftCollection.findOne({ email: email })
            if (findCollection) {
                const result = await giftCollection.updateOne({ email: email }, {
                    $push: {
                        collection: giftData
                    }
                })
                return res.send(result)

            }
            const result = await giftCollection.insertOne({
                "email": email,
                "collection": [giftData]
            })
            res.send(result)

        })

        app.get("/list/:email", async (req, res) => {
            const result = await giftCollection.findOne({ email: req.params.email })

            res.send(result?.collection)
        })
        app.delete("/list", async (req, res) => {
            const email = req.query.email
            const id = req.query.id
            const query = { email: email }
            const result = await giftCollection.updateOne(query, {
                $pull: {
                    collection: { id: id }
                }
            })
            res.send(result)
        })

        app.put("/list/:email", async (req, res) => {
            const email = req.params.email;
            const updateData = req.body
            console.log(updateData.id)
            const result = await giftCollection.updateOne({ email: email }, {
                $pull: {
                    collection: { id: updateData.id }
                }
            })
            if (result.modifiedCount == 1) {
                const result = await giftCollection.updateOne({ email: email }, {
                    $push: {
                        collection: updateData
                    }
                })
                return res.send(result)
            }
        })
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

