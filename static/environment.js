let default_size = 11;
let drawing = false;


let socket = io("http://127.0.0.1:5000/");

class Camera {
    constructor(camera) {
        this.range = camera["range"];
        this.fov = camera["fov"]
        this.orientation = camera["orientation"]
        this.nodes = camera["nodes"].map(a => "(" + a.join(", ") + ")").join("; ");
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

    update(type, manual = false, camera = null) {
        this.type = type
        this.colour = Colours[type]
        this.manual_sample = manual
        if (camera) {
            this.camera = new Camera(camera);
        } else {
            this.camera = null;
        }
    }
}


class Environment {
    constructor(size, default_type) {
        this.canvas = document.getElementById("camera_canvas");
        this.board = [];
        this.cameras = [{
            "range": 4,
            "fov": 90
        }];
        this.width = size
        this.height = size
        this.default_type = default_type;
        this.selected_type = default_type;
        this.update_board();
        this.pixel_resolution = [];
        this.cameras_file = "";
        this.samples_file = "";
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
                if (this.board[x][y].type === "SAMPLE" && !this.board[x][y].manual_sample) {
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

    process_text(text) {
        text = text.split("\n");
        text = text.slice(1, text.length - 1)
        for (let i = 0; i < text.length; i++) {
            text[i] = text[i].split(" ");
            text[i] = text[i].slice(1, 3);
            text[i] = text[i].map(number => Math.abs(parseInt(number)));
        }
        let set = new Set(text.map(JSON.stringify));
        text = Array.from(set).map(JSON.parse);
        text = text.sort(function (a, b) {
            if (a[0] === b[0]) {
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        return text;
    }

    set_camera_file(e) {
        let camera_reader = new FileReader();
        camera_reader.onload = function (e) {
            environment.cameras_file = environment.process_text(e.target.result);
        };
        camera_reader.readAsText(e.target.files[0]);
    }

    set_sample_file(e) {
        let sample_reader = new FileReader();
        sample_reader.onload = function (e) {
            environment.samples_file = environment.process_text(e.target.result);
        };
        sample_reader.readAsText(e.target.files[0]);
    }

    update_environment_based_on_files() {
        if (!this.cameras_file || !this.samples_file) {
            return;
        }
        let cameras_dimensions = this.cameras_file[this.cameras_file.length - 1];
        if(cameras_dimensions.length === 0) {
            cameras_dimensions = [[1, 1]];
        }
        let samples_dimensions = this.samples_file[this.samples_file.length - 1];
        if(samples_dimensions.length === 0) {
            cameras_dimensions = [[1, 1]];
        }
        this.create_board(Math.max(cameras_dimensions[0], samples_dimensions[0])+1,
            Math.max(cameras_dimensions[1], samples_dimensions[1])+1, this.default_type);
        this.change_selected_type(document.getElementById("CAMERA"));
        for(let i=0; i<this.cameras_file.length; i++) {
            this.board[this.cameras_file[i][0]][this.cameras_file[i][1]].update(environment.selected_type, true)
        }
        this.change_selected_type(document.getElementById("SAMPLE"));
        for(let i=0; i<this.samples_file.length; i++) {
            this.board[this.samples_file[i][0]][this.samples_file[i][1]].update(environment.selected_type, true)
        }
        this.update_canvas();
        this.change_selected_type(document.getElementById("EMPTY"));

    }

    get_text_file(type) {
        let text = "";
        let count = 0;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.board[x][y].type === type) {
                    text += count + " " + this.board[x][y].x + " " + this.board[x][y].y + "\n";
                    count += 1;
                }
            }
        }
        text = count + "\n" + text;
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

function set_event_listeners(environment) {
    environment.canvas.addEventListener("mousedown", function () {
        drawing = true
    })
    environment.canvas.addEventListener("mouseup", function () {
        drawing = false
    })
    environment.canvas.addEventListener("mousemove", function (e) {
        let x = environment.normalise(e["layerX"], 0, "x");
        let y = environment.normalise(e["layerY"], 1, "y");
        update_information(environment.board[x][y]);
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
    let algorithm = document.getElementById("algorithm").value;
    socket.emit("environment", {"board": environment.board, "cameras": environment.cameras, "algorithm": algorithm});
}

socket.on("update_board", (message) => {
    message = JSON.parse(message)
    let solution = message["solution"]
    solution.forEach((element) => {
        let x = element["camera_position"][0];
        let y = element["camera_position"][1];
        environment.board[x][y].update("SELECTED", false, element);
    })
    environment.update_canvas();
    document.getElementById("coverage").innerHTML = "Total Coverage: " + Math.floor(message["coverage"] * solution.length) + " %"
    document.getElementById("coverage_per_camera").innerHTML = "Average Coverage per Camera: " + message["coverage"] + " %"
})


document.getElementById('camera_upload')
    .addEventListener('change', environment.set_camera_file, false);
document.getElementById('sample_upload')
    .addEventListener('change', environment.set_sample_file, false);


