let collapsible = document.getElementsByClassName("collapsible");

for (let i = 0; i < collapsible.length; i++) {
    collapsible[i].onclick = function() {
        this.classList.toggle("active_collapsible");
        let content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
  }
}