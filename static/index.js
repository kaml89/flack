const x = document.querySelector('h1');
let roomName = 'room1';

document.addEventListener('DOMContentLoaded',() => {
  const chatMessages = document.querySelector('.chat');
  const selectRoom = document.querySelector('#room');
  const textarea = document.querySelector('textarea');
  const sendMessageButton = document.querySelector('#send-message');

  let username = '';
  if(!localStorage.getItem('username')) {
    username = prompt('Please enter your name','');
    localStorage.setItem('username', username);
  }

  else {
    username = localStorage.getItem('username');
  }
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  
  if(localStorage.getItem('room')) {
    roomName = localStorage.getItem('room');
    socket.emit('join', {room: roomName, username: username});
  }

  socket.on('connect', () => {
    console.log('connected');
  });


  document.querySelector('.channels-list').addEventListener('click', (e) => {
    //console.log(e.target.dataset.channel)
    socket.emit('leave', {room: roomName, username: username});
    roomName = e.target.dataset.channel;
    socket.emit('join', {room: roomName, username: username});
    localStorage.setItem('room', roomName);
    load_page(roomName);
  });

  document.querySelector('.new-channel').addEventListener('click', () => {
    socket.emit('leave', {room: roomName, username: username});
    roomName = document.querySelector('.new-channel-input').value;
    console.log(roomName);
    socket.emit('join', {room: roomName, username: username});
    localStorage.setItem('room', roomName);
    addNewChannel(roomName);

  }); 

  socket.on('new channel created', (channel) => {
    addNewChannel(channel);
    console.log(channel);
  });

  socket.on('leaving room', (msg) => {
    chatMessages.innerHTML += `<div>${msg}</div>`;
  });

  

  // zmienić joining room na zwykły request do serwera xmlhttprequest



  socket.on('joining room', (msg) => {
    chatMessages.innerHTML = '';

    msg['messages'].forEach(item => {
      const date = new Date(item.time);
      document.querySelector('.chat').innerHTML += 
        `<div class='message'>
            <span class='author'>${item.user}</span> <span class='time'>${date.getHours()}:${date.getMinutes()}</span><br> ${item.message}
      
        </div>`
     });
    document.querySelector('.room-window').innerHTML = `${localStorage.getItem('room')}`;
  });
  
  sendMessageButton.addEventListener('click', () => {
    socket.emit('chat message', {username: username, message: textarea.value, time: Date.now(), room: roomName});
    textarea.value = '';
  });
  
  socket.on('new chat message', function(data) {
      //chatMessages.innerHTML += `<div><span>${data.username}</span>: ${data.message}</div>`;
      newMessage(data);
      //console.log(data);
    });
});

function newMessage(data) {
  const date = new Date(data.time);
  const hours = date.getHours();


  document.querySelector('.chat').innerHTML += 
      `<div class='message'>
        <span class='author'>${data.username}</span> <span class='time'>${date.getHours()}:${date.getMinutes()}</span><br> ${data.message}

      </div>`
}

function changeRoom() {
  document.querySelector('.room-window').innerHTML = localStorage.getItem('room');
}

function addNewChannel(channelName) {
  const convertedName = channelName.split(' ').join('-');
  document.querySelector('.channels-list').innerHTML 
      += `<div data-channel='${convertedName}'>${channelName}</div>`;
}

function load_page(name) {
  console.log('aaaaa');
  const request = new XMLHttpRequest();
  request.open('GET', `/room/${name}`);
  request.onload = () => {
    const response = request.responseText;
    console.log(response);
    // const arr = JSON.parse(response);
    // console.log(arr);
    //document.querySelector();
  };
  request.send();
}