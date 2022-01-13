import json

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from typing import Dict

from option_dictionaries.tile_options import tiles, get_complementary_colour
from option_dictionaries.algorithm_options import algorithms

app = Flask(__name__)
app.jinja_env.globals.update(complementary=get_complementary_colour)
socket = SocketIO(app)


@app.route('/')
def index():
    return render_template("environment.html", tile_options=tiles, algorithm_options=algorithms)


@socket.on("environment")
def environment(message: Dict[str, str]):
    algorithm = message.get("algorithm")
    board = message.get("board")
    cameras = message.get("cameras")

    algorithm = algorithms.get(algorithm)
    if not algorithm:
        return
    algorithm = algorithm(board, cameras)
    solution, coverage = algorithm.solve()
    solution = solution if solution else {}
    data = {"solution": solution, "coverage": round(coverage, 2)}
    emit("update_board", json.dumps(data), to=request.sid)


if __name__ == '__main__':
    app.run()
