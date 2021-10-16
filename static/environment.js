let parent;
let canvas;

window.onload = window.onresize = function() {
    canvas = document.getElementById('camera_canvas');
    parent = document.getElementById('camera_container')
    canvas.width = parent.innerWidth;
    canvas.height = parent.innerHeight;
}