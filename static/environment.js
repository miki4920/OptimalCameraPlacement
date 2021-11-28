let default_size = 10;
let drawing = false;

let socket = io("http://127.0.0.1:5000/");

class Camera{
    constructor(camera) {
        this.range = camera["range"];
        this.fov = camera["fov"]
        this.orientation = camera["orientation"];
    }
}


class Cell {
    constructor(x, y, type) {
        this.x = x
        this.y = y
        this.type = type
        this.colour = Colours[type]
        this.manual_sample = false
        this.camera = null;
    }

    update(type, manual=false, camera=null) {
        this.type = type
        this.colour = Colours[type]
        this.manual_sample = manual
        if(camera) {
            this.camera = new Camera(camera);
        }
    }
}


class Environment {
    constructor(size, default_type) {
        this.canvas = document.getElementById("camera_canvas");
        this.board = [];
        this.cameras = [{"range": 5,
        "fov": 90}];
        this.width = size
        this.height = size
        this.default_type = default_type;
        this.selected_type = default_type;
        this.create_board(default_type);
        this.pixel_resolution = [];
    }

    update_board() {
        this.width = document.getElementById("width").value
        this.height = document.getElementById("height").value
        this.create_board(this.default_type)
    }

    create_board(type) {
        let map = [];
        for (let x = 0; x < this.width; x++) {
            map[x] = [];
            for (let y = 0; y < this.height; y++) {
                map[x].push(new Cell(x, y, type,))
            }
        }
        this.board = map;
        this.update_canvas();
    }

    get_context() {
        return this.canvas.getContext("2d");
    }

    fill_canvas() {
        this.board.forEach((row) => {
            row.forEach((element) => {
                this.draw(element.x, element.y, element.colour)
            })
        })
    }

    update_canvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        let width = document.getElementById('width').value;
        width = width && !isNaN(width) ? parseInt(width) : default_size;
        let height = document.getElementById('height').value;
        height = height && !isNaN(height) ? parseInt(height) : default_size;

        this.pixel_resolution = [this.canvas.clientWidth / width,
            this.canvas.clientHeight / height];
        this.fill_canvas();
    }

    change_selected_type(type) {
        this.selected_type = type
    }

    normalise(value, index) {
        let result = Math.floor(value / this.pixel_resolution[index]);
        return result > 0 ? result : 0; 
    }

    draw(x, y, colour) {
        let context = this.get_context();
        context.fillStyle = colour;
        context.fillRect(x*this.pixel_resolution[0], y*this.pixel_resolution[1],
            Math.floor(this.pixel_resolution[0] -1), Math.floor(this.pixel_resolution[1] -1));
    }

    sample() {
        let sampling_rate = parseInt(document.getElementById("sampling_rate").value);
        for(let x=0; x<this.width; x++) {
            for(let y=0; y<this.height; y++) {
                if(this.board[x][y].type === "SAMPLE" && !this.board[x][y].manual_sample) {
                    this.board[x][y].update("EMPTY");
                }
                if((y % sampling_rate === 0 && x% sampling_rate === 0) && this.board[x][y].type === "EMPTY" && sampling_rate !== 1) {
                    this.board[x][y].update("SAMPLE");
                }
            }
        }
        this.update_canvas();
    }

    clean_selection() {
        for(let x=0; x<this.width; x++) {
            for(let y=0; y<this.height; y++) {
                if(this.board[x][y].type === "SELECTED") {
                    this.board[x][y].update("CAMERA");
                    this.board[x][y].camera.orientation = null;
                }
            }
        }
    }
}

function update_position(x, y) {
    document.getElementById("position").innerText = "X: " + x+ ", Y: " + y
}

function set_event_listeners(environment) {
    environment.canvas.addEventListener("mousedown", function () {
        drawing = true
    })
    environment.canvas.addEventListener("mouseup", function () {
        drawing = false
    })
    environment.canvas.addEventListener("mousemove", function (e) {
        let x = environment.normalise(e["layerX"], 0);
        let y = environment.normalise(e["layerY"], 1);
        update_position(x, y, environment);
        if (drawing) {
            environment.board[x][y].update(environment.selected_type, true)
            environment.update_canvas()
        }
    })
    window.onload = window.onresize = function () {
        environment.update_canvas();
    }
}

environment = new Environment(default_size, "EMPTY")
set_event_listeners(environment)

function send_environment() {
    environment.clean_selection();
    socket.emit("environment", {"board": environment.board, "cameras": environment.cameras});
}

socket.on("update_board", (message) => {
    message = JSON.parse(message)
    message.forEach((element) => {
        let x = element[0][0];
        let y = element[0][1];
        environment.board[x][y].update("SELECTED", environment.board[x][y].camera);

    })
    environment.update_canvas();
})

