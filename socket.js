const express = require('express');
const app = express(); 
const http = require("http");
const server =  new http.Server(app);
//const Redis = require("ioredis");
//const redisAdapter = require('socket.io-redis');
const axios = require('axios');

require('dotenv').config()

const io = require('socket.io')(server, {
  transports: ['websocket'],
  maxHttpBufferSize: 5e8,
  cors: {
    origin: "*"
  }
});





io.use((socket, next) => {
  
  if (isValidJwt(token)){
      next();
  }else{
      next(new Error("Socket authentication error"));
  }
});


/*
const startupNodes = [
  {
    port: 6380,
    host: '127.0.0.1'
  },
  {
    port: 6381,
    host: '127.0.0.1'
  }
];


io.adapter(redisAdapter({
  pubClient: new Redis.Cluster(startupNodes),
  subClient: new Redis.Cluster(startupNodes)
})).on('error', function(err) {
  console.log(err)
});;


const pubClient = new Redis.Cluster([
  {
    host: "localhost",
    port: 6379,
  },
  {
    host: "localhost",
    port: 6379,
  },
]);

const subClient = pubClient.duplicate();

io.adapter(redisAdapter({
  key: 'adapterKey',
  pubClient: pubClient,
  subClient: subClient,
}));
*/
//possibilidade de escala utilizando redis e loadbalancer 
//const  REDIS_URL  = process.env.REDIS_URL;
//const renderRedis = new Redis(REDIS_URL);

io.on('connection', (socket) => { 
  const connected_number = io.sockets.count;
  const token = socket.handshake.auth.token;
  const clientIp = socket.request.connection.remoteAddress;
 try {
   axios.put('http://localhost:8000/user/update/online',{
    ip:'socket'
   }, {headers:{Authorization:token}}).then((res)=>{
  });
 }
catch(e){
}
  clients.sockets.forEach(function(data, counter) {
      const socketid = data.handshake.headers.origin; // Log ids
      const result = connecteds.find(element => element === socketid);

      if(!result){
        connecteds.push(socketid);  
     }
     else { 
        data.disconnect();
        io.sockets.connected[data.id].disconnect();
    }
  }); //  numero de clients conectados


 socket.on('chat', (chat, callback) => { 
  const queue_confirmed = [];
 const queue_messages = chat.data ?? [];
   try {
   chat.data[0]['id'] = chat.sender_id
   socket.broadcast.emit('chat_'+chat.data[0].receiver_id,chat.data[0] );  
   if (Array.isArray(queue_messages)){   
  queue_messages.forEach((msg, index)=>{  
  message_obj = {sender_id:chat.sender_id, message:msg}
  msg["sender_id"] = chat.sender_id


  renderRedis.get(msg.receiver_id).then((messages) => {
   var array_messages = Array.isArray(messages) ?  messages ?? [] : [];
       array_messages.push(message_obj);
         renderRedis.set(msg.receiver_id, array_messages);
   });
   
  socket.broadcast.emit(msg.receiver_id,msg );  

  callback({
    status: "ok",
    count:chat?.data?.length
  });

  queue_confirmed.push(index) 
   queue_confirmed.length === queue_messages.length ?
   socket.emit('confirmed_'+chat.sender_id, {'sent':true}) 
    :  null;
    
         })
        }
   }
   catch (e) {
 console.log(e)
   }


      
 });

  socket.on('midia', (info) => {
    const type = typeof info.type == 'string'  ? info.type.slice(0,info.type.indexOf('/')) : null;
    if(type === "video" || type === "image")
  axios.post('http://172.17.0.1:8000/upload/'+'midia', {midia:info.data, type:info.type})
   .then((res)=>{
     socket.broadcast.emit('midia_received', res); // retorna para client que midia foi recebida
   }).catch((err)=>{
   })
  })


 socket.on('update_chat', (data) => { 
  //chama o emit ao conectar
if (data.receiver_id){ //data = {id: id de quem quer receber os updates}
    renderRedis.get(data.receiver_id).then((messages) => {
    messages =  messages ?? []
    messages.forEach((msg)=>{
         socket.broadcast.emit('chat_'+msg.receiver_id, msg);//channel que o usuário ta inscrito para receber suas mensagens individuais  
       })
    });
  }
 });

 socket.on('received_message', (data) => { 
  //client ao receber mensagem envia emit para este channel
  if (data.receiver_id){
    renderRedis.get(data.receiver_id).then((messages) => {
    messages =  messages ?? []
    messages.forEach((item, index)=>{
      item.id_message == data.id_message ? delete messages[index] : null;
      })
    renderRedis.set(data.receiver_id,messages );
    });
  }
 });
});

io.on('error', (socket) => { 

})


server.listen(process.env.PORT, ()=>{
 // console.log("connected")
});
