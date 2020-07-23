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
	
	// these classes will be used to make posted/saved markers and hide/show them
	class SavedMarkers {
		constructor(places){
			// this is an array
			this.saved_places_markers = [];
		}
		
		create_marker(place_info){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
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
	
	// class for posted markers
	class SavedMarkers {
		constructor(places){
			// this is an array
			this.saved_places_markers = [];
		}
		
		create_marker(place_info){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
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
	
	// init classes
	saved_markers = new SavedMarkers()
	posted_markers = new PostedMarkers()
	
	// turn server response into string jinja2
	uname = {{username | tojson}};
	pword = {{password | tojson}};
	
	
	function uinfo_api_request(username, password){
		$.get('/api/dd_user/get_user_info', {username: username, password: password}, function(data, status){
			if(status == "success"){
				console.log("REQEST WORKED");
				saved = JSON.parse(JSON.parse(data).saved);
				posted = JSON.parse(JSON.parse(data).posted);
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
						place_data = saved_places_data[place.place_id]
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
			// get names and locations of places using google maps api 
			// THIS CODE IS IN PROGRESS (api documentation below)
			// https://developers.google.com/maps/documentation/javascript/places#place_details_requests
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
					request = {placeId: id,
										 fields: ['place_id', 'name', 'geometry']}
					
					service.getDetails(request, callback)	
				}
				function callback(place, status){
					if(status == google.maps.places.PlacesServiceStatus.OK){
						posted_places_data[place.place_id].location = place.geometry.location;
						posted_places_data[place.place_id].name = place.name;
					}
					
					else {
						document.write('API ERROR');
						console.log('API ERROR(error code 00x11xnmG)');
					}
				}
			}
			
			else {
				document.write('API ERROR');
				console.log('API ERROR(error code 00x11xnmG)');
			}
			// get names and locations of places using google maps api 
			// THIS CODE IS IN PROGRESS (api documentation below)
			// https://developers.google.com/maps/documentation/javascript/places#place_details_requests
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
		alert("show posted clicked");
	}
	
	// add event listeners
	document.getElementById("show_saved").addEventListener("click", show_saved);
	document.getElementById("show_posted").addEventListener("click", show_posted);
}