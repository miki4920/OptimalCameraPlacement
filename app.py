from flask import Flask, render_template, request
from flask_socketio import SocketIO

from environment import Environment

app = Flask(__name__)
socket = SocketIO(app)

current_users = {}


@app.route('/')
def index():
    return render_template("environment.html")


@socket.on("connect")
def connect():
    current_users[request.sid] = set()


@socket.on("disconnect")
def disconnect():
    del current_users[request.sid]


@socket.on("element")
def element(message):
    position = message.get("position")
    position_set = current_users[request.sid]
    if position not in position_set:
        position_set.add(position)
        print(current_users[request.sid])


if __name__ == '__main__':
    app.run()
