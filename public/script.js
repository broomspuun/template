const apiKey = 'cc4ca8f8502472b5f106fb5acf46b614'
const hotList = document.querySelector(".music") // hot right now list
const popularTracksList = document.querySelector(".tracks__inner"); // popular tracks list

start_hot();

async function start_hot() {
    const fetchedData = await fetchAll();
    fillHotArtists(fetchedData.dataHotArtists, fetchedData.artistTagsDatas); // params: dataHotArtists = artists[] -> artist[] -> artist info ||| artistTagsDatas = tag[] + artist -> tag info
    fillHotTracks(fetchedData.dataHotTracks, fetchedData.trackTagsDatas);
}


async function fetchData(method, artist, track, limit = 5) {
    const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${apiKey}&artist=${artist}&track=${track}&limit=${limit}&format=json`)
        .catch(() => alert("Error"));
    const data = await response.json();
    return data;
}

async function fetchAll() {
    const resultData = {
        dataHotArtists: undefined, // array artists[] -> artist[] -> artist info 
        dataHotTracks: undefined, // array tracks[] -> track[] -> track info
        artistTagsDatas: undefined, // array toptags[] -> tag[] + artist -> tag info
        trackTagsDatas: undefined // array toptags[] -> tag[] + artist + track-> tag info
    }
    await Promise.all([fetchData("chart.gettopartists"), fetchData("chart.gettoptracks")])   // start two queries -> resonse = data array where data[0] - hotArtists ||| data[1] - hotTracks
    .then( 
        (data) => {
            console.log(data[1]);
            resultData.dataHotArtists = data[0]; //  array artists[] -> artist[] -> artist info 
            resultData.dataHotTracks = data[1]; // array tracks[] -> track[] -> track info
        }
    )
    const promisesArtistsTags = resultData.dataHotArtists.artists.artist.map((artist) => fetchData("artist.gettoptags", artist.name)); // iterates over the elements of an array. for each artist start querie -> response = array of top artist tags(genres)
    const promisesTracksTags = resultData.dataHotTracks.tracks.track.map((track) => fetchData("track.gettoptags", track.artist.name, track.name)); // iterates over the elements of an array. for each track start querie -> response = array of top track tags(genres)
    await Promise.all([...promisesArtistsTags, ...promisesTracksTags]).then(
        (data) => { // response = data array of length limit*2. [0..limit-1] elements are artist tags. [limit, limit*2-1] elements are track tags.
            resultData.artistTagsDatas = data.slice(0, (data.length) / 2); // [0..limit-1] elements are artist tags
            resultData.trackTagsDatas = data.slice((data.length) / 2, data.length); // [limit, limit*2-1] elements are track tags
            console.log(resultData.trackTagsDatas)
        }
    )
    return resultData;
}

function fillHotArtists(dataHotArtists, artistTagsDatas) { // params: dataHotArtists = artists[] -> artist[] -> artist info ||| artistTagsDatas = tag[] + artist -> tag info
    for (let i = 0; i < dataHotArtists.artists.artist.length; i++) {
        createCardArtist(dataHotArtists.artists.artist[i], artistTagsDatas[i])
    }
}
function fillHotTracks(dataHotTracks, trackTagsDatas) { // params: dataHotTracks = tracks[] -> track[] -> track info ||| trackTagsDatas = tag[] + artist + track-> tag info
    for (let i = 0; i < dataHotTracks.tracks.track.length; i++) {
        createCardTrack(dataHotTracks.tracks.track[i], trackTagsDatas[i])
    }
}
export function createCardArtist(artist, artistTagsDatas) { // params: artist - object ||| artistTagsDatas = tag[] + artist -> tag info
    AddCardHotlist(
        artist.name, // artist name
        artist.url, // artist page url
        artist.image[2]["#text"], // [174x174]px img
        artistTagsDatas.toptags.tag.slice(0, 3) // take the 3 most popular tags(genres)
    )
}
export function createCardTrack(track, trackTagsDatas) { // params: track - object ||| trackTagsDatas = tag[] + artist -> tag info
    AddCardTracksList(
        track.name, // track name
        track.url, // track page url
        track.artist.name, // artist name
        track.artist.url, // artist page url
        track.image[1]["#text"], // [64x64]px img
        trackTagsDatas.toptags.tag.slice(0, 3) // take the 3 most popular tags(genres)
    )
}
function AddCardHotlist(name, nameUrl, imgUrl, genres) { // params: name - artist name ||| nameUrl - artist page url ||| imgUrl - [174x174]px img ||| genres - take the 3 most popular tags(genres)
    // creating an artist card
    let card = document.createElement("div");
    card.classList.add("music__item");
    // add artist img
    let cardImage = document.createElement("img");
    cardImage.src = imgUrl;
    card.appendChild(cardImage);
    // add artist name hyperlink
    let nameLink = createLink(name, nameUrl, "link", "music__item__title");
    card.appendChild(nameLink);
    // add genres in card
    let genresList = document.createElement("div");
    genres.forEach(genre => {
        genresList.appendChild(createLink(genre.name, genre.url, "link"));
    });
    card.appendChild(genresList);
    // add card in hotlist
    hotList.append(card)
}

function createLink(text, url, ...classes) {
    let link = document.createElement("a");
    link.href = url;
    link.textContent = text;
    link.classList.add(...classes);
    return link;
}


function AddCardTracksList(trackName, trackUrl, artistName, artistUrl, imgUrl, genres) {
    // creating a track card
    let card = document.createElement("div");
    card.classList.add("tracks__item");
    // add track img
    let cardImage = document.createElement("img");
    cardImage.src = imgUrl;
    card.appendChild(cardImage);
    // add track info
    let info = document.createElement("div")
    info.className = "track__item__info"
    let h3 = document.createElement("h3")
    let trackNameLink = createLink(trackName, trackUrl, "link");
    let artistNameLink = createLink(artistName, artistUrl, "link");

    h3.appendChild(trackNameLink)
    info.appendChild(h3);
    info.appendChild(artistNameLink);
    // add genres in card
    let genresList = document.createElement("div");
    genres.forEach(genre => {
        genresList.appendChild(createLink(genre.name, genre.url, "link"));
    });
    info.appendChild(genresList);
    card.appendChild(info);
    // add card in hotlist
    popularTracksList.append(card)
}
