let drawing = false;
let default_size = 11;

class Camera {
    constructor(camera) {
        this.range = camera["camera"]["range"];
        this.fov = camera["camera"]["fov"]
        this.orientation = camera["orientation"]
        this.nodes = camera["nodes"]
    }
}


class Cell {
    constructor(x, y, type="EMPTY") {
        this.x = x
        this.y = y
        this.type = type
        this.colour = Colours[type]
        this.camera = null;
    }

    update(type, camera = null) {
        this.type = type
        this.colour = Colours[type]
        if (camera) {
            this.camera = new Camera(camera);
        } else {
            this.camera = null;
        }
    }
}


class Environment {
    constructor() {
        this.board = [];
        this.cameras = [{
            "range": 8,
            "fov": 90
        }];
        this.size = default_size
        this.selected_type = "EMPTY";
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
        this.update_board();


    }

    update_board() {
        let size = document.getElementById("size").value
        size = size && !isNaN(size) ? parseInt(size) : default_size;
        this.create_board(size)
    }

    create_board(size) {
        this.size = size;
        let map = [];
        for (let x = 0; x < size; x++) {
            map[x] = [];
            for (let y = 0; y < size; y++) {
                map[x].push(new Cell(x, y))
            }
        }
        this.board = map;
        this.update_canvas();
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
        this.pixel_resolution = [this.canvas.clientWidth / this.size,
            this.canvas.clientHeight / this.size];
        this.fill_canvas();

    }

    change_selected_type(type) {
        let elements = Array.from(document.getElementsByClassName("active_option"))
        elements.forEach((element) => {
            element.classList.remove("active_option")
        })
        type.classList.add("active_option");
        this.selected_type = type.value
    }

    normalise(value, index) {
        let result = Math.floor(value / this.pixel_resolution[index]);
        return result > 0 ? result : 0;
    }

    draw(x, y, colour) {
        let context = this.canvas.getContext("2d");
        context.fillStyle = colour;
        context.fillRect(x * this.pixel_resolution[0], y * this.pixel_resolution[1],
            Math.floor(this.pixel_resolution[0] - 1), Math.floor(this.pixel_resolution[1] - 1));
    }

    sample() {
        let sampling = document.getElementById("sampling_rate");
        let sampling_rate = parseInt(sampling.value);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.board[x][y].type === "SAMPLE") {
                    this.board[x][y].update("EMPTY");
                }
                if ((y % sampling_rate === 0 && x % sampling_rate === 0) && this.board[x][y].type === "EMPTY" && sampling_rate !== 1) {
                    this.board[x][y].update("SAMPLE");
                }
            }
        }
        this.update_canvas();
    }

    clean_selection() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.board[x][y].type === "SELECTED") {
                    this.board[x][y].update("CAMERA");
                }
            }
        }
    }

    get_text_file(type) {
        let text = "";
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.board[x][y].type === type) {
                    text += this.board[x][y].x + " " + this.board[x][y].y + "\n";
                }
            }
        }
        text = this.size + "\n" + text;
        return text
    }
}

environment = new Environment()

function update_information(node) {
    document.getElementById("coordinates").innerText = "X: " + node.x + ", Y: " + node.y
    document.getElementById("type").innerText = "Type: " + node.type
    let range = document.getElementById("range")
    let fov = document.getElementById("fov")
    let orientation = document.getElementById("orientation")
    let nodes = document.getElementById("nodes")
    if (node.camera) {
        range.innerText = "Camera Range: " + node.camera.range
        fov.innerText = "Camera FoV: " + node.camera.fov
        orientation.innerText = "Camera Orientation: " + node.camera.orientation
        nodes.innerText = "Camera's Vision: " + node.camera.nodes
    } else {
        range.innerText = ""
        fov.innerText = ""
        orientation.innerText = ""
        nodes.innerText = ""
    }
    let wrapper = document.getElementById("information")
    if (wrapper.style.maxHeight) {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
    }
}




