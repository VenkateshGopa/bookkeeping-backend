const {MongoClient} = require("mongodb");

const mongo = {
    db: null,
    
    async connect(){
        try{
            const client = new MongoClient(process.env.url);
            await client.connect();
            console.log("Mongo db Connected Successfully !");
            this.db = await client.db(process.env.dbname)
            console.log("Selected Database - " +process.env.dbname);
        }
        catch{
            console.log("Error connecting mongodb")
        }
    }
}

module.exports = mongo