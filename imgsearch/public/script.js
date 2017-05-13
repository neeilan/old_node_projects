 var APIcall = false;
 $(function() {
  var $container = $('#results');
  $container.imagesLoaded(function() {
   $container.masonry({
    itemSelector: '.imgitem'
   });
  });

 });

 function callAPI() {
  APIcall = true;
  if (validate() === 0) {
   var term = encodeURIComponent(document.getElementById("term").value),
    offset = document.getElementById("offset").value,
    page = window.location.href;
   page.charAt(page.length - 1) == "/" ? null : page += "/";
   var uri = page + "search?term=" + term + "&offset=" + offset;
   window.location = uri;
  }
 }

 function validate() {
  var offset = document.getElementById('offset');
  var term = document.getElementById('term');
  if (offset.value.length <= 0 || isNaN(offset.value)) {
   offset.value = "1";
  }
  if (term.value.length === 0) {
   alert("Enter a search term");
   return false;
  }
  return 0;
 }

 function makeRequest() {
  var term = encodeURIComponent(document.getElementById("term").value),
   offset = document.getElementById("offset").value,
   page = window.location.href;

  page.charAt(page.length - 1) == "/" ? null : page += "/";
  var uri = page + "search?term=" + term + "&offset=" + offset;

  $.ajax({
   type: "GET",
   url: uri,
   dataType: "json",
   success: function(data) {
    data = data.results;
    console.log(data);
    $("#results").html("");
    var html = ""; 
    data.forEach(function(item) {

     var image = "<img src = '" + item.url + "' alt='" + item.alt + "' width ='250px' class='imgitem'>";
     html += image;

    })
    $("#results").append(html).masonry('reloadItems');

    $('img').load(function() {
     $('#results').masonry({
      itemSelector: '.imgitem',
      isAnimated: true,
      isFitWidth: true
     });
    });

   }

  })

 }