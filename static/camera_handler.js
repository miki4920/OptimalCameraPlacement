class CameraHandler {
    get_cookie() {
        if(document.cookie.length === 0) {
            this.set_cookie({})
        }
        return JSON.parse(document.cookie)
    }

    set_cookie(dictionary) {
        document.cookie = JSON.stringify(dictionary)
    }

    add_camera() {
        let name = document.getElementById("name").value
        let range = document.getElementById("input_range").value
        let fov = document.getElementById("input_fov").value
        if(name.length === 0 || range.length === 0 || fov.length === 0) {
            return
        }
        let dictionary = this.get_cookie();
        dictionary[name] = {"range": range, "fov": fov}
        this.set_cookie(dictionary);
        this.update_cameras();
    }

    remove_camera(name) {
        let cameras = this.get_cookie();
        delete cameras[name];
        this.set_cookie(cameras);
    }

    update_cameras() {
        if (document.cookie.length > 0) {
            let cameras = this.get_cookie()
            let list = document.getElementById("cameras")
            list.innerHTML = "";
            for (let name of Object.keys(cameras)) {
                let camera = cameras[name];
                let camera_element = document.createElement("li");
                let paragraph = document.createElement("p")
                paragraph.innerText = `Name: ${name}\nRange: ${camera["range"]}\nField of View: ${camera["fov"]}`
                let button = document.createElement("button")
                button.innerText = "X";
                button.classList.add("delete_camera")
                button.onclick = () => {
                    this.remove_camera(name)
                    this.update_cameras()
                };
                camera_element.appendChild(paragraph)
                camera_element.appendChild(button)
                list.appendChild(camera_element)
            }
        }
        else {
            document.cookie = JSON.stringify({});
        }
    }
}