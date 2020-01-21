var Datastore = require('nedb');
var db = {};

db.accounts = new Datastore({
    filename: './ds/accounts.db'
});
db.users = new Datastore({
    filename: './ds/users.db'
})

db.accounts.loadDatabase()
db.users.loadDatabase()

exports.accounts = function(req, res, next) {
    db.users.findOne({_id: req.params.id}, (err, data) => {
        if (err) {
            console.log(err)
            next(err)
        } else if (data) {
            res.render('accounts.ejs', {name: data.name})
        } else {
            res.status(401).send('No User')
        }
    })
}