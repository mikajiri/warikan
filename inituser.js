var sqlite = require('sqlite3').verbose();                                          
var db = new sqlite.Database('ds/warikan.db');

db.serialize(function() {
    let stmt = db.prepare("INSERT INTO users VALUES (null, 'み'), (null, 'も')")
    stmt.run()
    stmt.finalize()
})

db.close()