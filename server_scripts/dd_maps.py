"""
DD_BASIC:
A simple library used to edit db files, and do google map api requests
"""
import requests
import sqlite3


class MapAPI:
    def __init__(self, key):
        self.key = "&key=" + key
        self.static_nearby_places_locations = {}
        self.static_nearby_places_names = {}

    # THIS API ISN'T USED ANYMORE
    def get_user_loc(self, address):
        # get user's latitude and longitude based on their address
        baseurl_for_getting_location = "https://maps.googleapis.com/maps/api/geocode/json"
        addr = "?address=" + address
        loc_response = requests.get(baseurl_for_getting_location + addr + self.key).json()
        return loc_response['results'][0]['geometry']['location']

    def get_nearby_places_locations(self, user_location, mile_radius):
        # get radius
        meter_radius = mile_radius * 1609.34
        meter_radius = round(meter_radius)

        # location parameters
        location = "?location=" + user_location['lat'] + "," + user_location['lng']
        radius = "&radius=" + str(meter_radius)

        # find nearby places using api
        baseurl_for_getting_nearby_places = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        nearby_places_url = baseurl_for_getting_nearby_places + location + radius + "&opennow" + "&type=food" + self.key
        server_response = requests.get(nearby_places_url).json()['results']
        return server_response

    def sort_nearby_places_locations(self, nearby_places_list):
        # sorts LOCATIONS of areas
        # reset nearby places locations and nearby_places_names
        # THIS IS WHERE I FINNA FIXED THE RADIUS ERROR BOIS!
        self.static_nearby_places_locations = {}
        self.static_nearby_places_names = {}

        for place in nearby_places_list:
            self.static_nearby_places_locations[place['place_id']] = (place['geometry']['location']['lat'],
                                                                      place['geometry']['location']['lng'])

            self.static_nearby_places_names[place['place_id']] = place['name']
