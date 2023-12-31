from cs50 import SQL
from werkzeug.security import check_password_hash, generate_password_hash
import datetime

db = SQL("sqlite:///hp.db")

name = input("Name: ")
username = input("Username: ")
password = input("Password: ")
phone_number = input("Phone number: ")

db.execute(
    "INSERT INTO admins (name, username, password, date_added, phone_number) VALUES (?, ?, ?, ?, ?);",
    name,
    username,
    generate_password_hash(password),
    datetime.datetime.now(),
    phone_number,
)
refrence_id = db.execute("SELECT id FROM admins WHERE username = ?;", username)[0]["id"]

db.execute(
    "INSERT INTO role_id (refrence_id, role) VALUES (?, ?);",
    refrence_id,
    "admin",
)

print("OK")
