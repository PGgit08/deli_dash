"""
DD_USER:
A more advanced library used to find users/edit user's data/create users

NOTE: right now this is just a prototype, this will probably use flask login later
"""
import dd_sql_managers
import json


class UserHandler:
    def __init__(self, edit_file):
        self.edit_file = edit_file

    def add_to_user(self, username, password, setval):
        pass

    def create_new_user(self, user_id, username, password):
        # here a new user will be created
        # it uses the dd_basic class
        users_db_con = dd_sql_managers.DdUserModel(file_name=self.edit_file)

        # add table rows
        users_db_con.add_new_user_row(row=(user_id, username, password))
        users_db_con.add_new_saved_row(row=(user_id, json.dumps(['ChIJTVvdAbj6xIkRD48qJODwotk'])))

        posted_things_HARDCODED = {'ChIJTVvdAbj6xIkRD48qJODwotk': {'cheese': '1.25'}}
        users_db_con.add_new_posted_row(row=(user_id, json.dumps(posted_things_HARDCODED)))

        users_db_con.close_connections()

    def find_user(self, username, password):
        # right the program will try to find the user
        # this function will return this:
        # [(if the username exists(boolean)), (if the password exists(boolean))]
        users_db_con = dd_sql_managers.DdUserModel(file_name=self.edit_file)
        users = users_db_con.read_table(name="users")

        # the two booleans for the password and username
        username_exists = False
        password_exists = False

        id = 0
        prev_user_id = 0

        # search for user
        for user in users:
            if user[1] == username:
                username_exists = True
                if user[2] == password:
                    password_exists = True
                    id = user[0]

                    if len(users) > 0:
                        prev_user_id = users[users.index(user) - 1][0]

                    if len(users) == 0:
                        prev_user_id = 0

                    print(prev_user_id)

                break

        users_db_con.close_connections()
        # return our boolean
        return (username_exists, password_exists), id, prev_user_id

    def retrieve_user(self, user_id):
        users_db_con = dd_sql_managers.DdUserModel(file_name=self.edit_file)

        posted_info = users_db_con.read_table(name="posted")
        saved_info = users_db_con.read_table(name="saved")

        saved = {}
        posted = {}

        for saved_items in saved_info:
            if saved_items[0] == user_id:
                saved = saved_items[1]
                break

        for posted_items in posted_info:
            if posted_items[0] == user_id:
                posted = posted_items[1]
                break

        response = {'saved': saved, 'posted': posted}
        return json.dumps(response)
