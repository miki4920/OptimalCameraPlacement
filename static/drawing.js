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
    }

    sample() {
        this.environment.sample()
        this.update_canvas()
    }

    refresh_canvas() {
        this.environment.board.forEach((row) => {
            row.forEach((element) => {
                this.draw_point_on_canvas(element.x, element.y, element.type)
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

    draw_point_on_canvas(x, y, type) {
        let context = this.canvas.getContext("2d");
        context.fillStyle = Colours[type];
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
        if(initial_type === replacement_type) {
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
            if(this.history.length === 0 || board.join("") !== this.history[this.history.length-1].join("")) {
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
        if(this.history.length === 0) {
            return;
        }
        let board = this.history.pop();
        let environment = this.environment.parse_board().join("");
        if(board.join("") == environment) {
            board = this.history.pop();
        }
        for (let x = 0; x < this.environment.size; x++) {
            for (let y = 0; y < this.environment.size; y++) {
                this.environment.board[x][y].update(board[x*this.environment.size+y])
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


}

let drawing_tool = new DrawingTool();

drawing_tool.canvas.addEventListener("mousedown", (e) => {
    drawing_tool.start_drawing(e)
})
drawing_tool.canvas.addEventListener("mouseup", () =>{
    drawing_tool.stop_drawing()
})
drawing_tool.canvas.addEventListener("mousemove",(e) => {
    drawing_tool.draw(e)
})
window.onload = window.onresize = () => {
    drawing_tool.update_canvas();
    drawing_tool.camera_handler.update_cameras()
}

