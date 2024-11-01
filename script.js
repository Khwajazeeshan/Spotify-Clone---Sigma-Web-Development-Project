//Global variable..................
let currentsong = new Audio();
let songs;
let currFolder;

//  Music Time-update Function.............
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`
}

// Fetch all songs from songs Folder Fuction...............
async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        else if
            (element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Add all songs into Library > song-list Box.............
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML +
            `<li>
                    <div class="list flex gap">
                        <div>
                            <img class=" invert" src="svgs/music.svg" alt="">
                        </div>
                        <div class="boxWidth">
                            <div>${song.replaceAll("%20", " ")}</div>
                        </div>
                    </div>
                    <div class=" song-list-img flex gap cursor">
                            <img class="songSvg cursor invert" src="svgs/play2.svg" alt="">
                    </div>
                </li>`;
    }

    // Add an event listener to each song...........
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".boxWidth").firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

//  Music play Function ...........................
const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}

// Album Display Function......................................
async function DisplayAlbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let artistContainer = document.querySelector(".artist-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder);
            // Get meta data of the folder..............
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            artistContainer.innerHTML = artistContainer.innerHTML + `
            <div class="artist ">
                        <div  class="image-container">
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <div data-folder="${folder}" class="play-button cursor">
                                <!-- SVG for play button -->
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" fill="#1ED760" />
                                    <polygon points="10,8 16,12 10,16" fill="#fff" />
                                </svg>
                            </div>
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Add event listener to play-button when it's clicked load the music in library.....................
    Array.from(document.getElementsByClassName("play-button")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}




//  Main Function .............................................................................
async function main() {

    // Get the list of all songs........
    await getsongs("songs/")
    playmusic(songs[0], true) // call the playmusic Function................

    // Fuction that display all albums on the page...........................
    await DisplayAlbum()

    // Add an event listener for play song ....................
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "svgs/pause.svg"
        } else {
            currentsong.pause()
            play.src = "svgs/play.svg"
        }
    })

    // Add an event listener for previous song..............
    previous.addEventListener("click", e => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // Add an event listener for next song..............
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    // Add an event listener for Time-Update...............
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =            // Add song time in song-time div...........
            `${secondsToMinutesSeconds(currentsong.currentTime)} / ${(secondsToMinutesSeconds(currentsong.duration))}`
        document.querySelector(".circle").style.left =             // move circle in seekBar..........
            (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // Add an event listener for Volume icon..............
    Volume.addEventListener("click", () => {
        if (currentsong.muted) {
            currentsong.muted = false;
            Volume.src = "svgs/volume.svg";  // Update icon when unmuted
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        } else {
            currentsong.muted = true;
            Volume.src = "svgs/mute.svg";  // Update icon when muted
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
    });

    // Add an event listener for Volume seekBar..............
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            Volume.src = "svgs/volume.svg";
            currentsong.muted = false;
        }
    })

    // Add an event listener for song seek-bar..............
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    // Add an event listener for Hamburger icon..............
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left-box").style.left = "0"
    })

    // Add an event listener for close icon..............
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left-box").style.left = "-120%"
    })

}

main() // call the main function.............