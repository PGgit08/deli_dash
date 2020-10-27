document.getElementById("submit").addEventListener("click", function(){
			username = document.getElementById("username").value;
			password = document.getElementById("password").value;
			console.log(username, password);
			$.get("/api/dd_user/create_user", {'username': username, 'password': password}, function(data, status){
				if(status == "success"){
					if(data == "true"){
						window.location = "/login";
					}
					if(data == "false"){
						document.write("THIS ACCOUNT IS ALREADY BEING USED");
						console.log("this account is being used");
					}
				}
				else{
					document.write("API ERROR");
				}
				})});