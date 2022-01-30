let default_size = 11;

class DrawingTool {
    constructor() {
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
        this.drawing = false;
        this.drawing_types = {"POINT": this.draw_point, "LINE": this.draw_line, "FILL": this.draw_fill}
        this.drawing_type = "POINT"
        this.previous_line_point = {}
        this.colour_type = "EMPTY";
        this.environment = new Environment();
        this.environment.create_board(default_size)
    }

    sample() {
        this.environment.sample()
        this.update_canvas()
    }

    refresh_canvas() {
        let self = this
        this.environment.board.forEach((row) => {
            row.forEach((element) => {
                this.draw_point_on_canvas(element.x, element.y, element.type, self)
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

    draw_point(x, y, type, self) {
        self.environment.board[x][y].update(type)
    }

    line(x0, y0, x1, y1, type) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let self = this;
        while (true) {
            this.draw_point(x0, y0, type, self);
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

    draw_line(x, y, type, self) {
        if (Object.keys(self.previous_line_point).length !== 0 && self.previous_line_point["type"] === type) {
            self.line(self.previous_line_point["x"], self.previous_line_point["y"], x, y, type)
        }
        self.previous_line_point = {"drawing_type": "LINE_START", "type": type, "x": x, "y": y}
        self.draw_point(x, y, type, self)
    }

    fill(x, y, initial_type, replacement_type, self) {
        let size = self.environment.size
        if ((x < 0) || (x > size-1) || (y < 0) || (y > size-1)) return;
        if (self.environment.board[x][y].type !== initial_type) return;
        self.environment.board[x][y].update(replacement_type);
        self.fill(x - 1, y - 1, initial_type, replacement_type, self);
        self.fill(x - 1, y, initial_type, replacement_type, self);
        self.fill(x - 1, y + 1, initial_type, replacement_type, self);
        self.fill(x, y - 1, initial_type, replacement_type, self);
        self.fill(x, y + 1, initial_type, replacement_type, self);
        self.fill(x + 1, y - 1, initial_type, replacement_type, self);
        self.fill(x + 1, y, initial_type, replacement_type, self);
        self.fill(x + 1, y + 1, initial_type, replacement_type, self);
    }

    draw_fill(x, y, replacement_type, self) {
        let initial_type = self.environment.board[x][y].type
        self.fill(x, y, initial_type, replacement_type, self)
    }

    draw(e) {
        let x = this.normalise(e["layerX"], 0);
        let y = this.normalise(e["layerY"], 1);
        update_information(this.environment.board[x][y]);
        if (this.drawing) {
            let self = this
            this.drawing_types[this.drawing_type](x, y, this.colour_type, self)
            this.update_canvas()
        }
    }

    clean_board_of_cameras() {
        this.environment.clean_selection();
        document.getElementById("coverage").innerHTML = "Total Coverage: " + 0 + " %"
        document.getElementById("coverage_per_camera").innerHTML = "Average Coverage per Camera: " + 0 + " %"
        this.update_canvas();
    }


}

let drawing_tool = new DrawingTool();

drawing_tool.canvas.addEventListener("mousedown", function (e) {
    drawing_tool.start_drawing(e)
})
drawing_tool.canvas.addEventListener("mouseup", function () {
    drawing_tool.stop_drawing()
})
drawing_tool.canvas.addEventListener("mousemove", function (e) {
    drawing_tool.draw(e)
})
window.onload = window.onresize = function () {
    drawing_tool.update_canvas();
}