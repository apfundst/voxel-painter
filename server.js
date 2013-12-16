var connect = require("connect");

var app = connect.createServer().use(connect.static(__dirname + '/'));

app.listen(3000);
