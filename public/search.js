const apiKey = 'cc4ca8f8502472b5f106fb5acf46b614'
const searchCategoriesList = document.querySelector(".navigation") // Список категорий поиска
const artistsList = document.querySelector(".artists__list"); // Список найденных артистов
const albumsList = document.querySelector(".albums__list"); // Список найденных альбомов
const tracksList = document.querySelector(".tracks__list"); // Список найденных треков
const searchResultArea = document.querySelector(".container__inner") // Поле, в котором отображаются результаты поиска
const searchInputCross = document.querySelector(".cross") // Кнопка крестик
const searchInputLens = document.querySelector(".lens"); //Кнопка ввода поиска
const searchResultHeader = document.querySelector(".search__result") // Надпись "Search results for “${тело запроса}”"
const searchInput = document.querySelector(".search__input") // Поле ввода текста

start();

// Функция, которая будет запущена при загрузке страницы
async function start(category = "Top results"){ // Дефолтный раздел Top results
    const searchText = (new URLSearchParams(window.location.search)).get("q") ?? ""; // Вычленяем значение из параметра q(текст, который мы введем в поле поиска)
    if(searchText != ""){
        const fetchedData = await fetchAllData(searchText);
        showSearchResult(searchText, category, fetchedData);
        if(fetchedData.dataArtists.results.artistmatches.artist.length === 0 //Если не найдено ни одного артиста
            && fetchedData.dataAlbums.results.albummatches.album.length === 0 //Если не найдено ни одного альбома
            && fetchedData.dataTracks.results.trackmatches.track.length === 0 //Если не найдено ни одного трека
        )
        {
            alert("Nothing was found");
        }
    }
}
// Функция для получения всей информации по введенному запросу : топ артистов,  албьомов, треков по запросу с информацией о них
async function fetchAllData(searchText){
    const resultData = {
        dataArtists : undefined,
        dataAlbums : undefined,
        dataTracks : undefined
    }
    await Promise.all([fetchResult("artist.search", "artist", searchText), fetchResult("album.search", "album", searchText), fetchResult("track.search", "track", searchText)])
    .then(
        (data) => {
            resultData.dataArtists = data[0];
            resultData.dataAlbums = data[1];
            resultData.dataTracks = data[2];
        }
    )
    return resultData;
}

// Извлечение данных
async function fetchResult(method, category, searchText, limit = 8){
    const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=${method}&${category}=${searchText}&api_key=${apiKey}&limit=${limit}&format=json`)
        .catch(() => alert("Error"));
    const data = await response.json()
    return data;
}

function clearSearchResultArea(){
    searchResultArea.querySelectorAll(".section").forEach((el) => {
        el.parentElement.removeChild(el);
    })
}

//Отслеживание нажатия Enter при вводе поиска
searchInput.addEventListener("keydown", (key) => {
    if(key.code === "Enter"){
        const searchText = searchInput.value;
        window.location.href = `search.html?q=${searchText}`;
    }
});

// Отслеживание нажатия на конопку поиска
searchInputLens.onclick = function(){
    const searchText = searchInput.value;
    window.location.href = `search.html?q=${searchText}`;
}

//Отслеживание нажатия на крестик в строке поиска
searchInputCross.addEventListener("click", () => {
    searchInput.value = "";
})

 //Отслеживание переключения категорий в списке категорий(Top results, artists, albums, tracks)
searchCategoriesList.addEventListener("click", (event) => {
    if(event.target.nodeName === "A"){ // Проверка на то, что выбран какой-то из разделов(гиперссылка)
        if(!event.target.classList.contains("active")){ // Если нажат неоткрытый элемент
            const prevActiveTab = document.querySelector(".active"); // Выделяем элемент, который был открыт
            changeCategory(prevActiveTab); // Меняем состояние активности открытого ранее элемента
            changeCategory(event.target); // Меняем состояние активности открытого сейчас элемента
            const categorieType = event.target.textContent;
            start(categorieType); 
        }
    }
});


//Смена класса активности у категории в списке категорий поиска
function changeCategory(tab){
    tab.classList.toggle("inactive");
    tab.classList.toggle("active");
}
//Функция отображения секции результата поиска в зависимоси от выбранной категории
function showSearchResult(searchText, categoryType, fetchedData){
    clearSearchResultArea();
    switch(categoryType)
    {
        case "Top results":
            showTopResult(searchText, fetchedData);
            break;
        case "Artists":
            showArtistsResult(fetchedData);
            break;
        case "Albums":
            showAlbumsResult(fetchedData);
            break;
        case "Tracks":
            showTracksResult(fetchedData);
            break;
    }
}
//Отображение всех категорий
function showTopResult(searchText, fetchedData){
    searchResultHeader.textContent = `Search results for "${searchText}"`;
    searchInput.value = searchText;
    showArtistsResult(fetchedData);
    showAlbumsResult(fetchedData);
    showTracksResult(fetchedData);
}

//Отображение результатов по категории артистов
async function showArtistsResult(fetchedData){
    searchResultArea.appendChild(createSearchContentSection("Artists")); // Создаем категорию артистов
    const list = document.querySelector(".artists__list");
    fetchedData.dataArtists.results.artistmatches.artist.forEach(el => { // Перебираем артистов по найденому запросу и заполняем список карточками
        insertDataArtist(list,
                            el.name,
                            el.listeners,
                            el.url,
                            el.image[2]["#text"] 
        )
    })
}

//Создаем секцию для поля вывода поиска с названием категории
function createSearchContentSection(titleText){
    let section = document.createElement("div"); // Создаем пространство под заполнение результатами поиска
    section.classList.add("section");

    let title = document.createElement("a"); // Название категории списка
    title.textContent = titleText;
    title.href="#";
    title.classList.add("title__link");
    section.appendChild(title);

    let list = document.createElement("div"); // Создаем тело списка
    if(titleText === "Artists"){
        list.classList.add("search__list", "artists__list");
    }
    if(titleText === "Albums"){
        list.classList.add("search__list", "albums__list");
    }
    if(titleText === "Tracks"){
        list.classList.add("search__list","tracks__list");
    }
    section.appendChild(list);
    return section;
}

//Вставка карточки в список артистов
function insertDataArtist(list, artistName, listenersAmount, artistUrl, imgUrl){
    list.insertAdjacentHTML("beforeend", createArtistCard(
                                    artistName,
                                    listenersAmount,
                                    artistUrl,
                                    imgUrl
                                    ))
}
//Создаем карточку артиста
function createArtistCard(artistName, listenersAmount, artistUrl, imgUrl){
    let template = `
    <div class="item">
        <img src=${imgUrl}>
        <div class="info">
            <h2><a href=${artistUrl}>${artistName}</a></h2>
            <p>${listenersAmount} listeners</p>
        </div>
    </div>`
    return template
}

//Отображение результатов по категории альбомов
async function showAlbumsResult(fetchedData){
    searchResultArea.appendChild(createSearchContentSection("Albums")); // Добавляем в разметку область под список
    const list = document.querySelector(".albums__list");
    fetchedData.dataAlbums.results.albummatches.album.forEach(el => { // Перебираем альбомы по найденому запросу
        const artistUrl = el.url.slice(0, el.url.lastIndexOf("/")); // Отрезаем последний "параметр" - название трека, тем самым получая url на артиста. Пример изначального url : https://www.last.fm/music/Drake/CERTIFIED+LOVER+BOY
        insertDataAlbum(list,
                            el.name,
                            el.url,
                            el.artist,
                            artistUrl,
                            el.image[2]["#text"]
        );
        
    })
}

//Вставка карточки в список альбомов
function insertDataAlbum(list, albumName, albumUrl, artistName, artistUrl, imgUrl){
    list.insertAdjacentHTML("beforeend", createImageAlbumCard(
                                            albumName,
                                            albumUrl,
                                            artistName,
                                            artistUrl,
                                            imgUrl
                                        ))
}

//Создаем карточку альбома
function createImageAlbumCard(albumName, albumUrl, artistName, artistUrl, imgUrl){
    let template = `
    <div class="item">
        <img src=${imgUrl}>
        <div class="info">
            <div class="bg">
                <h2><a href=${albumUrl} class="link">${albumName}</a></h2>
                <a class="link" href=${artistUrl}">${artistName}</a>
            </div>
        </div>
    </div>`
    return template
}

//Отображение результатов по категории треков
async function showTracksResult(fetchedData){
    searchResultArea.appendChild(createSearchContentSection("Tracks")); // Добавляем в разметку область под список
    const list = document.querySelector(".tracks__list");
    fetchedData.dataTracks.results.trackmatches.track.forEach(el => {
        const artistUrl = el.url.slice(0, el.url.lastIndexOf("/")-2); // Изначально полученный url : https://www.last.fm/music/Meek+Mill/_/Going+Bad+(feat.+Drake) . Обрезаем последний "параметр" и "/_"
        insertDataTracks(list,
                            el.name,
                            el.url,
                            el.artist,
                            artistUrl,
                            el.image[0]["#text"]
        );
        
    })
}

//Вставка карточки в список треков
function insertDataTracks(list, trackName, trackUrl, authorName, authorUrl, imgUrl){
    list.insertAdjacentHTML("beforeend", createLineMusicCard(
                                            trackName,
                                            trackUrl,
                                            authorName,
                                            authorUrl,
                                            imgUrl
                                        ))
}

//Создаем карточку трека
function createLineMusicCard(trackName, trackUrl, authorName, authorUrl, imgUrl){
    let template = `
    <div class="track__item">
        <img src="${imgUrl}">
        <img src="like.png">
        <h2><a class="link" href="${trackUrl}">${trackName}</a></h2>
        <a class="link" href=${authorUrl}>${authorName}</a>
    </div>`
    return template;
}