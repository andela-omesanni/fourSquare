// JavaScript Document

$(document).ready(function(){
    var fourAPI = "https://api.foursquare.com/v2/venues/explore?callback=?"; //api to get venues
	
    var params, directionsDisplay, geocoder, map, result_div = "", searchAddr,
    markers = [], directionsService = new google.maps.DirectionsService();

    var category = $(".active").attr("title"); 
	getVenues(category);
	
	
	$('#navlist li a').click(function(e) {
			e.preventDefault();
			var $this = $(this), category = this.title;
			$this.parent().siblings('li').find('a').removeClass('active');
			$this.removeClass().addClass('active');	
			getVenues(category);
	 });
	
	//event that gets triggered to begin the process of searching for places through four square api
    function getVenues(section) {
	   $("#directions-panel").hide();
	   $("#start").val('');
	   $("#end").val('');
	  
	   $("#left").html('<img id="spinner" src="img/loader.GIF" />'); //show visual animation so users can see search is going on
	   
	   //setAllMap(); //remove all previous markers on the map
	   if (directionsDisplay)
	      directionsDisplay.setMap(null); //remove previous direction route lanes and markers
		if (map)
	       map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
   
	   //parameters to be passed to four square api
       params =  {client_id: "FUUNFVS1KWHL1AT0NLM1DXTA2ZCP21R3HNRJSVZT0CWN5XM0", 
                  client_secret: "UKS4ZAEKGMQ1JBWGOBROVJ2TSNBLMPEHTZR4TNMRL2VG50KL",
                  ll: "6.4531,3.3958", section: section, v: "20130815"};
        

       var fourCallback = function(resp){ //callback function for when response comes back from  four square
		    var results = resp.response.groups[0].items;
      
		   if(results.length > 0 ) { //we have results from our search
				 //$("#right").show();     //display div(which is hidden by default) that houses the map canvas
				 //google.maps.event.trigger(map, 'resize');   //resize map canvas to to 100%  width of its container
				// map.setCenter(new google.maps.LatLng(6.4531, 3.3958));   //set map to longitude and latitude of lagos
				 
				 $.each(results, function(index, result){ 
					var photoEndPt = "https://api.foursquare.com/v2/venues/";   //api for getting photos of each venue
					
				   /*declare variables that will be populated with values from out search results. All
					 variables apart from name are set to n/a by default to resolve undefined error values
					 from certain object values in our search results */
					 
					var name = result.venue.name, rating = "n\/a", cost = "n\/a";
					var addr = result.venue.location.address, city = result.venue.location.city, fullAddr;
					
					//check for undefined error inconsistency with object values that are needed
					if(result.venue.price && typeof  result.venue.price.message !== "undefined"){
						cost =  result.venue.price.message;
					}
					
					if (typeof addr === "undefined" && typeof city === "undefined" ){
						fullAddr = "Lagos";
					}else if (typeof addr === "undefined" && typeof city !== "undefined" ){
						 fullAddr = city;
					}else if (typeof addr !== "undefined" && typeof city === "undefined" ){
						 fullAddr = addr;
					} else { fullAddr = addr + ", " + city; }
		
					if (typeof result.venue.rating !== "undefined") {
						rating = result.venue.rating;
					}
					
					//declare variables associated with retrieving results from photo endpoint
					photoEndPt = photoEndPt + result.venue.id + "/photos?callback=?";
					photoParams =  {client_id: "FUUNFVS1KWHL1AT0NLM1DXTA2ZCP21R3HNRJSVZT0CWN5XM0", 
									client_secret: "UKS4ZAEKGMQ1JBWGOBROVJ2TSNBLMPEHTZR4TNMRL2VG50KL",
									v: "20140714"};
					var photoUrl = "", photoSize = "150x130";
									
					var photoCallback = function(data) { //callback function
						if(typeof data.response.photos !== 'undefined'){ 
						   var dataRes = data.response.photos.items[0]; //get only one photo from the array
						}
						
					    if (dataRes) { //check object exists to avoid uncaught error property of undefined
						   if (typeof dataRes.prefix !== "undefined" && typeof dataRes.suffix !== "undefined") {
								photoUrl = dataRes.prefix + photoSize + dataRes.suffix; //file path of venue image
								
								var result_div = "";
								
								result_div += '<div class="col-lg-12 gradient">';
								result_div += '<img src=' + photoUrl +' />';
								result_div += '<h2>'+ name + '</h2>';
								result_div += '<p>Address: <span>' + fullAddr + '</span></p>';
								result_div += '<p>Cost: ' + cost + '</p>';
								result_div += '<p>Rating: ' + rating + '</p></div>';
								
								$("#left").append(result_div); //put the results into the DOM
								
						  }
					   }//end dataRes
				   };//end callback
					
				   $.getJSON(photoEndPt, photoParams, photoCallback);
					
				}); //end each loop
				$("#spinner").hide(); //hide ajax animation loader
				$("#intro").hide(); //hide the div which displays description about the app when the page loads
			    $("#left").show(); //display the div that has our results
				$("#right").show();
		   } else {
			    $("#intro").html("<h2>No results found</h2>").show(); //no results were found
			    $("#left").hide(); 
			    $("#right").hide();
			    $("#intro").css("margin-left", "33%");
		    }
			$("#submit").attr("disabled", false).val('Search'); //enable search button once search is done
        };//end fourCallback
        $.getJSON(fourAPI, params, fourCallback);
    }

    function initialize() {  //initializes map once the page loads
		  directionsDisplay = new google.maps.DirectionsRenderer();  //object for rendering route lanes on the mao
		  geocoder = new google.maps.Geocoder();  //object for converting address to co-ordinates on the map
	
		  var mapOptions = {
			zoom: 15,
			center: new google.maps.LatLng(6.4531, 3.3958)
		  };
	
		  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
		  directionsDisplay.setMap(map);
		  directionsDisplay.setPanel(document.getElementById('directions-panel'));
	
		  var control = document.getElementById('control');
		  control.style.display = 'block';
		  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    }

    function calcRoute(start, end) { //calculates direction route between addresses
          
		  directionsDisplay.setMap(null); //remove previous routing lanes from map
		  
		  var request = {
			origin: start,
			destination: end,
			travelMode: google.maps.TravelMode.DRIVING
		  };
		  directionsService.route(request, function(response, status) {
			$("#start").val(start);
			$("#end").val(end);
			if (status == google.maps.DirectionsStatus.OK) {
			  $("#directions-panel").show();
			  directionsDisplay.setMap(map);
			  directionsDisplay.setDirections(response);
			}
			else { 
			   $("#directions-panel").html(" ").hide(); 
               map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
			   alert("Google couldn't find a route between the addresses");
			}
		 });
    }
	
	//gets co-ordinates of user's current location using geolocation
	function geoLocate(endAddr) {
		 if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				searchPlace(pos, endAddr);
			}, function() {
			     alert('Error: The Geolocation service failed');
			});
		 } else {
			// Browser doesn't support Geolocation
			alert('Error: Your browser doesn\'t support geolocation');
		 }
    }
	
    //gets the address in string format of a given co-ordinate position
    function searchPlace(pos, endAddr) {
        $("#directions-panel").html(" ").hide(); 
        directionsDisplay.setMap(null); //remove previous routing lanes from map
		
        geocoder.geocode( { 'latLng': pos}, function(results, status) { //takes address and gets its co-ordinates
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
				var startAddr = results[1].formatted_address;  //address in string for the co-ordinates we passed
				calcRoute(startAddr, endAddr);
			} else {
                alert('No results found');
            }
          } else {
			  map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
              alert("Google could not locate the address on the map");
          }//end else
       }); //close geocoder
    }

    $('body').on("click", ".col-lg-12", function() { 
        var $siblings = $(this).siblings();
        $siblings.removeClass("blue").addClass("gradient");
        $(this).addClass("blue"); 
		
        searchAddr = $(this).children('p').children('span').text();
        geoLocate(searchAddr); //search for address of particular venue
    });
	
	$("#route").click(function() { //event for finding route b/w adresses
		var start = $.trim($("#start").val());	
		var end =   $.trim($("#end").val());	
	    
		if(start === "" || end === "" ) {
			alert("No input field should be left blank");
		} else {
			calcRoute(start, end);
		}
	});

    google.maps.event.addDomListener(window, 'load', initialize); //loads maps when a new page loads

});