const input = document.getElementById("volumeSlider");
for (const event of ["input", "change"])
    input.addEventListener(event, (e) => update(e.target));

function update(input) {
    for (const data of ["min", "max", "value"])
        if (input[data]) input.style.setProperty(`--${data}`, input[data]);
}

update(input);

var player;
var playPauseButton;
var seekSlider;
var currentTimeDisplay;
var totalDurationDisplay;
var playlist = []; // Global variable to store playlist items
var currentVideoIndex; // Global variable to keep track of the current video index
var currentVideoID;
var currentActivity = [];
var currentActivityIndex = 0;



function pl(vdoid) {
    var youtubeUrl = vdoid;

    $.ajax({
        url: '/Fait/PlayMusicAsync',
        type: 'POST',
        dataType: 'json',
        data: { youtubeUrl: youtubeUrl },
        success: function (response) {
            // Success handling code
            $('#thumbnail').attr('src', response.highQualityThumbnailUrl);
            $('#title').html(response.videoTitle);
            $('#Des').html(response.videoDesc);
            $('#channel').html(response.videoChannel);
            currentVideoID = response.videoUrl;
            loadYoutubePlayer(currentVideoID);
            addCurrentActivity(currentVideoID, response.highQualityThumbnailUrl, response.videoTitle);
            currentVideoIndex = getCurrentVideoIndex(currentVideoID);
            console.log(currentVideoIndex);
            //scroll();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling code
            console.error("AJAX Error:", textStatus, errorThrown);
            // Optionally, you can display an error message to the user or take other actions.
        }
    });
}



$(document).ready(function () { // Fetch playlist data and store it in the global variable
    if (!localStorage.getItem('accessToken')) {
        Authenticate();
        alert('authenticated');
        fetchSubscriptions(localStorage.getItem('accessToken'));
    }
    else {
        alert('Already Done');
    }
    getUserInfo123(localStorage.getItem('accessToken'));
});


function getCurrentVideoIndex(vidoId) {
    for (var i = 0; i < playlist.length; i++) {
        if (playlist[i].VideoId === vidoId) {
            return i; // Return the index of the current video
        }
    }
    return -1; // Return -1 if the video is not found in the
}




function loadYoutubePlayer(videoId) {
    try {
        if (player) {
            player.loadVideoById(videoId);
        } else {
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
    } catch (error) {
        console.error('Error loading YouTube player:', error);
        // You can handle the error here, such as showing a message to the user or logging it.
    }
}


/*function scroll() {
    $('#test').html('<a id="scrollLink" href="#plitem' + currentVideoIndex + '">Scroll</a>');
    var link = document.getElementById('scrollLink');
    link.click();
}*/



function onPlayerReady(event) {
    playPauseButton = document.getElementById('playPauseButton');
    seekSlider = document.getElementById('seekSlider');
    currentTimeDisplay = document.getElementById('currentTime');
    totalDurationDisplay = document.getElementById('totalDuration');

    playPauseButton.style.visibility = 'visible';
    playPauseButton.addEventListener('click', function () {
        if (player.getPlayerState() == YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    seekSlider.addEventListener('input', function () {
        var seekToTime = seekSlider.value;
        player.seekTo(seekToTime, true);
    });

    var totalDuration = player.getDuration();
    totalDurationDisplay.textContent = formatTime(totalDuration);
    seekSlider.max = totalDuration;

    setInterval(function () {
        var currentTime = player.getCurrentTime();
        currentTimeDisplay.textContent = formatTime(currentTime);
        seekSlider.value = currentTime;
    }, 1000); // Update every second
}





function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        playPauseButton.innerHTML = '<img src="../../Content/img/pause.svg" height="20"/>';
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        playPauseButton.innerHTML = '<img src="../../Content/img/play.svg" height="20"/>';
    }

    if (event.data == YT.PlayerState.PLAYING) {
        var totalDuration = player.getDuration();
        totalDurationDisplay.textContent = formatTime(totalDuration);
        seekSlider.max = totalDuration;
    }

    if (event.data == YT.PlayerState.ENDED) {
        playNextVideo();
    }
}




function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    return minutes + ':' + seconds;
}





$(document).ready(function () {
    $('#searchForm').submit(function (event) {
        event.preventDefault(); // Prevent form submission
        var searchTerm = $('#searchTerm').val(); // Get the search term from the input field
        $('#searchResults').html('<div class="spinner"><div></div><div></div><div></div><div></div><div></div></div>');
        searchVideos(searchTerm); // Call the function to search videos
    });




    function searchVideos(searchTerm) {
        $.ajax({
            url: '@Url.Action("SearchVDO", "Fait")', // Replace 'ControllerName' with your actual controller name
            type: 'POST',
            data: { searchTerm: searchTerm }, // Pass the search term to the controller action
            dataType: 'json', // Expect JSON data in response
            success: function (data) {
                displaySearchResults(data); // Call function to display search results
            },

            error: function () {
                $('#searchResults').html('Failed to retrieve search results.'); // Display an error message if the request fails
            }
        });
    }




    function displaySearchResults(data) {
        var x = 0;
        $('#searchResults').empty(); // Clear previous search results
        $.each(data, function (index, item) {
            var videoUrl = item.videoUrl;
            var videoTitle = item.videoTitle;
            var videoChannel = item.videoChannel;
            var videoThumbnail = item.videoThumbnail;
            var videoID = item.videoID;
            var r = 'k2qgadSvNyU';
            // Construct HTML markup for each search result
            var resultHtml = '<li id="seitem' + x + '"><div class="songCard"><img src="' + videoThumbnail + '"><p>' + videoTitle + '</p><p style="margin-top: 0;height:2ch;">' + videoChannel + '</p><button data-url="' + videoUrl + '" data-index="' + x + '" style="float: left;" class="playCard"><img style="box-shadow:none;width:16px;" src="../../Content/img/play.svg"/></button><button onclick="insertIntoPlaylist(\'' + videoID + '\')" style="float: right; transform: translateY(-3px); background: transparent;" class="playCard"><i style="margin-left: 1px;margin-bottom: 3px; font-size: 22px;" class="fa-solid fa-plus"></i></button></div></li>';
            // Append the HTML markup to the search results container
            $('#searchResults').append(resultHtml);
            x++;
        });
    }
});





$('#searchResults').on('click', '.playCard', function () {
    // Remove 'clicked' class from all buttons
    $('.searchitem').removeClass('active1');
    $('.playlistitem').removeClass('active1');

    // Add 'clicked' class to the clicked button
    var parent = $(this).parent().parent();
    parent.addClass('active1');
    // Get the video URL from the clicked button's data attribute and call pl function
    var videoUrl = $(this).data('url');
    pl(videoUrl);
});



function playPreviousVideo() {
    currentVideoIndex = getCurrentVideoIndex(currentVideoID);
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        var prevVideoId = playlist[currentVideoIndex].VideoId;
        updateUI(currentVideoIndex);
        pl('https://www.youtube.com/watch?v=' + prevVideoId); // Call the function to play the previous video
    }
}




function playNextVideo() {
    currentVideoIndex = getCurrentVideoIndex(currentVideoID);
    if (currentVideoIndex < playlist.length - 1 && currentVideoIndex != -1) {
        currentVideoIndex++;
        var nextVideoId = playlist[currentVideoIndex].VideoId;
        updateUI(currentVideoIndex);
        pl('https://www.youtube.com/watch?v=' + nextVideoId); // Call the function to play the next video
    }
}




// Disable previous button when at the beginning of the playlist
function togglePrevButton() {
    $("#prevButton").prop("disabled", currentVideoIndex <= 0);
}



// Disable next button when at the end of the playlist
function toggleNextButton() {
    $("#nextButton").prop("disabled", currentVideoIndex >= playlist.length - 1);
}










$(document).ready(function () {
    $('#playlist').html('<div class="spinner"><div></div><div></div><div></div><div></div><div></div></div>');
    getPlaylists();
});


$('#playlist').on('click', '.playButton', function () {
    // Remove 'clicked' class from all buttons
    $('.searchitem').removeClass('active1');
    $('.playlistitem').removeClass('active1');

    // Add 'clicked' class to the clicked button
    var parent2 = $(this).parent().parent();
    parent2.addClass('active1');
});









function updateUI(vid) {
    $('.searchitem').removeClass('active1');
    $('.playlistitem').removeClass('active1');
    $('#plitem' + vid).addClass('active1');
}












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




function Authenticate() {
    const clientId = '751698155813-qts0dtps5okkv5d7bbvo4v9j33udra9q.apps.googleusercontent.com';
    const redirectUri = 'https://localhost:44380';
    const scope = 'https://www.googleapis.com/auth/youtube.force-ssl';
    const responseType = 'token';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    window.location.href = url;
    console.log('Authenticated');
}



// Function to get the access token from the URL
function getAccessTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    return urlParams.get('access_token');
}

// Check for access token in URL and log it
const accessToken = getAccessTokenFromUrl();
if (accessToken) {
    console.log('Access Token:', accessToken);
    // Save access token to local storage for later use
    localStorage.setItem('accessToken', accessToken);

    alert('authenticated');
}



console.log('working');
fetchSubscriptions(localStorage.getItem('accessToken'));

const ins = document.getElementById('ins');
ins.onclick = () => {
    var videoID = document.getElementById('videoID').value;
    insertIntoPlaylist(videoID);
    alert('inserted successfully');
}






function insertIntoPlaylist(videoId) {
    var playlistID = 'PLeu1Y9jnYJTLHA2osuFWihy04XrAI_8Bf';
    const savedAccessToken = localStorage.getItem('accessToken');
    if (savedAccessToken) {
        // Call the YouTube API to insert an item into a playlist
        const request = new XMLHttpRequest();
        request.open(
            'POST',
            'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
            true
        );
        request.setRequestHeader('Authorization', 'Bearer ' + savedAccessToken);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = () => {
            if (request.status === 200) {
                console.log('Item added to playlist');
                refreshPlaylist(); // Call refreshPlaylist function after item added
            } else {
                console.log('Error: ' + request.statusText);
            }
        };
        request.send(
            JSON.stringify({
                snippet: {
                    playlistId: playlistID,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId
                    }
                }
            })
        );
    }

    else {
        alert('authenticate');
    }
}





function deleteFromPlaylist(videoId) {
    const playlistItemId = videoId; // Assuming videoId is the playlist item ID
    const savedAccessToken = localStorage.getItem('accessToken');
    if (savedAccessToken) {
        // Call the YouTube API to delete an item from a playlist
        const request = new XMLHttpRequest();
        request.open(
            'DELETE',
            `https://www.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`,
            true
        );
        request.setRequestHeader('Authorization', 'Bearer ' + savedAccessToken);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = () => {
            if (request.status === 204) {
                console.log('Item deleted from playlist');
            } else {
                console.log('Error: ' + request.statusText);
            }
            // Call refreshPlaylist function after a delay of 10 seconds
            setTimeout(refreshPlaylist, 7000);
        };
        request.send();
    } else {
        alert('Authenticate');
    }
}



// Function to fetch subscriptions using the access token
function fetchSubscriptions(accessToken, nextPageToken = null) {
    let url = 'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true';
    if (nextPageToken) {
        url += '&pageToken=' + nextPageToken;
    }

    fetch(url, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
        .then(response => response.json())
        .then(data => {
            // Extract subscription titles and channel IDs
            const subscriptions = data.items.map(item => {
                return {
                    title: item.snippet.title,
                    channelId: item.snippet.channelId,
                    thumbnailUrl: item.snippet.thumbnails.default.url
                };
            });

            // Fetch channel details for each subscription
            subscriptions.forEach(subscription => {
                fetchChannelDetails(subscription, accessToken);
            });

            // If there are more pages, fetch them recursively
            if (data.nextPageToken) {
                fetchSubscriptions(accessToken, data.nextPageToken);
            }
        })
        .catch(error => {
            console.error('Error fetching subscriptions:', error);
        });
}

// Function to fetch channel details
function fetchChannelDetails(subscription, accessToken) {
    // Fetch channel details
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${subscription.channelId}`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

        .then(response => response.json())
        .then(data => {

            var subs = '<li><div class="card1"><div class="subArt-container d-flex align-items-center"><img src="' + subscription.thumbnailUrl + '" class="subArt"></div></div></li>';
            $('#subscriptions').append(subs);


        })
        .catch(error => {
            console.error('Error fetching channel details:', error);
        });
}


function getUserInfo123(accessToken) {
    fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const channel = data.items[0]; // Assuming the user only has one channel
            const channelTitle = channel.snippet.title;
            const channelThumbnailUrl = channel.snippet.thumbnails.default.url;

            var paragraph = document.getElementById('name');
            paragraph.textContent = channelTitle;

            var img12 = document.getElementById('dp');
            img12.src = channelThumbnailUrl;
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });
}


function addCurrentActivity(playingVideoID, playingVideoThumbnailUrl, playingVideoName) {
    if (!currentActivity.includes(playingVideoID)) {
        currentActivity[currentActivityIndex] = playingVideoID;
        currentActivityIndex++;
        var truncatedVideoName;
        if (playingVideoName.length > 50) {
            truncatedVideoName = playingVideoName.substring(0, 50) + '...';
        }
        else {
            truncatedVideoName = playingVideoName;
        }
        var activityHTML = '<tr><td class="col1"><button onclick="pl(\'https://www.youtube.com/watch?v=' + playingVideoID + '\')" style="width:44px;padding:0;background-color:transparent;border:none;outline:none;"><img src="' + playingVideoThumbnailUrl + '" height="40" width="40"></button></td><td class="truncate-text col2">' + truncatedVideoName + '</td></tr>';
        $('#recentActivity').prepend(activityHTML);
    }
}




function getPlaylists() {
    accessToken369 = localStorage.getItem('accessToken');
    // Make a request to the YouTube Data API to retrieve playlists
    fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true', {
        headers: {
            Authorization: 'Bearer ' + accessToken369,
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Process the response
            var pllist = '';
            var playlistsxyz = data.items;
            var y = 0;
            if (playlistsxyz) {
                for (var i = 0; i < playlistsxyz.length; i++) {
                    var playlist = playlistsxyz[i];
                    console.log(playlist.snippet.title);
                    var pid = playlist.id;
                    var checkedAttribute = (y === 0) ? 'checked' : ''; // Add checked attribute for the first tab
                    pllist += '<div class="tabby-tab"><input type="radio" id="tab-' + y + '" name="tabby-tabs" ' + checkedAttribute + '><label for="tab-' + y + '">' + playlist.snippet.title + '</label><div class="tabby-content"><div class="listContainer" style="overflow-y: scroll; height: 100%;"><ul class="songList" id="playlist' + y + '"><div class="spinner"><div></div><div></div><div></div><div></div><div></div></div></ul></div></div></div>';

                    y++;
                    console.log(pid);
                    // Fetch and display playlist contents
                    fetchAndDisplayPlaylist(pid, y - 1); // Pass playlist ID and index
                }
            } else {
                console.log('No playlists found.');
            }
            $(pllist).insertBefore('#playlistTabs .tabby-tab:first');
        })
        .catch(error => console.error('Error:', error));
}

function fetchAndDisplayPlaylist(playlistId, index) {
    var i = 0;
    var playlistHtml = '';
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/Fait/playlist',
            type: 'GET',
            dataType: 'json',
            data: { playlistID: playlistId },
            success: function (data) {

                playlist = playlist.concat(data);
                togglePrevButton();
                toggleNextButton();
                $.each(data, function (index, video) {
                    var VideoID = video.VideoId;

                    playlistHtml += '<li id="plitem' + i + '"><div class="songCard"><img src="' + video.ThumbnailUrl + '"><p>' + video.VideoTitle + '</p><p style="margin-top: 0;height:2ch;">' + video.ChannelName + '</p><button onclick="pl(\'https://www.youtube.com/watch?v=' + VideoID + '\')" style="float: left;" class="playCard"><img style="box-shadow:none;width:16px;" src="../../Content/img/play.svg"/></button><button onclick="deleteFromPlaylist(\'' + video.playlistItemId + '\')" style="float: right; transform: translateY(-3px); background: transparent;" class="playCard"><i style="margin-left: 1px;margin-bottom: 3px; font-size: 22px;" class="fa-solid fa-minus"></i></button></div></li>';
                    i++;
                });
                $("#playlist" + index).html(playlistHtml);
                resolve();
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        }).always(function () {
            $('#playlist' + index + ' .spinner').remove();
        });
    });
}
