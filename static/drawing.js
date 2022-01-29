class DrawingTool {
    constructor() {
        this.canvas = document.getElementById("camera_canvas");
        this.pixel_resolution = [];
        this.drawing = false;
    }

    start_drawing() {
        this.drawing = true;
    }

    stop_drawing() {
        this.drawing = false;
    }

    draw(e) {
        let x = environment.normalise(e["layerX"], 0);
        let y = environment.normalise(e["layerY"], 1);
        update_information(environment.board[x][y]);
        if (this.drawing) {
            environment.board[x][y].update(environment.selected_type)
            environment.update_canvas()
        }
    }


}

let drawing_tool = new DrawingTool();

environment.canvas.addEventListener("mousedown", drawing_tool.start_drawing)
    environment.canvas.addEventListener("mouseup", drawing_tool.stop_drawing)
    environment.canvas.addEventListener("mousemove", drawing_tool.draw)
window.onload = window.onresize = function () {
        environment.update_canvas();
}