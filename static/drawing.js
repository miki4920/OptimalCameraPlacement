class DrawingTool {
    constructor() {
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
    }
}

function set_event_listeners() {
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
            environment.board[x][y].update(environment.selected_type)
            environment.update_canvas()
        }
    })
    window.onload = window.onresize = function () {
        environment.update_canvas();
    }
}

set_event_listeners()