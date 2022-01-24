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
  $("#search").click(function (e) { 
    e.preventDefault();
    getTitle();
  });

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
        });
    } else {
        alert("Error: title not found!");
    }
})
.catch(function(error) {
    alert("Unable to connect to cine score app");
    });
};