function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(redirect);
	} 
	else {
		document.write("Geolocation is not supported by this browser.");
	}
}

function redirect(position){
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	
	var loc_data = {"lat": lat, "lng": lng};
	var radius_dropdown = document.getElementById("radius");
	var chosen_radius = radius_dropdown.options[radius_dropdown.selectedIndex].value;
	// redirect
	window.location = "/nearby_search/map?user_loc=" + JSON.stringify(loc_data) + "&rad=" + chosen_radius;
}