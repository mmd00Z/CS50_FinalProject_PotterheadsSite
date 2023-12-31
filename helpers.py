import os
import requests
import urllib.parse
from flask import redirect, render_template, request, session, url_for, jsonify
from functools import wraps
import re
from PIL import Image
import uuid
import time
import threading
from functools import partial
from datetime import datetime
import random
import urllib.parse
import json


def get_stock(product_id, data, db):
    product_data = db.execute("SELECT price, discount, stock, features FROM products WHERE id=?", product_id)[0]

    if not is_valid_json(product_data["features"]):
        return {"price": product_data["price"], "discount": product_data["discount"], "stock": product_data["stock"]}, 200

    features = json.loads(product_data["features"])
    del features["options"]

    for option_key, option_value in features.items():
        is_found = True
        for key, value in data.items():
            if option_value[key] != value:
                is_found = False
        if is_found:
            if option_key == 'default':
                option_value = {"price": product_data["price"], "discount": product_data["discount"], "stock": product_data["stock"]}
            return remove_keys(option_value, data.keys()), 200
    return {"stock": 0}, 200


def get_cart_products(role, refrence_id, db):
    if role == 'user':
        total_amount = 0
        total_count = 0
        product_prices = 0
        cart_products = db.execute("SELECT cart FROM users WHERE id = ?", refrence_id)[0]['cart']
        if not is_valid_json(cart_products):
            return []
        cart_products = json.loads(cart_products)
        for i in range(len(cart_products)):
            p_id = cart_products[i].pop('id')
            p_count = cart_products[i].pop('count')

            p_data = db.execute("SELECT name, images FROM products WHERE id = ?", p_id)[0]
            selected_features = cart_products[i]
            price_data = get_stock(p_id, selected_features, db)[0]
            if not "discount" in price_data:
                price_data["discount"] = ''
            current_price = apply_discount(price_data["discount"], price_data["price"])
            total_amount += current_price * p_count
            product_prices += int(price_data["price"])*p_count
            total_count += p_count
            cart_products[i] = {'id': p_id, 'name': p_data['name'], 'image': json.loads(p_data["images"])[0], 'features': selected_features, 'current_price': current_price*p_count, 'discount': apply_count_to_discount(price_data["discount"], p_count), 'price': int(price_data["price"])*p_count, 'stock': float(price_data["stock"]), 'count': p_count}
        cart = {'total_amount': total_amount, 'product_prices': product_prices, 'total_count': total_count, 'cart_products': cart_products}
        return cart
    return []


def remove_keys(d, keys):
    return {k: v for k, v in d.items() if k not in keys}


def apply_discount(discount, price):
    price = float(price)
    if discount == '' or discount is None:
        return price
    elif discount.endswith('%'):
        discount_amount = float(discount[:-1]) / 100
        current_price = price - (price * discount_amount)
        return current_price
    elif discount.endswith('$'):
        discount_amount = float(discount[:-1])
        current_price = price - discount_amount
        return current_price
    else:
        raise ValueError("Invalid discount format. Please use either '%' or '$' at the end.")


def apply_count_to_discount(discount, count):
    if discount.endswith('$'):
        discount_amount = float(discount[:-1])
        return str(discount_amount * count) + '$'
    return discount

def is_valid_json(input_string):
    if not input_string:
        return False
    try:
        json.loads(input_string)
        return True
    except json.JSONDecodeError:
        return False

def delete_imgs(imgs_name):
    print(imgs_name)
    for i in range(len(imgs_name)):
        file_path = "static/imgs_products/" + imgs_name[i] + ".png"
        print(file_path)
        try:
            os.remove(file_path)
            print(f"File '{file_path}' deleted successfully.")
        except FileNotFoundError:
            print(f"File '{file_path}' not found.")
        except Exception as e:
            print(f"An error occurred: {e}")


def generate_product_url(id, product_name):
    encoded_product_name = urllib.parse.quote(product_name)
    readable_url = encoded_product_name.replace('%20', '-')
    return url_for('product', product_id=id, product_name=readable_url)


def extract_product_name_from_url(url):
    parts = url.split("/")
    last_part = parts[-1]
    decoded_product_name = urllib.parse.unquote(last_part.replace("-", " "))
    return decoded_product_name


def generate_unique_numeric_id(db, length):
    while True:
        unique_id = "".join(random.choices("0123456789", k=length))
        result = db.execute(
            "SELECT COUNT(*) FROM products WHERE id = :id", id=unique_id
        )
        if result[0]["COUNT(*)"] == 0:
            return unique_id


def get_role_and_id(db):
    user = db.execute(
        "SELECT refrence_id, role FROM role_id WHERE id=?;", session["id"]
    )[0]
    return user["role"], user["refrence_id"]


def check_username(new_username, db):
    last_username = ""
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            last_username = db.execute(
                "SELECT username FROM users WHERE id=?;", refrence_id
            )[0]["username"]
        elif role == "employee":
            last_username = db.execute(
                "SELECT username FROM employees WHERE id=?;", refrence_id
            )[0]["username"]
        elif role == "admin":
            last_username = db.execute(
                "SELECT username FROM admins WHERE id=?;", refrence_id
            )[0]["username"]

    if last_username != new_username and (
        is_empty(new_username) or not is_unique_username(new_username, db)
    ):
        return False
    return True


def check_email(new_email, db):
    last_email = ""
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            last_email = db.execute("SELECT email FROM users WHERE id=?;", refrence_id)[
                0
            ]["email"]

    if last_email != new_email and (
        is_empty(new_email) or not is_unique_email(new_email, db)
    ):
        return False
    return True


def is_valid_birthday(birthday):
    try:
        datetime.strptime(birthday, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def is_empty(text):
    return text.strip() == ""  # Checks if name is empty or contains only spaces


def is_valid_username(username):
    pattern = r"^[a-zA-Z0-9_-]+$"
    return bool(re.match(pattern, username))


def is_unique_username(username, db):
    return (
        True
        if db.execute("SELECT COUNT(*) from users WHERE username=?;", username)[0][
            "COUNT(*)"
        ]
        == 0
        else False
    )


def is_unique_email(email, db):
    return (
        True
        if db.execute("SELECT COUNT(*) from users WHERE email=?;", email)[0]["COUNT(*)"]
        == 0
        else False
    )


def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


def is_valid_password(password):
    return bool(re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", password))


def is_valid_phone(phone_number):
    pattern = r"^\+?[\d\- ]+$"
    return bool(re.match(pattern, phone_number))


def apology(message, code=400):
    """Render message as an apology to user."""

    def escape(s):
        """
        Escape special characters.
        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [
            ("-", "--"),
            (" ", "-"),
            ("_", "__"),
            ("?", "~q"),
            ("%", "~p"),
            ("#", "~h"),
            ("/", "~s"),
            ('"', "''"),
        ]:
            s = s.replace(old, new)
        return s

    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


def extract_int_from_str(string):
    match = re.search(r"\d+", string)
    return int(match.group()) if match else None


def compress_and_crop_image(image_path, save_path, size):
    # Open the image file
    image = Image.open(image_path)
    # Resize the image while maintaining aspect ratio
    image.thumbnail(size)
    # Create a square crop
    width, height = image.size
    if width > height:
        left = (width - height) / 2
        right = left + height
        top, bottom = 0, height
    else:
        top = (height - width) / 2
        bottom = top + width
        left, right = 0, width

    image = image.crop((left, top, right, bottom))
    # Convert the image format to PNG
    image = image.convert("RGB")
    # Save the compressed and cropped image as PNG
    image.save(save_path + ".png", optimize=True, quality=85)


def compress_image(input_path, output_path, quality=85):
    """
    Compresses an image and saves it to the specified output path.
    :param input_path: The path to the input image.
    :param output_path: The path to save the compressed image.
    :param quality: The quality of the compressed image (0-100). Default is 85.
    """
    try:
        image = Image.open(input_path)
        # Convert the image format to PNG
        image = image.convert("RGB")
        image.save(output_path, optimize=True, quality=quality)
        print("Image compressed and saved successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")


def generate_unique_code():
    return str(uuid.uuid4()).replace("-", "")


def delete_redundant_files(folder, approval_time):
    for file_name in os.listdir(folder):
        file_path = os.path.join(folder, file_name)
        if os.path.isfile(file_path):
            # Check if the file is older than the approval time
            current_time = time.time()
            file_mod_time = os.path.getmtime(file_path)
            file_create_time = os.path.getctime(file_path)

            if (current_time - file_mod_time > approval_time) or (
                current_time - file_create_time > approval_time
            ):
                os.remove(file_path)

    # Schedule the next execution of the function after the specified approval_time
    threading.Timer(
        approval_time, partial(delete_redundant_files, folder, approval_time)
    ).start()
