class Camera {
    constructor(camera) {
        this.range = camera["camera"]["range"];
        this.fov = camera["camera"]["fov"]
        this.orientation = camera["orientation"]
        this.nodes = camera["nodes"]
    }
}


class Cell {
    constructor(x, y, type = "EMPTY") {
        this.x = x
        this.y = y
        this.type = type
        this.camera = null;
    }

    update(type, camera = null) {
        this.type = type
        if (camera) {
            this.camera = new Camera(camera);
        } else {
            this.camera = null;
        }
    }
}


class Environment {
    constructor(size) {
        this.board = [];
        this.size = size
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

    get_text_file() {
        let text = "";
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let type = this.board[x][y].type
                type = type === "SELECTED" ? "CAMERA" : type;
                text += this.board[x][y].x + " " + this.board[x][y].y + " " + type + "\n";

            }
        }
        text = this.size + "\n" + text;
        return text
    }
}

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




