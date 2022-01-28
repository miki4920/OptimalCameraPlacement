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
    constructor(x, y, type) {
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
        this.canvas = document.getElementById("camera_canvas");
        this.board = [];
        this.cameras = [{
            "range": 8,
            "fov": 90
        }];
        this.width = default_size
        this.height = default_size
        this.default_type = "EMPTY";
        this.selected_type = "EMPTY";
        this.update_board();
        this.pixel_resolution = [];
        this.files = {};
    }

    update_board() {
        let width = document.getElementById("width").value
        width = width && !isNaN(width) ? parseInt(width) : default_size;
        let height = document.getElementById("height").value
        height = height && !isNaN(height) ? parseInt(height) : default_size;
        this.create_board(width, height, this.default_type)
    }

    create_board(width, height, type) {
        this.width = width;
        this.height = height;
        let map = [];
        for (let x = 0; x < width; x++) {
            map[x] = [];
            for (let y = 0; y < height; y++) {
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
        this.pixel_resolution = [this.canvas.clientWidth / this.width,
            this.canvas.clientHeight / this.height];
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

    normalise(value, index, type) {
        let result = Math.floor(value / this.pixel_resolution[index]);
        if (type === "x") {
            if (result > this.width - 1) {
                return this.width - 1
            }
        } else if (type === "y") {
            if (result > this.height - 1) {
                return this.height - 1
            }
        }
        return result > 0 ? result : 0;
    }

    draw(x, y, colour) {
        let context = this.get_context();
        context.fillStyle = colour;
        context.fillRect(x * this.pixel_resolution[0], y * this.pixel_resolution[1],
            Math.floor(this.pixel_resolution[0] - 1), Math.floor(this.pixel_resolution[1] - 1));
    }

    sample() {
        let sampling = document.getElementById("sampling_rate");
        let sampling_rate = parseInt(sampling.value);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
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
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.board[x][y].type === "SELECTED") {
                    this.board[x][y].update("CAMERA");
                }
            }
        }
    }



    get_text_file(type) {
        let text = "";
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.board[x][y].type === type) {
                    text += this.board[x][y].x + " " + this.board[x][y].y + "\n";
                }
            }
        }
        text = this.width + this.height + "\n" + text;
        return text
    }

    download(file, text) {
        let element = document.createElement('a');
        element.setAttribute('href',
            'data:text/plain;charset=utf-8, '
            + encodeURIComponent(text));
        element.setAttribute('download', file);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    download_environment() {
        let cameras = this.get_text_file("CAMERA");
        let samples = this.get_text_file("SAMPLE");
        this.download("cameras.txt", cameras);
        this.download("samples.txt", samples);
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




