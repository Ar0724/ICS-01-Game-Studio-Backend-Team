  // Server Setup & Dependancies 
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
// const updatePos = require("./multiplayer/updatePosition.js");
const io = require('socket.io')(server, {
    cors: {
        origin: '*', // You can restrict this to specific domains if needed.
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.static('public'));

// Our Imports
const clientConnect = require('./client/clientConnect.js');
const clientIdentify = require('./client/clientIdentify.js')
const clientLogin = require('./client/clientLogin.js');
const clientMessage = require('./client/clientMessage.js');
const clientDisconnect = require('./client/clientDisconnect.js');
const sortUsersByPoints = require('./datamanagement/getLeaderboard.js');
const startGame = require('./multiplayer/timer.js');
const fooddelete = require('./food/foodDelete.js');
// Generate Food
require('./food/foodManagement.js');

let intervalID;

io.on('connection', (socket) => {

    // Handle Client Connections
    clientConnect(socket, io);

    // Handle Client Messages
    socket.on('ident', (message) => {
        clientIdentify(message, socket, io)
    });

    socket.on('login', (message) => {
        clientLogin(message, socket, io)
    });

    // Handle Client Messages
    socket.on('message', (message) => {
        clientMessage(message, socket, io)
    });

    socket.on('foodcollision', (message) => {
        console.log(socket.id, message)
        fooddelete(message, socket, io)
    });

  socket.on('foodarray', (message) => {
        console.log(socket.id, message)
    });

    // Handle Client Disconnections
    socket.on('disconnect', () => {
        clientDisconnect(socket, io);
    });
  
    socket.on('updateclientposition', (message) => {
        // Expect {"username:" //, "x": //, "y": //}
        updatePosition(message, socket, io);
    });

    // Start sending test messages to all clients in the 'users' room
    if (!intervalID) {
        intervalID = setInterval(() => {
            //console.log("Test message sent to users")
            io.to('user').emit(
                'message',
                'This is a test message from the server!');
        }, 10000);
    }
        
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});

sortUsersByPoints();
//startGame();