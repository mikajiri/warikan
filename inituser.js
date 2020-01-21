var Datastore = require('nedb');
var users = new Datastore({
    filename: './ds/users.db'
})

users.loadDatabase()

users.insert({name: 'み'})
users.insert({name: 'も'})

