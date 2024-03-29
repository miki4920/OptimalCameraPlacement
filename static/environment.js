class Camera {
    constructor(camera) {
        this.range = camera["camera"]["range"];
        this.fov = camera["camera"]["fov"]
        this.orientation = camera["orientation"]
        this.nodes = camera["nodes"]
    }
}


class Cell {
    constructor(x, y, type = "EMPTY") {
        this.x = x
        this.y = y
        this.type = type
        this.camera = null;
    }

    update(type, camera = null, overlay = null) {
        this.type = type
        this.overlay = false;
        if (camera && overlay === null) {
            this.camera = new Camera(camera);
        } else if (overlay !== null) {
            if (overlay === "0") {
                this.overlay = false;
            } else {
                this.overlay = true;
            }

        } else {
            this.camera = null;
        }
    }
}


class Environment {
    constructor(size) {
        this.board = [];
        this.size = size
    }

    create_board(size) {
        this.size = size;
        let map = [];
        for (let x = 0; x < size; x++) {
            map[x] = [];
            for (let y = 0; y < size; y++) {
                map[x].push(new Cell(x, y))
            }
        }
        this.board = map;
    }

    parse_board() {
        let board = []
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                board.push(this.board[x][y].type)
            }
        }
        return board;
    }

    sample_point(x, y, sampling_rate, size) {
        if (this.board[x][y].type !== "EMPTY") {
            return false;
        }
        for (let i = -sampling_rate; i <= sampling_rate; i++) {
            for (let j = -sampling_rate; j <= sampling_rate; j++) {
                if ((x + i >= 0) && (x + i < size) && (y + j >= 0) && (y + j < size)) {
                    if (this.board[x + i][y + j].type === "WALL" || this.board[x + i][y + j].type === "SAMPLE") {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    sample() {
        let sampling = document.getElementById("sampling_rate");
        let sampling_rate = parseInt(sampling.value);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.board[x][y].type === "SAMPLE" || this.board[x][y].type === "UNSEEN") {
                    this.board[x][y].update("EMPTY");
                }


            }
        }
        if (sampling_rate > 0) {
            for (let x = 0; x < this.size; x++) {
                for (let y = 0; y < this.size; y++) {
                    if (this.sample_point(x, y, sampling_rate, this.size)) {
                        this.board[x][y].update("SAMPLE")
                    }


                }
            }
        }

    }

    clean_selection() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.board[x][y].type === "SELECTED") {
                    this.board[x][y].update("CAMERA");
                }
                if (this.board[x][y].type === "UNSEEN") {
                        this.board[x][y].update("SAMPLE")
                }
            }
        }
    }

    get_text_file() {
        let text = "";
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let type = this.board[x][y].type
                type = type === "SELECTED" ? "CAMERA" : type;
                text += this.board[x][y].x + " " + this.board[x][y].y + " " + type + "\n";

            }
        }
        text = this.size + "\n" + text;
        return text
    }
}





