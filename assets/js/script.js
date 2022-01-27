var sendTitle = function() {
  var title = $("input[name='movie-search-title']").val();
    getMovie(title)
    getQuotes(title)
}
$("input[name='movie-search-title']").keydown(function (e){
  if(e.keyCode == 13){
    e.preventDefault();
    sendTitle();
  }
})
// movie input autocomplete 
var searchInput = document.getElementById('searchBox');
var baseUrl = "http://sg.media-imdb.com/suggests/";
var result = document.getElementById('result');
searchInput.addEventListener('keyup', function(){
  $("#result").removeClass("hidden");
	//clearing blank spaces from input
	var cleanInput = searchInput.value.replace(/\s/g, "");
	//clearing result div if the input box in empty
	if(cleanInput.length === 0) {
		result.innerHTML = "";
	}
	if(cleanInput.length > 0) {
		var queryUrl = baseUrl + cleanInput[0].toLowerCase() + "/" 
    + cleanInput.toLowerCase()
    + ".json";	
    $.ajax({
      url: queryUrl,
      dataType: 'jsonp',
      cache: true,
      jsonp: false,
      jsonpCallback: "imdb$" + cleanInput.toLowerCase()
    }).done(function (result) {
      //clearing result div if there is a valid response
      if(result.d.length > 0) {
        result.innerHTML = "";
      }
      for(var i = 0; i < result.d.length; i++) {
        let category = result.d[i].id.slice(0,2);
        if(category === "tt" || category === "nm") {		    		
          //row for risplaying one result
          let resultRow = document.createElement('p');
          resultRow.setAttribute('class', 'resultRow')
		    		//creating and setting description
            let description = document.createElement('div');
            description.setAttribute('class', 'description');
            let name = document.createElement('h4');
            let snippet = document.createElement('h5');
            if(category === "tt" && result.d[i].y) {
              name.innerHTML = result.d[i].l + " (" + result.d[i].y + ")";
              let nameText = name.innerHTML
              $(name).click(function (e) { 
                e.preventDefault();
                let title = nameText.slice(0, nameText.lastIndexOf(" "))
                getMovie(title)
                getQuotes(title)
              });
            } else {
              name.innerHTML = result.d[i].l;
              let nameText = name.innerHTML
              $(name).click(function (e) { 
                e.preventDefault();
                let title = nameText.slice(0, nameText.lastIndexOf(" "))
                getMovie(title)
                getQuotes(title)
              });
            }
            snippet.innerHTML = result.d[i].s;
            $(description).append(name);
            $(resultRow).append(description);
            $("#result").append(resultRow);
		    	}
		    }
		});
	}
});

// primary movie information (API #1)
var getMovie = function(title) {
    $("#result").addClass("hidden")
    $("#main").removeClass("hidden");
    $("#search-form").trigger("reset");
    //format the OMDB api url 
    var apiUrl = `http://www.omdbapi.com/?t=${title}&plot=full&apikey=836f8b0`
    //make a request to the url 
    fetch(apiUrl)
    .then(function(response) {
         // request was successful 
        if (response.ok) {
            response.json().then(function(movieData) {
            // console.log(movieData)
            var movieTitle = movieData.Title
            getMovieId(movieTitle);
            getSoundTrack(movieTitle);
            getTrailer(movieTitle);
            var movieObj = {
              title: movieTitle,
            }
            var pastSearches = loadPastSearches();
            var alreadySearched = false 
            if (pastSearches) {
              pastSearches.forEach (s => {
                if (s.title === movieTitle) {
                  alreadySearched = true;
                  }
              })
          }
          if (!alreadySearched) {
            for (var item of pastSearches) {
              let searchEl = document.createElement("a")
              let pastSearchTitle = item.title
              $(searchEl).text(pastSearchTitle)
              $(searchEl).addClass("past-search-item");
              $("#past-search-dropdown").append(searchEl)
              $(searchEl).click(function (e) { 
                e.preventDefault();
                let title = pastSearchTitle
                getMovie(title)
                getQuotes(title)
              });
              }
            }
            saveSearch(movieObj)
            showMovie(movieData);
        });
    } else {
        alert("Error: title not found!");
    }
})
.catch(function(error) {
    alert("Unable to connect to CineXScore app");
    console.log(error)
    });
};
// get specialID for other movie details (API #2)
var getMovieId = function(movieTitle) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://imdb8.p.rapidapi.com/title/find?q=${movieTitle}`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "imdb8.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (response) {
    console.log(response);
    var specialId = response.results[0].id
    var specialId = specialId.replace("/title/", "")
    var specialId = specialId.replace("/","")
    // console.log(specialId)
    getMovieImgs(specialId)
    getPromos(specialId)
  });
}
// get hero image (API #2)
var getPromos = function(specialId) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://imdb8.p.rapidapi.com/title/get-hero-with-promoted-video?tconst=${specialId}&purchaseCountry=US&currentCountry=US`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "imdb8.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  $.ajax(settings).done(function (promoData) {
    // console.log(promoData);
    $("#hero-image").attr("src", promoData.heroImages[0].url)
  });
}
// get additional images (API #2)
var getMovieImgs = function(specialId) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://imdb8.p.rapidapi.com/title/get-images?tconst=${specialId}&limit=25`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "imdb8.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (movieImgs) {
    // console.log(movieImgs);
    $("#cast-image").attr("src", movieImgs.images[0].url);
  });
}
// get movie soundtrack (API #3)
var getSoundTrack = function(movieTitle) {
  var movieTitle = movieTitle.replaceAll(" ", "")
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://shazam.p.rapidapi.com/search?term=${movieTitle}%20soundtrack&locale=en-US&offset=0&limit=5`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "shazam.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (soundTrackData) {
    // console.log(soundTrackData);
    var albumName = soundTrackData.tracks.hits[0].track.title
    var albumDetails = soundTrackData.tracks.hits[0].track.subtitle
    var albumImg = soundTrackData.tracks.hits[0].track.images.coverart
    var albumUrl = soundTrackData.tracks.hits[0].track.url
    $("#soundtrack-title").text(albumName)
    $("#soundtrack-image").attr("src", albumImg)
    $("#soundtrack-link").attr("href", albumUrl)
    $("#soundtrack-details").text(albumDetails)
    var trackObj = {
      name: albumName,
      url: albumUrl
    };
    $("#save-to-favorites").click(function (e) { 
      e.preventDefault();
      saveTrack(trackObj)
    });
  });
}
// get movie trailer (API #3)
var getTrailer = function (movieTitle) {
  var movieTitle = movieTitle.replaceAll(" ", "");
  var movieTitle = `${movieTitle}officialtrailer`
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://youtube-search-results.p.rapidapi.com/youtube-search/?q=${movieTitle}`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "youtube-search-results.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (trailerData) {
    // console.log(trailerData);
    $("#video-title").text(trailerData.items[0].title)
    var embedCode = trailerData.items[0].url.replace("https://www.youtube.com/watch?v=","")
    var trailerLink = `https://www.youtube.com/embed/${embedCode}`
    $("#trailer").attr("src", trailerLink)
    $("#video-description").text(trailerData.items[0].description)
    
  });
}
// get movie quotes (API #4)
var getQuotes = function(title) {
  $("#quote-items").html("");
  $("#movie-quotes-heading").removeClass("hidden");
  var title = title.replaceAll(" ","_")
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://movie-and-tv-shows-quotes.p.rapidapi.com/quotes/from/${title}`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "movie-and-tv-shows-quotes.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (quoteData) {
    // console.log(quoteData);
    showQuotes(quoteData)
  })
  .fail(function(xhr, status, error) {
    //Ajax request failed.
    var errorMessage = xhr.status + ': ' + xhr.statusText
    console.log(`Error - ${errorMessage}`);
    $("#movie-quotes-heading").addClass("hidden");
  });
}
// change the page HTML to show movie information
var showMovie = function(movieData) {
  $("#movie-title").text(movieData.Title)
  $("#year-rating").text(`${movieData.Year}, ${movieData.Rated}`)
  $("#genre").text(`${movieData.Genre}`)
  $("#synopsis").text(movieData.Plot)
  $("#poster").attr("src", movieData.Poster);
  $("#cast-list").text(`Main Cast: ${movieData.Actors}`)
  $("#director").text(`Director: ${movieData.Director}`)
  $("#writer").text(`Writer(s): ${movieData.Writer}`)
  $("#imdb-rate").text(`${movieData.Ratings[0].Source} - ${movieData.Ratings[0].Value}`)
  $("#tomatoes-rate").text(`${movieData.Ratings[1].Source} - ${movieData.Ratings[1].Value}`)
  $("#metacritic-rate").text(`${movieData.Ratings[2].Source} - ${movieData.Ratings[2].Value}`)
  var tomatoesRate = (movieData.Ratings[1].Value).replace("%", "")
  parseInt(tomatoesRate)
  if (tomatoesRate <= 60) {
    $("#tomatoes-rate-image").attr("src", "https://www.clipartmax.com/png/full/351-3516739_cherry-tomato-clipart-tomatoe-rotten-tomatoes-icon-png.png")
  } else if (tomatoesRate >= 60) {
    $("#tomatoes-rate-image").attr("src", "https://www.clipartmax.com/png/full/50-503981_rotten-tomatoes-fresh-logo.png")
  }
}
// if there are famous quotes display those on page 
var showQuotes = function(quoteData) {
  $("#movie-quotes-heading").text("Movie Quotes")
    quoteData.forEach(quoteItem => {
    var carouselItem = document.createElement("div")
    $(carouselItem).html(`<h4 class='quote'>"${quoteItem.quote}"<br><br><span class='quote-character'>-${quoteItem.character}</span></h4><br>`)
    $(carouselItem).appendTo("#quote-items");
  });
}
// save past search
var saveSearch = function (movieObj) {
  var pastSearches = loadPastSearches();
  pastSearches.push(movieObj);
  localStorage.setItem("movieObjects", JSON.stringify(pastSearches))
}
loadPastSearches = function() {
  var pastSearches = JSON.parse(localStorage.getItem("movieObjects"));
  if (!pastSearches || !Array.isArray(pastSearches)) {
    var pastSearches = []
  }
  return pastSearches;
}
// dropdown favorite soundtrack buttons 
var saveTrack = function(trackObj) {
  var faveTracks = JSON.parse(localStorage.getItem("trackObjects"));
  if (!faveTracks || !Array.isArray(faveTracks)) {
    var faveTracks = []
  }
  var alreadySearched = false 
  if (faveTracks) {
    faveTracks.forEach (t => {
      if (t.name === trackObj.name) {
        alreadySearched = true;
        }
    })
}
if (!alreadySearched) {
    let trackEl = document.createElement("a")
    $(trackEl).addClass("fave-track");
    $(trackEl).text(trackObj.name);
    $(trackEl).attr("href", trackObj.url);
    $(trackEl).attr("target", "_blank")
    $("#favorite-tracks-dropdown").append(trackEl)
} 
faveTracks.push(trackObj);
localStorage.setItem("trackObjects", JSON.stringify(faveTracks))
}
// populate favorites list when page loads
var populateFavorites = function() {
  var faveTracks = JSON.parse(localStorage.getItem("trackObjects"));
  if (!faveTracks || !Array.isArray(faveTracks)) {
    var faveTracks = []
  }
  for (var track of faveTracks) {
    let trackEl = document.createElement("a")
    $(trackEl).addClass("fave-track");
    $(trackEl).text(track.name);
    $(trackEl).attr("href", track.url);
    $(trackEl).attr("target", "_blank")
    $("#favorite-tracks-dropdown").append(trackEl)
  }
} 
$(document).ready(function() {populateFavorites()});
// clear searches and favorite tracks
$("#clear-searches").click(function (e) { 
  e.preventDefault();
  [...$(".past-search-item")].map(thisSearch => thisSearch.remove());
  localStorage.removeItem("movieObjects");
});
$("#clear-favorites").click(function (e) { 
  e.preventDefault();
  [...$(".fave-track")].map(thisTrack => thisTrack.remove());
  localStorage.removeItem("trackObjects");
});