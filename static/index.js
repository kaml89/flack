const x = document.querySelector('h1');
let roomName = 'room1';

document.addEventListener('DOMContentLoaded',() => {
  const chatMessages = document.querySelector('.chat');
  const chatForm = document.querySelector('.chat-form');
  const selectRoom = document.querySelector('#room');
  const chatInput = document.querySelector('.chat-input');
  const sendButton = document.querySelector('.send-button');
  const newChannelForm = document.querySelector('.new-channel-form');
  const channelsList = document.querySelector('.channels-list');

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


  channelsList.addEventListener('click', (e) => {
    socket.emit('leave', {room: roomName, username: username});
    roomName = e.target.dataset.channel;
    socket.emit('join', {room: roomName, username: username});
    localStorage.setItem('room', roomName);
    loadPage(roomName);
  });

  newChannelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('leave', {room: roomName, username: username});
    roomName = document.querySelector('.new-channel-input').value;
    document.querySelector('.new-channel-input').value = '';
    socket.emit('join', {room: roomName, username: username});
    localStorage.setItem('room', roomName);
    addNewChannel(roomName);
    //console.log(roomName);
    changeRoom();

  }); 

  socket.on('new channel created', (channel) => {
    addNewChannel(channel);
    console.log(channel);
  });

  socket.on('leaving room', (msg) => {
    chatMessages.innerHTML += `<div>${msg}</div>`;
  });

 

  // socket.on('joining room', (msg) => {
  //   chatMessages.innerHTML = '';
  //   console.log(msg['messages']);
  //   msg['messages'].forEach(item => {
  //     const date = new Date(item.time);
  //     document.querySelector('.chat').innerHTML += 
  //       `<div class='message'>
  //           <span class='author'>${item.user}</span> <span class='time'>${date.getHours()}:${date.getMinutes()}</span><br> ${item.message}
      
  //       </div>`
  //    });
  //   document.querySelector('.room-window').innerHTML = `${localStorage.getItem('room')}`;
  // });
  
  chatForm.addEventListener('submit', (e) => {
    socket.emit('chat message', {username: username, message: chatInput.value, time: Date.now(), room: roomName});
    e.preventDefault();
    chatInput.value = '';
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

function loadPage(name) {
  const request = new XMLHttpRequest();
  request.open('GET', `/room/${name}`);
  request.onload = () => {
    const response = JSON.parse(request.responseText);
    document.querySelector('.chat').innerHTML = '';
    // push state to URL
    response.forEach((item) => {
      const date = new Date(item.time);
      document.querySelector('.chat').innerHTML += 
        `<div class='message'>
            <span class='author'>${item.user}</span> <span class='time'>${date.getHours()}:${date.getMinutes()}</span><br> ${item.message}
      
        </div>`
    });
    document.querySelector('.room-window').innerHTML = `${localStorage.getItem('room')}`;
    //history.pushState(null, name, name);
    changeRoom();
  };

  request.send();
}

// wygląd w postaci dymków ala messenger
// css i poprawa wyglądu strony
// 