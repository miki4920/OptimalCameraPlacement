let default_size = 10;
let drawing = false;


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
                this.draw(context, element.x * this.pixel_resolution[0], element.y * this.pixel_resolution[1], element.colour)
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
        return Math.floor(value/this.pixel_resolution[index])
    }

    draw(x, y) {
        let context = this.get_context();
        context.fillStyle = Colours[this.selected_type];
        context.fillRect(this.normalise(x, 0)*this.pixel_resolution[0],
            this.normalise(y, 1)*this.pixel_resolution[1], Math.floor(this.pixel_resolution[0]), Math.floor(this.pixel_resolution[1]));
    }

}

function update_position(x, y) {
    document.getElementById("position").innerText = "X: " + Math.floor(x / environment.pixel_resolution[0]) + ", Y: " + Math.floor(y / environment.pixel_resolution[1])
}

function set_event_listeners(environment) {
    environment.canvas.addEventListener("mousedown", function () {
        drawing = true
    })
    environment.canvas.addEventListener("mouseup", function () {
        drawing = false
    })
    environment.canvas.addEventListener("mousemove", function (e) {
        let x = e["layerX"]
        let y = e["layerY"]
        update_position(x, y, environment)
        if(drawing) {
            environment.draw(x, y)
        }
    })
}



// window.onload = window.onresize = function () {
//     resize_window()
// }


environment = new Environment()
set_event_listeners(environment)
