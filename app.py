from flask import Flask, render_template, request
from flask_socketio import SocketIO

from typing import Dict

from environment import Environment
from solver import Solver
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


@socket.on("environment")
def environment(message: Dict[str, str]):
    board_solver = Solver(Environment(message))
    # TODO: Return Data back to the browser
    board_solver.greedy_algorithm()


if __name__ == '__main__':
    app.run()
