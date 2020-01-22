var sqlite = require('sqlite3').verbose();                                          
var db = new sqlite.Database('ds/warikan.db');

exports.registerItem = function (req, res) {
    let _item = req.body.item
    let _creditorId = req.body.creditorId
    let _price = req.body.price
    let _dt = new Date()

    db.serialize(function() {
        let sql = `
            INSERT INTO
                accounts
            VALUES (
                null,
                ?,
                ?,
                ?,
                0,
                ?,
                null
            )
        `
        let stmt = db.prepare(sql)
        stmt.run([_creditorId, _item, _price, datetostr(_dt)])
        stmt.finalize()
        res.send({})
    })
}

exports.deleteItem = function(req, res) {
    res.send({})
}

exports.markItemAsPayed = function(req, res) {
    db.serialize(function() {
        let sql = `
            UPDATE
                accounts
            SET
                payed = 1,
                payed_at = ?
            WHERE
                id = ?
        `
        let stmt = db.prepare(sql)
        stmt.run([datetostr(new Date()), req.params.id])
        stmt.finalize()
        res.send({})
    })
}

exports.markItemAsPayedAll = function(req, res) {
    db.serialize(function() {
        let sql = `
            UPDATE
                accounts
            SET
                payed = 1,
                payed_at = ?
        `
        let stmt = db.prepare(sql)
        stmt.run([datetostr(new Date()), req.params.id])
        stmt.finalize()
    })
    res.send({})
}

exports.listItems = function(req, res) {
    let limit = req.query.limit
    if (limit === undefined) {
        limit = 10
    } else {
        limit = parseInt(limit)
    }
    let offset = req.query.offset
    if (offset === undefined) {
        offset = 0
    } else {
        offset = parseInt(offset)
    }

    db.serialize(function() {
        let sql = `
            SELECT
                a.id id,
                a.item item,
                a.price price,
                a.payed payed,
                a.purchased_at purchasedAt,
                u.id creditorId,
                u.name creditor
            FROM
                users u
                LEFT JOIN
                    accounts a
                ON
                    u.id = a.creditor_id
            ORDER BY
                a.id DESC
            LIMIT ? OFFSET ?
        `
        let stmt = db.prepare(sql)
        stmt.all([limit, offset], (err, rows) => {
            res.send(rows.filter(x => x.id))
        })
    })
}

exports.listUsers = function(req, res) {
    res.send(db.users.getAllData())
}

function datetostr(date, format, is12hours=false) {
    if (date == null) {
        return null
    }
    var weekday = ["日", "月", "火", "水", "木", "金", "土"];
    if (!format) {
        format = 'YYYY-MM-DD hh:mm:ss'
    }
    var year = date.getFullYear();
    var month = (date.getMonth() + 1);
    var day = date.getDate();
    var weekday = weekday[date.getDay()];
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var secounds = date.getSeconds();

    var ampm = hours < 12 ? 'AM' : 'PM';
    if (is12hours) {
        hours = hours % 12;
        hours = (hours != 0) ? hours : 12; // 0時は12時と表示する
    }

    var replaceStrArray =
        {
            'YYYY': year,
            'Y': year,
            'MM': ('0' + (month)).slice(-2),
            'M': month,
            'DD': ('0' + (day)).slice(-2),
            'D': day,
            'WW': weekday,
            'hh': ('0' + hours).slice(-2),
            'h': hours,
            'mm': ('0' + minutes).slice(-2),
            'm': minutes,
            'ss': ('0' + secounds).slice(-2),
            's': secounds,
            'AP': ampm,
        };

    var replaceStr = '(' + Object.keys(replaceStrArray).join('|') + ')';
    var regex = new RegExp(replaceStr, 'g');

    ret = format.replace(regex, function (str) {
        return replaceStrArray[str];
    });

    return ret;
}