import json

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from typing import Dict

from environment import Environment
from solver import Solver
from options import options

app = Flask(__name__)
socket = SocketIO(app)


@app.route('/')
def index():
    return render_template("environment.html", options=options)


@socket.on("environment")
def environment(message: Dict[str, str]):
    board_solver = Solver(Environment(message))
    solution = board_solver.greedy_algorithm()
    emit("update_board", json.dumps(solution), to=request.sid)


if __name__ == '__main__':
    app.run()
