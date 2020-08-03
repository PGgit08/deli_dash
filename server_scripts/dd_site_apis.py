"""
CONTROL PROGRAM
"""

import json
import dd_maps
import dd_user
import dd_sql_managers
import hashlib


# class for dd_site so that it can use dd_Maps
class DdMapsClass:
    def __init__(self, key, file_name):

        # get api key, db file_name, and activate deli_dash_basic api
        self.key = key
        self.db_file = file_name
        self.map = dd_maps.MapAPI(key=self.key)

        # places data with database
        self.place_in_database_status = {}

        # menu so that last api function can work(this is dynamic because the last function changes this variable)
        self.dynamic_nearby_places_menus = {}

    def get_nearby_places_locations(self, user_loc, radius):
        # deli_dash_basic api sorts the nearby_places_info(sorts names, and locations
        self.map.sort_nearby_places_locations(self.map.get_nearby_places_locations(user_loc, radius))
        nearby_places_locations = self.map.static_nearby_places_locations
        return nearby_places_locations

    # api because it creates interface with deli_dash_basic program
    def get_nearby_places_menus(self, areas):

        # reads menus out of database, activates this api
        places_db = dd_sql_managers.DdMapsModel(self.db_file)
        nearby_places_menus = {}
        nearby_places_ids = []

        # ids are also made here
        for i in areas:
            # each place starts of with an empty menu
            nearby_places_menus[i] = json.dumps({})

            # id list append
            nearby_places_ids.append(i)

        # this goes through the database, the database only contains places WITH menus
        for place in places_db.read_table():
            # if the place(with menu) in the database is a nearby_places:
            if place[0] in nearby_places_ids:
                # then update it's menu value
                nearby_places_menus[place[0]] = place[1]

        # close db connections
        places_db.close_connections()

        # if a place in the menu has a value of "{}" then that means it isn't in the database, and
        # here is code that creates database statuses, for when menus are added
        for place_id in nearby_places_menus:
            if nearby_places_menus[place_id] == json.dumps({}):
                self.place_in_database_status[place_id] = False

            if nearby_places_menus[place_id] != json.dumps({}):
                self.place_in_database_status[place_id] = True

        # THIS IS THE SITE NEARBY PLACES VARIABLE, IT IS DYNAMIC DUE TO THE DELI_DASH_BASIC API(everything is ok)
        self.dynamic_nearby_places_menus = nearby_places_menus

        return nearby_places_menus, nearby_places_ids

    def get_nearby_places_data(self, uloc, rad):
        # call all information getting functions
        nearby_locations = self.get_nearby_places_locations(uloc, rad)
        nearby_menus = self.get_nearby_places_menus(nearby_locations)

        nearby_places_data = {}

        # form everything together
        for place_id in nearby_menus[1]:
            nearby_places_data[place_id] = {'name': self.map.static_nearby_places_names[place_id],
                                            'location': nearby_locations[place_id],
                                            'menu': nearby_menus[0][place_id]}

        return nearby_places_data

    # api because it creates interface with deli_dash_basic program
    def add_to_nearby_places_menus(self, place_id, item_and_price):
        places_db = dd_sql_managers.DdMapsModel(self.db_file)
        # item and price must be a dictionary
        # turn the place's menu into a dictionary
        # change the places menu, by adding items, and their prices, from the item_and_price dict
        place_menu = json.loads(self.dynamic_nearby_places_menus[place_id])
        for item in item_and_price:
            place_menu[item] = item_and_price[item]

        self.dynamic_nearby_places_menus[place_id] = json.dumps(place_menu)
        # now it must be checked, if the place_id is in the database, then the row of it will have it's menu updated
        # if the place_id isn't in the database, then a new row will be made with it
        # if the place has a menu in the database, then add to the row
        # if place doesn't have a menu in the database, then create a new row
        if self.place_in_database_status[place_id]:
            places_db.add_to_row(self.dynamic_nearby_places_menus[place_id], place_id)

        if not self.place_in_database_status[place_id]:
            places_db.add_new_row((place_id, self.dynamic_nearby_places_menus[place_id]))

        places_db.close_connections()

    def get_place_info_by_id(self, places_id):
        # this api will be used to find a places menu by it's id
        # if the place does not have a menu the function will return None
        # if it does then the function will return the menu
        places_db = dd_sql_managers.DdMapsModel(self.db_file)
        menus = {}

        for place_id in places_id:
            menus[place_id] = json.dumps({})

        for place in places_db.read_table():
            if place[0] in places_id:
                menus[place[0]] = place[1]

        return menus


"""
Basic class(DdUserClass) pretending that this class is a literal human, I give it it's own characteristics
these can be the username, password, if they even exist in the database what their database id is and this class
can kind of reproduce(create_user function) using it's own id
"""


# class for dd_site so that it can use dd_user
class DdUserClass:
    def __init__(self, username, password, file_name):
        # this calls the class we need from dd_user
        self.UHandler = dd_user.UserHandler(file_name)

        # theses are temporary variables that this user only has during their session
        # the username and passwords
        self.username = username
        self.password = password

        # user id's
        self.user_id = 0
        self.prev_user_id = 0

        # username and password exists booleans
        self.username_exists = False
        self.password_exists = False

    # so this class has to do 3 things:
    # find a user(get their info)
    # create a user
    # and add to a user

    def encode_password(self):
        hash = hashlib.md5()
        hash.update(bytes(self.password, 'utf-8'))
        self.password = hash.digest()

    def find_user(self):
        ustat = self.UHandler.find_user(self.username, self.password)
        existence = ustat[0]
        this_id = ustat[1]
        prev_id = ustat[2]

        # set parts of this class
        self.user_id = this_id
        self.prev_user_id = prev_id
        self.username_exists = existence[0]
        self.password_exists = existence[1]

    def create_user(self):
        # so when the user is created
        # first we need to make sure that this user doesn't exist already
        # and by "user" we mean username

        if self.username_exists:
            return "false"

        if not self.username_exists:
            self.UHandler.create_new_user(user_id=self.prev_user_id + 1, username=self.username, password=self.password)
            return "true"

    def get_user_info(self):
        if self.username_exists and self.password_exists:
            print("THIS USER DOES EXIST" + " @" + self.username + " @" + str(self.user_id))
            return self.UHandler.retrieve_user(self.user_id)

        else:
            return "false"

    def change_user(self, modify_item, modify_type, modification):
        # modify_item can be "posted" or "saved"
        # modify_type can be "add", "delete", "all"
        # modification is based on modify item see dd_user
        if modify_item == "posted":
            self.UHandler.change_posted(user_id=self.user_id, modification=modification, modify_type=modify_type)
