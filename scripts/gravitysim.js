let currentslide = 0;

function changeslide(n) {
    let images = document.getElementsByClassName("slideshow-image");
    let buttons = document.getElementsByClassName("slideshow-button");
    images[currentslide].style.display = "none";
    buttons[currentslide].style.backgroundColor = "white";
    
    currentslide = n;
    images[currentslide].style.display = "inline";
    buttons[currentslide].style.backgroundColor = "grey";
}

window.onload = function() {
    changeslide(0)
};