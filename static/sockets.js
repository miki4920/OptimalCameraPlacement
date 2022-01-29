let socket = io("http://127.0.0.1:5000/");

function send_environment() {
    drawing_tool.environment.clean_selection();
    let algorithm = document.getElementById("algorithm").value;
    socket.emit("environment", {
        "board": drawing_tool.environment.board,
        "cameras": drawing_tool.environment.cameras,
        "algorithm": algorithm
    });
}

socket.on("update_board", (message) => {
    message = JSON.parse(message)
    let solution = message["solution"]
    solution.forEach((element) => {
        let x = element["x"];
        let y = element["y"];
        drawing_tool.environment.board[x][y].update("SELECTED", element);
    })
    drawing_tool.update_canvas();
    document.getElementById("coverage").innerHTML = "Total Coverage: " + Math.floor(message["coverage"] * solution.length) + " %"
    document.getElementById("coverage_per_camera").innerHTML = "Average Coverage per Camera: " + message["coverage"] + " %"
})