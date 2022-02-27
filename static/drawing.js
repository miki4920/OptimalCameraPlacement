let default_size = 11;

class DrawingTool {
    constructor() {
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
        this.drawing = false;
        this.drawing_type = "POINT"
        this.previous_line_point = {}
        this.colour_type = "EMPTY";
        this.environment = new Environment();
        this.environment.create_board(default_size)
        this.camera_handler = new CameraHandler();
        this.history = [];
        this.overlay = false;
    }

    sample() {
        this.environment.sample()
        this.update_canvas()
    }

    refresh_canvas() {
        this.environment.board.forEach((row) => {
            row.forEach((element) => {
                this.draw_point_on_canvas(element.x, element.y, element.type, element.overlay)
            })
        })
    }

    update_canvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.pixel_resolution = [this.canvas.clientWidth / this.environment.size,
            this.canvas.clientHeight / this.environment.size];
        this.refresh_canvas();
    }

    create_board() {
        let size = document.getElementById("size").value
        size = size && !isNaN(size) ? parseInt(size) : default_size;
        this.history = []
        this.environment.create_board(size)
        this.update_canvas()
    }

    start_drawing(e) {
        if (e.button === 0) {
            this.drawing = true;
            this.draw(e)
        } else if (e.button === 2) {
            this.previous_line_point = {}
        }

    }

    stop_drawing() {
        this.drawing = false;
    }

    change_selected_colour(id) {
        let elements = Array.from(document.getElementsByClassName("active_option"))
        elements.forEach((element) => {
            element.classList.remove("active_option")
        })
        document.getElementById(id).classList.add("active_option");
        this.colour_type = id
    }

    change_selected_drawing(id) {
        let elements = Array.from(document.getElementsByClassName("active_drawing"))
        elements.forEach((element) => {
            element.classList.remove("active_drawing")
        })
        document.getElementById(id).classList.add("active_drawing");
        this.drawing_type = id
        if (this.drawing_type !== "LINE") {
            this.previous_line_point = {}
        }
    }

    normalise(value, index) {
        let result = Math.floor(value / this.pixel_resolution[index]);
        return result > 0 ? result : 0;
    }

    draw_point_on_canvas(x, y, type, overlay) {
        let context = this.canvas.getContext("2d");
        context.fillStyle = Colours[type];
        context.fillRect(x * this.pixel_resolution[0], y * this.pixel_resolution[1],
            this.pixel_resolution[0] - 1, this.pixel_resolution[1] - 1);
        if (overlay) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)"
        }
        context.fillRect(x * this.pixel_resolution[0], y * this.pixel_resolution[1],
            this.pixel_resolution[0] - 1, this.pixel_resolution[1] - 1);
    }

    draw_point(x, y, type) {
        this.environment.board[x][y].update(type)
    }

    line(x0, y0, x1, y1, type) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        while (true) {
            this.draw_point(x0, y0, type);
            if ((x0 === x1) && (y0 === y1)) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    draw_line(x, y, type) {
        if (Object.keys(this.previous_line_point).length !== 0 && this.previous_line_point["type"] === type) {
            this.line(this.previous_line_point["x"], this.previous_line_point["y"], x, y, type)
        }
        this.previous_line_point = {"drawing_type": "LINE_START", "type": type, "x": x, "y": y}
        this.draw_point(x, y, type)
    }

    fill(x, y, initial_type, replacement_type) {
        let size = this.environment.size
        if ((x < 0) || (x > size - 1) || (y < 0) || (y > size - 1)) return;
        if (this.environment.board[x][y].type !== initial_type) return;
        this.environment.board[x][y].update(replacement_type);
        this.fill(x - 1, y - 1, initial_type, replacement_type);
        this.fill(x - 1, y, initial_type, replacement_type);
        this.fill(x - 1, y + 1, initial_type, replacement_type);
        this.fill(x, y - 1, initial_type, replacement_type);
        this.fill(x, y + 1, initial_type, replacement_type);
        this.fill(x + 1, y - 1, initial_type, replacement_type);
        this.fill(x + 1, y, initial_type, replacement_type);
        this.fill(x + 1, y + 1, initial_type, replacement_type);
    }

    draw_fill(x, y, replacement_type) {
        let initial_type = this.environment.board[x][y].type
        if (initial_type === replacement_type) {
            return;
        }
        this.fill(x, y, initial_type, replacement_type)
    }

    draw(e) {
        let x = this.normalise(e["layerX"], 0);
        let y = this.normalise(e["layerY"], 1);
        update_information(this.environment.board[x][y]);
        if (this.drawing) {
            let board = this.environment.parse_board()
            if (this.history.length === 0 || board.join("") !== this.history[this.history.length - 1].join("")) {
                this.history.push(board)
            }

            switch (this.drawing_type) {
                case "POINT":
                    this.draw_point(x, y, this.colour_type);
                    break;
                case "LINE":
                    this.draw_line(x, y, this.colour_type);
                    break;
                case "FILL":
                    this.draw_fill(x, y, this.colour_type)
            }
            this.update_canvas()
        }
    }

    undo() {
        if (this.history.length === 0) {
            return;
        }
        let board = this.history.pop();
        let environment = this.environment.parse_board().join("");
        if (board.join("") === environment) {
            board = this.history.pop();
        }
        for (let x = 0; x < this.environment.size; x++) {
            for (let y = 0; y < this.environment.size; y++) {
                this.environment.board[x][y].update(board[x * this.environment.size + y])
            }
        }
        this.update_canvas()
    }

    clean_board_of_cameras() {
        this.environment.clean_selection();
        document.getElementById("coverage").innerHTML = "Total Coverage: " + 0 + " %"
        document.getElementById("coverage_per_camera").innerHTML = "Average Coverage per Camera: " + 0 + " %"
        this.update_canvas();
    }

    check_range(x1, y1, x2, y2, range) {
        return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) <= Math.pow(range, 2)
    }

    calculate_angle(x1, y1, x2, y2) {
        let angle = Math.atan2(y2 - y1, x2 - x1)
        angle = (angle * 180) / Math.PI
        if (angle < 0) {
            angle = 360 + angle
        }
        return angle
    }

    modulus(a, b) {
        return ((a % b) + b) % b
    }

    check_angle(x1, y1, x2, y2, orientation, fov) {
        let angle = this.calculate_angle(x1, y1, x2, y2)
        let angle_one = this.modulus(orientation - fov, 360)
        let angle_two = this.modulus(orientation + fov, 360)
        let angle_between_difference = this.modulus(angle_two - angle_one, 360)
        let angle_difference = this.modulus(angle - angle_one, 360)
        if (angle_difference <= angle_between_difference && angle_between_difference < 180) {
            return true;
        } else if (180 < angle_between_difference && angle_between_difference <= angle_difference) {
            return true;
        }
        return false;
    }

    check_wall(x1, y1, x2, y2) {
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = (x1 < x2) ? 1 : -1;
        let sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if(this.environment.board[x1][y1].type === "WALL") {
                return false;
            }
            if ((x1 === x2) && (y1 === y2)) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
        return true;
    }

    visible(node, x, y) {
        let camera = node.camera;
        if (node.x === x && node.y === y) {
            return true;
        }
        if (!this.check_range(node.x, node.y, x, y, camera.range)) {
            return false;
        }

        if (camera.fov < 360 && !this.check_angle(node.x, node.y, x, y, camera.orientation, camera.fov / 2)) {
            return false;
        }
        if (!this.check_wall(node.x, node.y, x, y)) {
            return false;
        }
        return true;
    }

    clear_overlay() {
        for (let x = 0; x < this.environment.size; x++) {
            for (let y = 0; y < this.environment.size; y++) {
                this.environment.board[x][y].update(this.environment.board[x][y].type, this.environment.board[x][y].camera, "0")
            }
        }
        this.overlay = false;
        this.update_canvas();
    }

    draw_camera_overlay(node) {
        for (let x = 0; x < this.environment.size; x++) {
            for (let y = 0; y < this.environment.size; y++) {
                if (this.visible(node, x, y)) {
                    this.environment.board[x][y].update(this.environment.board[x][y].type, this.environment.board[x][y].camera, "1")
                }
            }
        }
        this.update_canvas();
    }
}

function update_information(node) {
    document.getElementById("coordinates").innerText = "X: " + node.x + ", Y: " + node.y
    document.getElementById("type").innerText = "Type: " + node.type
    let range = document.getElementById("range")
    let fov = document.getElementById("fov")
    let orientation = document.getElementById("orientation")
    let nodes = document.getElementById("nodes")
    if (drawing_tool.overlay) {
        drawing_tool.clear_overlay();
    }
    if (node.camera) {
        drawing_tool.draw_camera_overlay(node)
        drawing_tool.overlay = true;
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

let drawing_tool = new DrawingTool();

drawing_tool.canvas.addEventListener("mousedown", (e) => {
    drawing_tool.start_drawing(e)
})
drawing_tool.canvas.addEventListener("mouseup", () => {
    drawing_tool.stop_drawing()
})
drawing_tool.canvas.addEventListener("mousemove", (e) => {
    drawing_tool.draw(e)
})
window.onload = window.onresize = () => {
    drawing_tool.update_canvas();
    drawing_tool.camera_handler.update_cameras()
}

