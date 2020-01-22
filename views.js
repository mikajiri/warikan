
var sqlite = require('sqlite3').verbose();                                          
var db = new sqlite.Database('ds/warikan.db');

exports.accounts = function(req, res, next) {
    let stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    stmt.all(req.params.id, (err, users) => {
        if (users.length > 0) {
            res.render('accounts.ejs', {name: users[0].name})
        } else {
            res.status(401).send('No User')
        }
    })
}