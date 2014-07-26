// JavaScript Document

$(document).ready(function(){
   
        var fourSq = {

            init: function(){
                var mapOptions = {
                   zoom: 15,
                   center: new google.maps.LatLng(6.4531, 3.3958)
                };
                fourSq.config = {
                    fourAPI: "https://api.foursquare.com/v2/venues/explore?callback=?",
                    directionsService: new google.maps.DirectionsService(),
                    map: new google.maps.Map(document.getElementById('map-canvas'), mapOptions),
                    geocoder: new google.maps.Geocoder(),
                    directionsDisplay: new google.maps.DirectionsRenderer(),
                    category: $(".active").attr("title"),
                    rating: "n/a",
                    cost: "n/a",
                    address: "n/a",
                    city: "n/a",
                    fullAddr: "n/a",
                    searchAddr: " "
                }
                fourSq.initMap();
                fourSq.getVenues(fourSq.config.category);
                fourSq.setupListeners();

            },

            initMap: function(){
                fourSq.config.directionsDisplay.setMap(fourSq.config.map);
                fourSq.config.directionsDisplay.setPanel(document.getElementById('directions-panel'));
            
                var control = document.getElementById('control');
                control.style.display = 'block';
                fourSq.config.map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
            },

            getVenues: function(section){
                $("#directions-panel").hide();
                $("#start").val('');
                $("#end").val('');
                  
                $("#left").html('<img id="spinner" src="img/loader.GIF" />'); //show visual animation so users can see search is going on
                   
                if (fourSq.config.directionsDisplay) {
                    fourSq.config.directionsDisplay.setMap(null); //remove previous direction route lanes and markers
                }

                if (fourSq.config.map) {
                    fourSq.config.map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
                }

                var params =  {
                    client_id: "FUUNFVS1KWHL1AT0NLM1DXTA2ZCP21R3HNRJSVZT0CWN5XM0", 
                    client_secret: "UKS4ZAEKGMQ1JBWGOBROVJ2TSNBLMPEHTZR4TNMRL2VG50KL",
                    ll: "6.4531,3.3958", 
                    section: section, 
                    v: "20130815"
                };
        
                $.getJSON(fourSq.config.fourAPI, params, fourSq.fourCallback);    
            },//end getVenues

            fourCallback: function(resp){ //callback function for when response comes back from  four square
                    var results = resp.response.groups[0].items;

                    if (results.length > 0) {
                        $.each(results, function(index, result){
                           var photoEndPt = "https://api.foursquare.com/v2/venues/";  
                           
                           //declare variables associated with retrieving results from photo endpoint
                           photoEndPt = photoEndPt + result.venue.id + "/photos?callback=?";
                           var photoParams =  {
                                client_id: "FUUNFVS1KWHL1AT0NLM1DXTA2ZCP21R3HNRJSVZT0CWN5XM0", 
                                client_secret: "UKS4ZAEKGMQ1JBWGOBROVJ2TSNBLMPEHTZR4TNMRL2VG50KL",
                                v: "20140714"
                           };
                           
                           $.getJSON(photoEndPt, photoParams, function(photoData) {
                                return fourSq.photoCallback(photoData, result)
                           });
                        });//end each loop
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
            },  

            photoCallback: function(data, venueResults) {
               var photoUrl = "", photoSize = "150x130";
               var name = venueResults.venue.name;

               fourSq.valVenueResults(venueResults);

               if (typeof data.response.photos !== 'undefined'){ 
                  var dataRes = data.response.photos.items[0]; //get only one photo from the array
               }

               if (dataRes){
                   if (typeof dataRes.prefix !== "undefined" && typeof dataRes.suffix !== "undefined"){
                        photoUrl = dataRes.prefix + photoSize + dataRes.suffix; //file path of venue image
                
                        var result_div = "";
                        
                        result_div += '<div class="col-lg-12 gradient">';
                        result_div += '<img src=' + photoUrl +' />';
                        result_div += '<h2>'+ name + '</h2>';
                        result_div += '<p>Address: <span>' + fourSq.config.fullAddr + '</span></p>';
                        result_div += '<p>Cost: ' + fourSq.config.cost + '</p>';
                        result_div += '<p>Rating: ' + fourSq.config.rating + '</p></div>';
                        
                        $("#left").append(result_div); //put the results into the DOM
                    }
                }//end dataRes
            }, //end photoCallback

            valVenueResults: function(result) { //validates results returned from four square venues end point
               if(result.venue.price && typeof  result.venue.price.message !== "undefined"){
                  fourSq.config.cost =  result.venue.price.message;
               } 
                
               if (typeof addr === "undefined" && typeof city === "undefined" ){
                  fourSq.config.fullAddr = "Lagos";
               }else if (typeof addr === "undefined" && typeof city !== "undefined" ){
                  fourSq.config.fullAddr = city;
               }else if (typeof addr !== "undefined" && typeof city === "undefined" ){
                  fourSq.config.fullAddr = addr;
               } else { 
                  fourSq.config.fullAddr = addr + ", " + city; 
               }
    
               if (typeof result.venue.rating !== "undefined") {
                  fourSq.config.rating = result.venue.rating;
               }

            },

            calcRoute: function(start, end){
                fourSq.config.directionsDisplay.setMap(null); //remove previous routing lanes from map
          
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                fourSq.config.directionsService.route(request, function(response, status) {
                    $("#start").val(start);
                    $("#end").val(end);
                    if (status == google.maps.DirectionsStatus.OK) {
                        $("#directions-panel").show();
                        fourSq.config.directionsDisplay.setMap(fourSq.config.map);
                        fourSq.config.directionsDisplay.setDirections(response);
                    } else {
                        $("#directions-panel").html(" ").hide(); 
                        fourSq.config.map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
                        alert("Google couldn't find a route between the addresses");
                    }
                });
            },
            
            //gets co-ordinates of user's current location using geolocation
            geoLocate: function(endAddr) {
                if(navigator.geolocation) {
                   navigator.geolocation.getCurrentPosition(function(position) {
                      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                      fourSq.searchPlace(pos, endAddr);
                   }, function() {
                        alert('Error: The Geolocation service failed');
                   });
                } else {
                    // Browser doesn't support Geolocation
                    alert('Error: Your browser doesn\'t support geolocation');
                }
            },

            //gets the address in string format of a given co-ordinate position
            searchPlace: function (pos, endAddr) {
                $("#directions-panel").html(" ").hide(); 
                fourSq.config.directionsDisplay.setMap(null); //remove previous routing lanes from map
                
                fourSq.config.geocoder.geocode( { 'latLng': pos}, function(results, status) { //takes address and gets its co-ordinates
                  if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        var startAddr = results[1].formatted_address;  //address in string for the co-ordinates we passed
                        fourSq.calcRoute(startAddr, endAddr);
                    } else {
                        alert('No results found');
                    }
                  } else {
                      fourSq.config.map.setCenter(new google.maps.LatLng(6.4531, 3.3958));
                      alert("Google could not locate the address on the map");
                  }//end else
                }); //close geocoder
            },

            setupListeners: function(){
                $('body').on("click", ".col-lg-12", function() {
                    var $siblings = $(this).siblings();
                    $siblings.removeClass("blue").addClass("gradient");
                    $(this).addClass("blue"); 
                    
                    fourSq.config.searchAddr = $(this).children('p').children('span').text();
                    fourSq.geoLocate(fourSq.config.searchAddr); //search for address of particular venue
                });

                $("#route").click(function() { //event for finding route b/w adresses
                    var start = $.trim($("#start").val());  
                    var end =   $.trim($("#end").val());    
                        
                    if(start === "" || end === "" ) {
                       alert("No input field should be left blank");
                    } else {
                       fourSq.calcRoute(start, end);
                    }
                });
                
                $('#navlist li a').click(function(e) {
                    e.preventDefault();
                    var $this = $(this); fourSq.config.category = this.title;
                    $this.parent().siblings('li').find('a').removeClass('active');
                    $this.removeClass().addClass('active'); 
                    fourSq.getVenues(fourSq.config.category);
                });
            }
        };
        google.maps.event.addDomListener(window, 'load', fourSq.init); //loads maps when a new page loads


});