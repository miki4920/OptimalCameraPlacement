from flask import Flask, render_template
from flask_socketio import SocketIO

from environment import Environment

app = Flask(__name__)
socket = SocketIO(app)


@app.route('/')
def hello_world():
    camera_environment = Environment(100, 100)
    return render_template("environment.html", camera_environment=camera_environment)


if __name__ == '__main__':
    app.run()
