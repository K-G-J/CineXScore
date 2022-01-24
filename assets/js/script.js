// basic scrolling fluidity 
$(document).ready(function(){
    // Add smooth scrolling to all links in navbar + footer link
    $(".navbar a, footer a[href='#mainPage']").on('click', function(event) {
      // Make sure this.hash has a value before overriding default behavior
      if (this.hash !== "") {
        // Prevent default anchor click behavior
        event.preventDefault();
  
        // Store hash
        var hash = this.hash;
  
        // Using jQuery's animate() method to add smooth page scroll
        // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 900, function(){
     
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        });
      } // End if
    });
    
    $(window).scroll(function() {
      $(".slideanim").each(function(){
        var pos = $(this).offset().top;
  
        var winTop = $(window).scrollTop();
          if (pos < winTop + 600) {
            $(this).addClass("slide");
          }
      });
    });
  })

  function getTitle() {
    var title = $("input[name='movie-search-title']").val();
    console.log(title)
    getMovie(title)
  }

  // movie search 
  var getMovie = function(title) {
    //format the OMDB api url 
    var apiUrl = `http://www.omdbapi.com/?t=${title}&plot=full&apikey=836f8b0`
    //make a request to the url 
    fetch(apiUrl)
    .then(function(response) {
         // request was successful 
        if (response.ok) {
            response.json().then(function(data) {
            console.log(data)
            showMovie(data)
        });
    } else {
        alert("Error: title not found!");
    }
})
.catch(function(error) {
    alert("Unable to connect to cine score app");
    });
};
var showMovie = function(data) {
  $("#movie-title").text(data.Title)
  $("#year-rating").text(`${data.Year}, ${data.Rated}`)
  $("#genre").text(`${data.Genre}`)
  $("#synopsis").text(data.Plot)
  $("#movie-poster").prepend(`<img id="poster" src=${data.Poster} />`)
  $("#cast-list").text(` ${data.Actors}`)
  $("#director").text(`Director: ${data.Director}`)
  $("#writer").text(`Writer(s): ${data.Writer}`)
  $("#imdb-rate").text(`${data.Ratings[0].Source} - ${data.Ratings[0].Value}`)
  $("#tomatoes-rate").text(`${data.Ratings[1].Source} - ${data.Ratings[1].Value}`)
  $("#metacritic-rate").text(`${data.Ratings[2].Source} - ${data.Ratings[2].Value}`)
  var tomatoesRate = (data.Ratings[1].Value).replace("%", "")
  parseInt(tomatoesRate)
  if (tomatoesRate <= 60) {
    $("#rating-img").prepend(`<img id="tomatoes-rate" src="https://www.clipartmax.com/png/full/351-3516739_cherry-tomato-clipart-tomatoe-rotten-tomatoes-icon-png.png" />`)
  } else if (tomatoesRate >= 60) {
    $("#rating-img").prepend(`<img id="tomatoes-rate" src="https://www.clipartmax.com/png/full/50-503981_rotten-tomatoes-fresh-logo.png" />`)
  }
}