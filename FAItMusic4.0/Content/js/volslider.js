const input = document.getElementById("volumeSlider");
for (const event of ["input", "change"])
    input.addEventListener(event, (e) => update(e.target));

function update(input) {
    for (const data of ["min", "max", "value"])
        if (input[data]) input.style.setProperty(`--${data}`, input[data]);
}

update(input);
var volumeSlider;

function onYouTubeIframeAPIReady() {
    volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function () {
        var volume = volumeSlider.value;
        setVolume(volume);
    });
}

function setVolume(volume) {
    if (player) {
        player.setVolume(volume);
    }
}