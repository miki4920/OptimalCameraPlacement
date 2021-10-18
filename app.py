from flask import Flask, render_template
from flask_socketio import SocketIO

from environment import Environment

app = Flask(__name__)
socket = SocketIO(app)

current_users = {}


@app.route('/')
def index():
    return render_template("environment.html")


@socket.on("connect")
def resolution():
    print(1)


if __name__ == '__main__':
    app.run()
