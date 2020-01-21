var express = require('express');
var app = express();
var api = require('./api')
var views = require('./views')
const bodyParser = require('body-parser')
const port = 5123

// Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/* API */
// 一覧
app.get('/items', api.listItems)
app.get('/users', api.listUsers)

// 登録
app.post('/items', api.registerItem)

// 更新
app.put('/items/pay/:id', api.markItemAsPayed)
app.put('/items/payall', api.markItemAsPayedAll)

// 削除
app.delete('/items/:id', api.deleteItem)

/* Views */
app.use(express.static('public'));
app.get('/accounts/:id', views.accounts)

app.listen(port, () => console.log(`Listening on :${port}`))