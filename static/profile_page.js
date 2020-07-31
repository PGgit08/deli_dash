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
	
	// temporary variables for deleting items
	var temp_id;
	
	// function for filling up html menu
	function fill_html_menu(nearby_place_menu, name, posted_items={}){
		// optional parameters
		// posted_items optional dict of THIS person's posted menu items
		
		// create object out of nearby_place_menu
		nearby_place_menu = JSON.parse(nearby_place_menu);
		
		//reset menu
		document.getElementById("menu").innerHTML = "";
		document.getElementById("name").innerHTML = "";
		document.getElementById("name").innerHTML = name;
		document.getElementById("name").color = "white";

		// if we want to add a [x] button we need to check if this is POSTED or SAVED
		
		if(Object.keys(posted_items).length == 0){
			// add [x] button to name of saved place
			place_name = document.getElementById("name");
		
			// create delete button 
			saved_x_button = document.createElement("Button");
			saved_x_button.classList.add("saved_deleteMe");
			saved_x_button.innerText = '[x]';
			
			place_name.appendChild(saved_x_button);
		}
		
		var posted_items_keys = Object.keys(posted_items);
		// go through menu items
		for(var item in nearby_place_menu){
			// here the html menu gets filled up
			item_and_price = document.createElement("LI");
			item_and_price.innerHTML = item + ":" + nearby_place_menu[item];
			item_and_price.id = item; 
			
			// checks if one of the menu items is an item that the user posted
			if(posted_items_keys.includes(item, 0)){
				item_and_price.style.color = "green";
				
				// create delete button
				posted_x_button = document.createElement("Button");
				posted_x_button.classList.add("posted_deleteMe");
				posted_x_button.innerText = '[x]';
				
				posted_x_button.id = posted_items_keys.indexOf(item);
				
				item_and_price.appendChild(posted_x_button);
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
		
		create_marker(place_info, del_id){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
			
			// set the temporary id for deleting 
			temp_id = del_id;
			google.maps.event.addListener(
				marker,
				'click',
				(function (i){
					return function(){
						fill_html_menu(i.menu, i.name);
					}
				})(place_info)
			);
				
			this.saved_places_markers.push(marker);
		}
		
		redraw(redraw_places_info){
			this.set_view(false);
			this.saved_places_markers = [];
			for(i in redraw_places_info){
				this.create_marker(redraw_places_info[i], i);
			}
			this.set_view(true);
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
	
		create_marker(place_info, del_id){
			var marker = new google.maps.Marker({
				map: map,
				title: place_info.name,
				position: place_info.location
			 });
			this.posted_places_markers.push(marker);
			
			temp_id = del_id;
			google.maps.event.addListener(
				marker,
				'click',
				(function (i){
					return function(){
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
		
		add(){
			// function in making progress
			console.log("FUNCTION IN MAKING PROGRESS");
		}
		
		remove(){
			//function in making progress
			console.log("FUNCTION IN MAKING PROGRESS");
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
						saved_markers.create_marker(place_data, place.place_id);
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
						posted_markers.create_marker(place_data, place.place_id);
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
	
	// add event listeners(some are in jquery while some are in regular js)
	document.getElementById("show_saved").addEventListener("click", show_saved);
	document.getElementById("show_posted").addEventListener("click", show_posted);
	
	// there were some class issues so i had to rewrite the jquery class event listener
	$(document).ready(function() {
    $(document).on('click', '.posted_deleteMe', function(){
				// this code over here removes the info from the client
				let temp_posted_items = posted_places_data[temp_id].posted;
				let temp_menu_items = JSON.parse(posted_places_data[temp_id].menu);
				
				let this_id = $(this).attr('id');
				
				// posted item and it's price
				let temp_posted_item = Object.keys(temp_posted_items)[this_id]; // get KEYNAME of item deleted
				let temp_posted_item_price = temp_posted_items[temp_posted_item]; // get PRICE of item deleted 
				
				// form item and it's price data
				let temp_posted_item_data = [temp_posted_item, temp_posted_item_price];
				
				// delete from both the menu and the posted objects
				for(i in temp_posted_items){
					if(i == temp_posted_item_data[0]){
						if(temp_posted_items[i] == temp_posted_item_data[1]){
							delete posted_places_data[temp_id].posted[i];
						}
					}
				}
				
				for(i in temp_menu_items){
					if(i == temp_posted_item_data[0]){
						// menu items have a " " in them so we need to strip them
						stripped_menu_item = temp_menu_items[i].replace(" ", "");
						if(stripped_menu_item == temp_posted_item_data[1]){
							delete temp_menu_items[i];
							posted_places_data[temp_id].menu = JSON.stringify(temp_menu_items);
						}
					}
				}
				
				// html magic
				$(this).parent().remove();
		});
		$(document).on('click', '.saved_deleteMe', function(){
				// there are three steps that will need to be done here
				// remove this saved place from the client array
				delete saved_places_data[temp_id];
				
				// remove this from the SavedMarkers .saved_markers list and redraw markers
				$(this).parent().text("<--REMOVED-->");
				saved_markers.redraw(saved_places_data);
				// tell the server to remove this

		})
	});
}
