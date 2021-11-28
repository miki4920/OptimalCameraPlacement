import json

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from typing import Dict

from solver import Solver
from options import options, get_complementary_colour

app = Flask(__name__)
app.jinja_env.globals.update(complementary=get_complementary_colour)
socket = SocketIO(app)


@app.route('/')
def index():
    return render_template("environment.html", options=options)


@socket.on("environment")
def environment(message: Dict[str, str]):
    board_solver = Solver(message.get("board"), message.get("cameras"))
    solution = board_solver.greedy_algorithm()
    solution = solution if solution else []
    emit("update_board", json.dumps(solution), to=request.sid)


if __name__ == '__main__':
    app.run()
