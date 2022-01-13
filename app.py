import json

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from typing import Dict

from algorithms.genetic_algorithm import GeneticAlgorithm
from algorithms.hill_climbing_algorithm import HillClimbingAlgorithm
from options import options, get_complementary_colour

app = Flask(__name__)
app.jinja_env.globals.update(complementary=get_complementary_colour)
socket = SocketIO(app)


@app.route('/')
def index():
    return render_template("environment.html", options=options)


@socket.on("environment")
def environment(message: Dict[str, str]):
    algorithm = message.get("algorithm")
    board = message.get("board")
    cameras = message.get("cameras")
    algorithms = {
        "hill_climbing_algorithm": HillClimbingAlgorithm,
        "genetic_algorithm": GeneticAlgorithm
    }
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
