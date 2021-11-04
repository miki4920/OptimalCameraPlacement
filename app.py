from flask import Flask, render_template, request
from flask_socketio import SocketIO

from typing import Dict

from environment import Environment
from options import options

app = Flask(__name__)
socket = SocketIO(app)

current_users = {}


@app.route('/')
def index():
    return render_template("environment.html", options=options)


@socket.on("connect")
def connect():
    current_users[request.sid] = set()


@socket.on("disconnect")
def disconnect():
    del current_users[request.sid]


@socket.on("canvas")
def canvas(message: Dict[str, str]):
    drawn_canvas = message.get("dictionary")
    print(drawn_canvas)


if __name__ == '__main__':
    app.run()
