import sqlite3


class DdUserModel:
    def __init__(self, file_name):
        self.places_db = sqlite3.connect(file_name)
        self.places_cursor = self.places_db.cursor()

        self.places_cursor.execute("CREATE TABLE IF NOT EXISTS users (user_id, username, password)")
        self.places_cursor.execute("CREATE TABLE IF NOT EXISTS saved (user_id, saved)")
        self.places_cursor.execute("CREATE TABLE IF NOT EXISTS posted (user_id, posted)")

        self.places_db.commit()

    def add_new_user_row(self, row):
        self.places_cursor.execute("INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)",
                                   row)
        self.places_db.commit()

    def add_new_saved_row(self, row):
        self.places_cursor.execute("INSERT INTO saved (user_id, saved) VALUES (?, ?)",
                                   row)
        self.places_db.commit()

    def add_new_posted_row(self, row):
        self.places_cursor.execute("INSERT INTO posted (user_id, posted) VALUES (?, ?)",
                                   row)
        self.places_db.commit()

    def change_user_row(self, set, where):
        self.places_cursor.execute("""UPDATE users
                                   SET (username, password) = (?, ?)
                                   WHERE user_id = ?""",
                                   (set, where))

        self.places_db.commit()

    def change_posted_row(self, set, where):
        self.places_cursor.execute("""UPDATE posted
                                   SET posted = ?
                                   WHERE user_id = ?""",
                                   (set, where))

        print(set, where)
        self.places_db.commit()

    def change_saved_row(self, set, where):
        self.places_cursor.execute("""UPDATE saved
                                   SET saved = ?
                                   WHERE user_id = ?""",
                                   (set, where))

        self.places_db.commit()

    def read_table(self, name):
        self.places_cursor.execute("SELECT * FROM %s" % name)
        places_data = self.places_cursor.fetchall()
        return places_data

    def close_connections(self):
        self.places_cursor.close()
        self.places_db.close()


class DdMapsModel:
    def __init__(self, file_name):
        self.places_db = sqlite3.connect(file_name)
        self.places_cursor = self.places_db.cursor()

        self.places_cursor.execute("CREATE TABLE IF NOT EXISTS places (place_id, menu)")
        self.places_db.commit()

    def add_new_row(self, row):
        self.places_cursor.execute("INSERT INTO places (place_id, menu) VALUES (?, ?)", row)
        self.places_db.commit()

    def add_to_row(self, set, where):
        self.places_cursor.execute("""UPDATE places
                                   SET menu = ?
                                   WHERE place_id = ?""",
                                   (set, where))

        self.places_db.commit()

    def read_table(self):
        self.places_cursor.execute("SELECT * FROM places")
        places_data = self.places_cursor.fetchall()
        return places_data

    def close_connections(self):
        self.places_cursor.close()
        self.places_db.close()
