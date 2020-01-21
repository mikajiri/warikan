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

exports.registerItem = function (req, res) {
    let _item = req.body.item
    let _creditorId = req.body.creditorId
    let _price = req.body.price
    let _dt = new Date()

    db.accounts.insert({
        creditorId: _creditorId,
        price: _price,
        item: _item,
        payed: false,
        purchasedAt: _dt,
        payedAt: null
    }, (e, doc) => {
        res.send(doc)
    })
}

exports.deleteItem = function(req, res) {
    const query = { '_id': req.params.id }
    db.accounts.remove(query, {}, (error, numOfDocs) => {
        if (error) {
            res.send(error)
        } else {
            res.send({num: numOfDocs})
        }
    })
}

exports.markItemAsPayed = function(req, res) {
    const query = { _id: req.params.id };
    const _dt = new Date()
    const update = {
        $set: { 
            payed: true,
            payedAt: _dt
        }
    };
    db.accounts.update(query, update, {}, (error, numOfDocs) => {
        if (error) {
            res.send(error)
        } else {
            res.send({num: numOfDocs})
        }
    });
}

exports.markItemAsPayedAll = function(req, res) {
    const query = { payed: false };
    const _dt = new Date()
    const update = {
        $set: { 
            payed: true,
            payedAt: _dt
        }
    };
    db.accounts.update(query, update, {multi: true}, (error, numOfDocs) => {
        if (error) {
            res.send(error)
        } else {
            res.send({num: numOfDocs})
        }
    });
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
    limit += offset
    let users = db.users.getAllData()
    let userMap = {}
    for (let u of users) {
        userMap[u._id] = u.name
    }
    let resp = db.accounts.getAllData().map(account => {
        return {
            id: account._id,
            creditorId: account.creditorId,
            creditor: userMap[account.creditorId],
            item: account.item,
            price: account.price,
            payed: account.payed,
            purchasedAt: datetostr(account.purchasedAt, 'M月D日'),
            sk: account.purchasedAt.getTime()
        }
    })
    resp.sort(function(a, b) {
        return b.sk - a.sk
    })
    res.send(resp.slice(offset, limit))
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
        format = 'YYYY/MM/DD'
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