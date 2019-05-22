import os

from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

messages = {}

@app.route("/")
def index():
    return render_template('index.html', messages=messages)

@app.route("/room/<room>")
def switch_room(room):
  return jsonify(messages[room])


@socketio.on('connected')
def handle_my_event(json):
  print('received message:' + json['data'])
  emit('my response', json, broadcast=True)


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    if room not in messages:
      messages[room] = []
      emit('new channel created', room, include_self=False, broadcast=True)
    emit('joining room', {'messages': messages[room]}, room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit('leaving room', username + ' has left the room.', room=room, include_self=False)

@socketio.on('chat message')
def on_chat_message(data):
    room = data['room']
    emit('new chat message', data, room=room)
    messages[room].append({'user': data['username'], 'message': data['message'], 'time': data['time']})

