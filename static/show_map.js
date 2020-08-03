function draw_map(){

	// gets users location and user's desired search radius
	var user_loc = window.user_loc;
	var search_radius = window.radius;

	var user_lat = user_loc['lat'];
	var user_lng = user_loc['lng'];

	// makes variables for temporary id and all nearby places data
	var nearby_places_data;
	var temporary_id;

	// function to add to a places menu to the server
	function add_to_nearby_places_menu(place_id, item_and_price){
			$.post("/api/dd_maps/modify_nearby_place_menu",
							{modify_type: "add",
							 place_id: place_id,
							 items_and_prices: item_and_price
							 },
							 function(data, status){
								console.log(status)
							 }
						 )
		}

	// add event listener to button
	document.getElementById("area_info").childNodes[7].addEventListener("click",
	// add new menu slot function
	function add_new_menu_slot(){
		var item_and_cost_input = document.createElement("input");
		var empty_space = document.createElement("BR");
		
		item_and_cost_input.type = "text";
		item_and_cost_input.value = "item: price";

		$("#add_menu_slots").append(item_and_cost_input);
		$("#add_menu_slots").append(empty_space);

	}	);

	// add event listener to submit added slots button
	document.getElementById("area_info").childNodes[9].addEventListener("click", function change_menu(){
		// right here this places menu will be changed in the menu dictionary and then it's menu will
		// be sent to the server api in the add_to_nearby_place_menu function
		added_items = document.getElementById("area_info").childNodes[5].childNodes;

		for(var i=0; i<added_items.length; i++){
			var IAP = added_items[i].value;
			IAP = IAP.split(":");
			var temp_menu = JSON.parse(nearby_places_data[temporary_id]['menu']);
			temp_menu[IAP[0]] = IAP[1];
			nearby_places_data[temporary_id]['menu'] = JSON.stringify(temp_menu);

			// update to server
			add_to_nearby_places_menu(temporary_id, nearby_places_data[temporary_id]['menu'])
		};
	})

	//fills up html menu
	function fill_html_menu(nearby_place_menu, name){
		//reset menu
		document.getElementById("menu").innerHTML = "";
		document.getElementById("name").innerHTML = name;
		document.getElementById("name").color = "white";

		for(var item in nearby_place_menu){
			//here the html menu gets filled up
			item_and_price = document.createElement("LI");
			item_and_price.innerHTML = item + ": " + nearby_place_menu[item];
			item_and_price.style.color = "white";

			$("#menu").append(item_and_price);

		}
	}

	//draw map, and handle nearby places info
	function handle_nearby_places(nearby_places_info){
		nearby_places_data = JSON.parse(nearby_places_info);

		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 13,
			center: new google.maps.LatLng(user_lat, user_lng),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		//HAS MENU ICON
		has_menu_icon = "";

		// marker making loop
		for (var place_id in nearby_places_data) {
			var place_loc = nearby_places_data[place_id]['location']

			// see if place has menu
			var menu_status = true;
			if(nearby_places_data[place_id]['menu'] == "{}"){
				menu_status = false;
			};

			// create marker
			var marker;

			if(menu_status == true){
					marker = new google.maps.Marker({
					position: new google.maps.LatLng(place_loc[0], place_loc[1]),
					map: map,
					icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
				});
			}

			if(menu_status == false){
					marker = new google.maps.Marker({
					position: new google.maps.LatLng(place_loc[0], place_loc[1]),
					map: map
				});
			}


			// add event listeners for markers
			google.maps.event.addListener(
				marker,
				'click',
				(function (i) {
					return function () {
						document.getElementById("add_menu_slots").innerHTML = "";
						temporary_id = i;
						var place_menu = nearby_places_data[i].menu;
						var place_name = nearby_places_data[i].name;
						place_menu = JSON.parse(place_menu);

						// fill html menu and enable add menu button
						$("#add_item").removeAttr("disabled");
						fill_html_menu(place_menu, place_name);

					}

				})(place_id)
			);
		};
	}


	// request for nearby_places api
	$.get("/api/dd_maps/get_nearby_places_data",
		{'lat': user_lat, 'lng': user_lng, 'radius': search_radius},
		function(data, status){
				console.log(search_radius);
				if(status == "success"){
					handle_nearby_places(data);
				}

				else{
					console.log("API ERROR");
					console.log(status);
				}
		}
	)
}