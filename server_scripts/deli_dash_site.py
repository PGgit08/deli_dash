"""
This is just a prototype for the actual deli_dash site
"""

from flask import Flask, render_template, request, redirect
from dd_site_apis import *


site = Flask(__name__, template_folder="C:\\Users\\peter\\Desktop\\Deli_Dash\\templates",
             static_url_path='/static',
             static_folder='C:\\Users\\peter\\Desktop\\Deli_Dash\\static')

# =================================== API ENDPOINTS ===================================
"""
These links run the APIS based on the request bodies
"""

# activate API's
# (note: these arent exactly api's because they are just classes that call functions from other programs)
dd_maps_con = DdMapsClass(key="AIzaSyDGb61LgcVHDtga1yeKrcPOvnVInCtr3ms",
                          file_name="C:\\Users\\peter\\Desktop\\Deli_Dash\\databases\\places.db")
dd_user_con = DdUserClass(username='', password='',
                          file_name="C:\\Users\\peter\\Desktop\\Deli_Dash\\databases\\users.db")


# ------------------------- API ENDPOINTS----------------------------
# api because it creates interface with deli_dash_basic program
@site.route('/api/dd_maps/get_nearby_places_data', methods=["GET"])
def return_nearby_places_data():
    # parameters needed here -- users lat and lng
    # here all info about nearby places will be get
    # only the user_loc parameters are needed
    # thanks to my API

    # get radius
    rad = float(request.args.get("radius"))

    # get parameters
    user_lat = request.args.get("lat")
    user_lng = request.args.get("lng")

    # get all nearby places data
    nearby_places_data = dd_maps_con.get_nearby_places_data({'lat': user_lat, 'lng': user_lng}, rad)

    # dump the data from api to make the client read it normally and shit
    return json.dumps(nearby_places_data)


@site.route('/api/dd_maps/modify_nearby_place_menu', methods=["POST"])
def modify_nearby_place_menu():
    # parameters needed here - place_id, and item_to_add
    modify_type = request.form["modify_type"]
    add_place = request.form["place_id"]
    add_items = request.form["items_and_prices"]

    if modify_type == "add":
        # right here an api function will be called
        dd_maps_con.add_to_nearby_places_menus(add_place, json.loads(add_items))

    return "API HAS PROCESSED REQUEST"


@site.route('/api/dd_maps/get_places_info_by_ids', methods=["POST"])
def return_place_info_by_id():
    ids = request.form['ids']

    ids = json.loads(ids)
    menu = dd_maps_con.get_place_info_by_id(ids)
    return json.dumps(menu)

# ------------------------- DDUSER API'S ----------------------------


@site.route('/api/dd_user/get_user_info')
def return_user_info():
    username = request.args.get('username')
    password = request.args.get('password')

    # RESET CREDENTIALS
    dd_user_con.username = username
    dd_user_con.password = password

    # REHASH
    dd_user_con.encode_password()

    # FIND THIS USER
    dd_user_con.find_user()

    return dd_user_con.get_user_info()


@site.route('/api/dd_user/create_user')
def create_user():
    username = request.args.get('username')
    password = request.args.get('password')

    # RESET CREDENTIALS
    dd_user_con.username = username
    dd_user_con.password = password

    # REHASH
    dd_user_con.encode_password()

    # FIND USER
    dd_user_con.find_user()

    return dd_user_con.create_user()


@site.route('/api/dd_user/modify_posted_data', methods=['POST'])
def modify_user():
    """
    Two modification methods:
    'add'
    'delete'
    """

    # reset credentials
    dd_user_con.username = request.form['username']
    dd_user_con.password = request.form['password']

    # Hash
    dd_user_con.encode_password()

    # Find User
    dd_user_con.find_user()

    modification_type = request.form['mod_type']
    modification = request.form['modification']
    pid = request.form['pid']

    if modification_type == "add":
        dd_user_con.add_to_posted(pid, modification)

    if modification_type == "delete":
        dd_user_con.delete_from_posted(pid, modification)

    return "API IN PROGRESS"


# ====================================== GUI =====================================
@site.route('/')
def send_to_login():
    return redirect(location='/nearby_search', code=302)


@site.route('/login')
def login():
    return render_template('log_in.html')


@site.route('/create_user')
def create_new_user():
    return render_template('create_user.html')


@site.route('/profile', methods=["GET", "POST"])
def user_profile():
    username = request.form['username']
    password = request.form['password']

    if username == None or password == None:
        return "Please Make Sure That You Entered Your Username And Password, to login go to localhost/login"

    return render_template('profile_page.html', username=username, password=password)


@site.route('/nearby_search')
def get_user_address():
    return render_template('input_radius.html')


@site.route('/nearby_search/map', methods=["GET", "POST"])
def display_map_with_nearby_locations():
    user_loc = request.args.get("user_loc")
    radius = request.args.get("rad")
    # right here there will be jinja that will send the request body to the html client
    return render_template('show_map.html', user_loc=user_loc, radius=radius)


# run site on port 80 and have debugger on
site.run('localhost', 80, True)
