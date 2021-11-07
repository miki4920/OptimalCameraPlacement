let default_size = 10;

let drawing_colour = "WALL";
let drawing = false;

let x;
let y;
let context;


class Cell {
    constructor(x, y, type) {
        this.x = x
        this.y = y
        this.type = type
        this.colour = Colours[type]
    }

    update(type) {
        this.type = type
        this.colour = Colours[type]
    }
}


class Environment {
    constructor(size, default_type) {
        this.board = this.create_board(size, size, default_type);
        this.selected_type = default_type;
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
        this.update_canvas();
    }

    create_board(rows, columns, type) {
        let map = [];
        for (let x = 0; x < rows; x++) {
            map[x] = [];
            for (let y = 0; y < columns; y++) {
                map.push(new Cell(x, y, type,))
            }
        }
        return map;
    }

    get_context() {
        return this.canvas.getContext("2d");
    }

    fill_canvas() {
        let context = this.get_context();
        this.board.forEach(function (row) {
            row.forEach(function (element) {
                draw_pixel(context, element.x * this.pixel_resolution[0], element.y * this.pixel_resolution[1], element.colour)
            })
        })
    }

    update_canvas() {
        width = document.getElementById('width').value;
        width = width && !isNaN(width) ? parseInt(width) : default_size;
        height = document.getElementById('height').value;
        height = height && !isNaN(height) ? parseInt(height) : default_size;
        this.pixel_resolution = [this.canvas.clientWidth / width,
            this.canvas.clientHeight / height];
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.fill_canvas();
    }

    change_selected_type(type) {
        this.selected_type = type
    }

    normalise(x, y) {
        x = Math.floor(x/this.pixel_resolution[0]) * this.pixel_resolution
        y = Math.floor(y/this.pixel_resolution[0]) * this.pixel_resolution
        return [x, y]
    }

    draw(x, y) {
        let context = this.get_context();
        context.fillStyle = Colours[this.selected_type];
        context.fillRect(x, y, Math.floor(pixel_resolution[0]), Math.floor(pixel_resolution[1]));
    }

}

function update_position(x, y) {
    document.getElementById("position").innerText = "X: " + Math.floor(x / pixel_resolution[0]) + ", Y: " + Math.floor(y / pixel_resolution[1])
}


function draw_pixel(context, x, y, type) {
    context.fillStyle = Colours[type];

    x = Math.floor(x / pixel_resolution[0]);
    y = Math.floor(y / pixel_resolution[1])
    return [x.toString() + "," + y.toString(), {"x": x, "y": y, "type": type}]
}

function draw() {
    canvas.addEventListener("mousedown", function () {
        drawing = true
    })
    canvas.addEventListener("mouseup", function () {
        drawing = false
    })
    canvas.addEventListener("mousemove", function (e) {
        x = e["layerX"]
        y = e["layerY"]
        update_position(x, y)
        if (drawing) {
            let element = draw_pixel(context, x, y, drawing_colour)
            resize_window()
            if (drawing_colour === "WALL") {
                delete dictionary[element[0]]
            } else {
                dictionary[element[0]] = element[1]
            }
        }

    }, {passive: true, capture: true})
}

window.onload = window.onresize = function () {
    resize_window()
}

socket = io();

environment = new Environment()
set_event_listeners()
