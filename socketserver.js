const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors());
//const server = app.listen(3003)

/*app.get("/socket.io", (req, res) => {
    console.log(111)
})*/

/*app.all('*', function (req, res, next) {
    console.log(222)
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "PUT,GET,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,username");
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});*/
/*app.use(function (req, res, next) {
    console.log(333)
    next()
})*/
const server = app.listen(3000, (req, res) => {
    console.log('ok')
})
//const io = (server)
//console.log(server.request)
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
let listeners = {}
app.get("/getListener", (req, res) => {
    //console.log(req.query)
    res.json({ data: listeners[req.query.socketname] });
})
app.get("/getOfflineUsers", (req, res) => {
    //console.log(req.query)
    res.json({ data: offlineuserlist });
})
let members = 0;
let socketlist = {}
let onlineuserlist = []
let offlineuserlist = []
let userlist = []
io.on("connection", (socket) => {
    console.log("success")
    //console.log(socket.client)
    socket.on("onemessager", (data, name, myname, common) => {
        // console.log(name)
        //console.log(socketlist)
        if (socketlist[name]) {
            //socket.broadcast.emit('onemsg', data, name)
            //console.log(socketlist[name])
            listeners[myname] = true
            socket.to(socketlist[name].id).emit("onemsg", data, myname, common)
        }
    })
    socket.on("messager", (data, name) => {
        //console.log(data, name)
        socket.broadcast.emit("gbmsg", data, name)
    })
    socket.on("joingroup", (data) => {
        console.log("joingroup", data)
        if (!socketlist[data]) {

            onlineuserlist.push(data)
            for (let i = 0, len = offlineuserlist.length; i < len; ++i) {
                if (offlineuserlist[i] == data) {
                    offlineuserlist.splice(i, 1)
                    break;
                }
            }
            socket.name = data
            //socket.id = members
            listeners[data] = false
            socketlist[data] = socket
            members++;
            console.log(111, members)
            for (let i = 0, len = userlist.length; i < len; ++i) {
                if (userlist[i] == socket.name) {
                    userlist.splice(i, 1)
                    break;
                }
            }
            userlist.push(data)
            socket.emit("member", members, data, userlist);
            socket.broadcast.emit("member", members, data, userlist)
        }

    })
    socket.on("disconnecting", () => {
        console.log("disconnect", socket.name)
        if (socketlist[socket.name]) {
            members--
            delete socketlist[socket.name]
            listeners[socket.name] = false
            //let userlist = [...onlineuserlist, ...offlineuserlist]
            //offlineuserlist.push(socket.name)
            /*for (let i = 0, len = userlist.length; i < len; ++i) {
                if (userlist[i] == socket.name) {
                    userlist.splice(i, 1)
                    break;
                }
            }*/
            offlineuserlist.push(socket.name)
            for (let i = 0, len = offlineuserlist.length; i < len; ++i) {
                if (onlineuserlist[i] == socket.name) {
                    onlineuserlist.splice(i, 1)
                    break;
                }
            }
            console.log(socket.name, members)
            socket.broadcast.emit("quit", socket.name, members, userlist)
        }
    })
})





