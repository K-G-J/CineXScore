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
// movie autocomplete 
var $input = document.getElementById('searchBox');
var baseUrl = "http://sg.media-imdb.com/suggests/";
var $result = document.getElementById('result');
$input.addEventListener('keyup', function(){
  $("#result").removeClass("hidden");
	//clearing blank spaces from input
	var cleanInput = $input.value.replace(/\s/g, "");
	//clearing result div if the input box in empty
	if(cleanInput.length === 0) {
		$result.innerHTML = "";
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
        $result.innerHTML = "";
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

// movie search 
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
            console.log(movieData)
            showMovie(movieData)
        });
    } else {
        alert("Error: title not found!");
    }
})
.catch(function(error) {
    alert("Unable to connect to cine score app");
    });
};
var getMovieId = function(currMovieTitle) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://imdb8.p.rapidapi.com/title/find?q=${currMovieTitle}`,
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
    console.log(specialId)
    getSoundTrack(specialId)
  });
}
var getSoundTrack = function(specialId) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://imdb8.p.rapidapi.com/title/get-sound-tracks?tconst=${specialId}`,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "imdb8.p.rapidapi.com",
      "x-rapidapi-key": "229d984177msh18d191b1335378fp137dcejsn7c92ab2acfaf"
    }
  };
  
  $.ajax(settings).done(function (soundTrackData) {
    console.log(soundTrackData);
  });
}
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
    console.log(quoteData);
    showQuotes(quoteData)
  })
  .fail(function(xhr, status, error) {
    //Ajax request failed.
    var errorMessage = xhr.status + ': ' + xhr.statusText
    console.log(`Error - ${errorMessage}`);
    $("#movie-quotes-heading").addClass("hidden");
  });
}
var showMovie = function(movieData) {
  $("#movie-title").text(movieData.Title)
  let currMovieTitle = movieData.Title
  getMovieId(currMovieTitle);
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
    $("#tomatoes-rate").attr("src", "https://www.clipartmax.com/png/full/351-3516739_cherry-tomato-clipart-tomatoe-rotten-tomatoes-icon-png.png")
  } else if (tomatoesRate >= 60) {
    $("#tomatoes-rate").attr("src", "https://www.clipartmax.com/png/full/50-503981_rotten-tomatoes-fresh-logo.png")
  }
}
var showQuotes = function(quoteData) {
  $("#movie-quotes-heading").text("Movie Quotes")
    quoteData.forEach(quoteItem => {
    var carouselItem = document.createElement("div")
    $(carouselItem).html(`<h4 class='quote'>"${quoteItem.quote}"<br><br><span class='quote-character'>-${quoteItem.character}</span></h4><br>`)
    $(carouselItem).appendTo("#quote-items");
  });
}