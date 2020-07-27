function draw_map(){
	// username and password vars
	var uname;
	var pword;
	
	// vars for saved and posted data
	var saved;
	var posted;
	var posted_Place_ids;
	
	// vars for saved and posted PLACES data
	var saved_places_data = {};
	var posted_places_data = {};
	
	// create map
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 3,
		center: new google.maps.LatLng(0, 0),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	// map service for getting place data javascript
	service = new google.maps.places.PlacesService(map);
	
	// function for filling up html menu
	function fill_html_menu(nearby_place_menu, name, posted_items={}){
		// create object out of nearby_place_menu
		nearby_place_menu = JSON.parse(nearby_place_menu);
		
		//reset menu
		document.getElementById("menu").innerHTML = "";
		document.getElementById("name").innerHTML = name;
		document.getElementById("name").color = "white";

		for(var item in nearby_place_menu){
			// here the html menu gets filled up
			item_and_price = document.createElement("LI");
			item_and_price.innerHTML = item + ": " + nearby_place_menu[item];
			
			// checks if one of the menu items is an item that the user posted
			console.log(item);
			if(Object.keys(posted_items).includes(item, 0)){
				alert("HIII");
				item_and_price.style.color = "green";
			}
			
			else {
				item_and_price.style.color = "white";
			}

			$("#menu").append(item_and_price);

		}
	}
	
	// these classes will be used to make posted/saved markers and hide/show them
	class SavedMarkers {
		constructor(){
			// this is an array
			this.saved_places_markers = [];
		}
		
		create_marker(place_info){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
			 
			google.maps.event.addListener(
				marker,
				'click',
				(function (i){
					return function(){
						alert("MARKER CLICKED");
						fill_html_menu(i.menu, i.name);
					}
				})(place_info)
			);
				
			this.saved_places_markers.push(marker);
		}
		
		set_view(visible){
			for(var i in this.saved_places_markers){
				this.saved_places_markers[i].setVisible(visible);
			}
		}
		
		get_view(){
			for(var i in this.saved_places_markers){
				var view = this.saved_places_markers[i]
				view = view.getVisible();
					
				if(view == false){
					return false;
					break;
				}
				
				if(view == true){
					return true;
					break;
				}
			}
		}
	}

	// posted markers class
	class PostedMarkers {
		constructor(){
			// this is an array
			this.posted_places_markers = [];
		}
		
		create_marker(place_info){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
			this.posted_places_markers.push(marker);
			
			google.maps.event.addListener(
				marker,
				'click',
				(function (i){
					return function(){
						alert("MARKER CLICKED");
						fill_html_menu(i.menu, i.name, i.posted);
					}
				})(place_info)
			);
		}
		
		set_view(visible){
			for(var i in this.posted_places_markers){
				this.posted_places_markers[i].setVisible(visible);
			}
		}
		
		get_view(){
			for(var i in this.posted_places_markers){
				var view = this.posted_places_markers[i]
				view = view.getVisible();
					
				if(view == false){
					return false;
					break;
				}
				
				if(view == true){
					return true;
					break;
				}
			}
		}
	}
	
	
	// init classes
	saved_markers = new SavedMarkers();
	posted_markers = new PostedMarkers();
	
	// Becuase of some errors the html file will create these jinja variables for use
	// So we do not need to use jinja here
	uname = window.username;
	pword = window.password;
	
	
	function uinfo_api_request(username, password){
		$.get('/api/dd_user/get_user_info', {username: username, password: password}, function(data, status){
			if(status == "success"){
				console.log("REQEST WORKED");
				
				user_data = JSON.parse(data);
				saved = JSON.parse(user_data.saved);
				posted = JSON.parse(user_data.posted);
				posted_Place_ids = Object.keys(posted);
				load_saved(saved);
				load_posted(posted_Place_ids);
			}
			
			else {
				document.write('API ERROR');
				console.log('API ERROR(error code 00x11xnmG)');
			}
		});
	}
	
	// load saved and posted functions
	function load_saved(saved){
		$.post("/api/dd_maps/get_places_info_by_ids", {ids: JSON.stringify(saved)}, 
		function(data, status){
			if (status == "success"){
				menus = JSON.parse(data);
				// put menus into dictionary
				for(i in saved){
					id = saved[i];
					saved_places_data[id] = {"menu": menus[id], 
																	 "location": {},
																	 "name": ""};
					request = {placeId: id,
										 fields: ['place_id', 'name', 'geometry']}
					
					service.getDetails(request, callback)

				}
				function callback(place, status){
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						saved_places_data[place.place_id].location = place.geometry.location;
						saved_places_data[place.place_id].name = place.name;
						
						// here we use the saved_markers class to make a marker
						place_data = saved_places_data[place.place_id];
						saved_markers.create_marker(place_data);
						saved_markers.set_view(false);
					}
					else{
						console.log("GOOGLE MAPS ERROR (error: XLKO)");
					}
				}
			}
			
			else {
				document.write('API ERROR');
				console.log('API ERROR(error code 00x11xnmG)');
			}
		}
	)};
	
	function load_posted(posted_Place_ids){
		$.post("/api/dd_maps/get_places_info_by_ids", {ids: JSON.stringify(posted_Place_ids)}, 
		function(data, status){
			if (status == "success"){
				menus = JSON.parse(data);
				// put menus into dictionary
				for(id in posted){
					posted_places_data[id] = {"menu": menus[id], 
																		"location": {},
																		"name": "",
																		"posted": posted[id]};
					// right here the posted would look like this: {random_menu_item, random_price}
					request = {placeId: id,
										 fields: ['place_id', 'name', 'geometry']}
					
					service.getDetails(request, callback)	
				}
				function callback(place, status){
					if(status == google.maps.places.PlacesServiceStatus.OK){
						posted_places_data[place.place_id].location = place.geometry.location;
						posted_places_data[place.place_id].name = place.name;
						
						// here we will use the PostedMarkers class to create markers
						place_data = posted_places_data[place.place_id];
						posted_markers.create_marker(place_data);
						posted_markers.set_view(false);
					}
					
					else {
						console.log("GOOGLE MAPS API ERROR (error: XLKO)");
					}
				}
			}
			
			else {
				document.write('API ERROR');
				console.log('API ERROR(error code 00x11xnmG)');
			}
		});
	}
	
	// do server request to get user info and load it
	uinfo_api_request(uname, pword);
	
	// toggle functions
	function show_saved(){
		view = saved_markers.get_view();
		
		if(view == false){
			saved_markers.set_view(true);
		}
		
		if(view == true){
			saved_markers.set_view(false);
		}
	}
	
	function show_posted(){
		view = posted_markers.get_view();
		
		if(view == false){
			posted_markers.set_view(true);
		}
		
		if(view == true){
			posted_markers.set_view(false);
		}
	}
	
	// add event listeners
	document.getElementById("show_saved").addEventListener("click", show_saved);
	document.getElementById("show_posted").addEventListener("click", show_posted);
}