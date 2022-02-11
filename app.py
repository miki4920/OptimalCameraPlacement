import json

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from typing import Dict

from option_dictionaries.tile_options import tiles, get_complementary_colour
from option_dictionaries.algorithm_options import algorithms, get_capitalised_name

app = Flask(__name__)
app.jinja_env.globals.update(complementary=get_complementary_colour)
app.jinja_env.globals.update(capitalise=get_capitalised_name)
socket = SocketIO(app)


@app.route('/')
def index():
    return render_template("environment.html", tile_options=tiles, algorithm_options=algorithms)


@socket.on("environment")
def environment(message):
    algorithm = message.get("algorithm")
    board = message.get("board")
    cameras = list(message.get("cameras").values())
    algorithm = algorithms.get(algorithm)
    objective = int(message.get("objective"))
    if not algorithm:
        return
    algorithm = algorithm(board, cameras, objective)
    solution, coverage = algorithm.solve()
    solution = [camera.json() for camera in solution] if solution else {}
    data = {"solution": solution, "coverage": round(coverage, 2)}
    emit("update_board", json.dumps(data), to=request.sid)


if __name__ == '__main__':
    app.run()
