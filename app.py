import os
from cs50 import SQL
from flask import (
    Flask,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
    jsonify,
)
from werkzeug.utils import secure_filename
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import (
    apology,
    extract_int_from_str,
    delete_redundant_files,
    compress_and_crop_image,
    compress_image,
    generate_unique_code,
    is_empty,
    is_valid_username,
    is_unique_username,
    is_unique_email,
    is_valid_email,
    is_valid_password,
    is_valid_phone,
    is_valid_birthday,
    get_role_and_id,
    check_username,
    check_email,
    generate_unique_numeric_id,
    delete_imgs,
    apply_discount,
    get_stock,
    remove_keys,
    is_valid_json,
    generate_product_url,
    get_cart_products,
)
import datetime
import shutil
import json

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["UPLOAD_FOLDER"] = "static/imgs_temp_uploaded"
app.config["PROFILE_IMAGE_FOLDER"] = "static/imgs_accepted_profile"
app.config["PRODUCT_IMGS"] = "static/imgs_products"
Session(app)

db = SQL("sqlite:///hp.db")


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


delete_redundant_files(app.config["UPLOAD_FOLDER"], 60 * 30)


@app.route("/")
def index():
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    return render_template(
        "index.html",
        showLogin=showLogin,
        showProfile=not showLogin,
        next="user_profile",
        style_class="",
        show_footer=True,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
    )


@app.route("/admin-login", methods=["GET", "POST"])
def admin_login():
    if "id" in session:
        return redirect("/")

    if request.method == "POST":
        session.clear()
        username = request.form.get("username")
        password = request.form.get("password")

        if not username:
            return apology("must provide username", 403)
        if not password:
            return apology("must provide password", 403)

        rows = db.execute("SELECT * FROM admins WHERE username = ?;", username)

        if (
            len(rows) != 1
            or rows[0]["username"] != username
            or not check_password_hash(rows[0]["password"], password)
        ):
            return apology("invalid username and/or password", 403)

        session["id"] = db.execute(
            "SELECT id FROM role_id WHERE refrence_id=? AND role=?;",
            rows[0]["id"],
            "admin",
        )[0]["id"]
        return redirect("/admin-dashboard")

    return render_template(
        "login_admin.html",
        showLogin=False,
        showProfile=False,
        show_footer=False,
        style_class="sign",
    )


@app.route("/employee-login", methods=["GET", "POST"])
def employee_login():
    if "id" in session:
        return redirect("/")

    if request.method == "POST":
        session.clear()
        username = request.form.get("username")
        password = request.form.get("password")

        if not username:
            return apology("must provide username", 403)
        if not password:
            return apology("must provide password", 403)

        rows = db.execute("SELECT * FROM employees WHERE usename = ?;", username)

        if (
            len(rows) != 1
            or rows[0]["username"] != username
            or not check_password_hash(rows[0]["password"], password)
        ):
            return apology("invalid username and/or password", 403)

        session["id"] = db.execute(
            "SELECT id FROM role_id WHERE refrence_id=? AND role=?;",
            rows[0]["id"],
            "employee",
        )[0]["id"]
        return redirect("/employee-dashboard")

    return render_template(
        "login_employee.html",
        showLogin=False,
        showProfile=False,
        show_footer=False,
        style_class="sign",
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    if "id" in session:
        return redirect("/")

    next_url = request.args.get("next")

    if request.method == "POST":
        session.clear()

        email_or_username = request.form.get("emailname")
        password = request.form.get("password")
        if is_empty(email_or_username):
            return apology("must provide an email or username", 403)
        if is_empty(password):
            return apology("must provide password", 403)

        rows_email = db.execute(
            "SELECT * FROM users WHERE email = ?;", email_or_username
        )
        rows_username = db.execute(
            "SELECT * FROM users WHERE username = ?;", email_or_username
        )

        if len(rows_email) == 1:
            if check_password_hash(rows_email[0]["password"], password):
                session["id"] = db.execute(
                    "SELECT id FROM role_id WHERE refrence_id=? AND role=?;",
                    rows_email[0]["id"],
                    "user",
                )[0]["id"]
                if next_url == "user_profile":
                    return redirect("/profiles/" + rows_email[0]["username"])
                if not next_url:
                    return redirect("/")
                return redirect("/" + next_url)
            return apology("invalid email and/or password", 403)

        elif len(rows_username) == 1:
            if check_password_hash(rows_username[0]["password"], password):
                session["id"] = db.execute(
                    "SELECT id FROM role_id WHERE refrence_id=? AND role=?;",
                    rows_username[0]["id"],
                    "user",
                )[0]["id"]
                if next_url == "user_profile":
                    return redirect("/profiles/" + rows_username[0]["username"])
                if not next_url:
                    return redirect("/")
                return redirect("/" + next_url)
            return apology("invalid email and/or password", 403)
        else:
            return apology("invalid email or username", 403)

    return render_template(
        "login.html",
        showLogin=False,
        showProfile=False,
        next=next_url,
        show_footer=False,
        style_class="sign",
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.route("/signup", methods=["GET", "POST"])
def register():
    if "id" in session:
        return redirect("/")

    next_url = request.args.get("next")

    if request.method == "POST":
        name = request.form.get("name")
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm = request.form.get("confirm")

        if is_empty(name):
            return apology("Give valid name")
        if is_empty(username) or not is_valid_username(username):
            return apology("Give valid username")
        if is_empty(email) or (not is_valid_email(email)):
            return apology("Give valid email")
        if is_empty(password) or is_empty(confirm):
            return apology("Give valid password")
        if password != confirm:
            return apology("Confirm password")

        if not is_unique_username(username, db):
            return apology("This username is already taken")

        if not is_unique_email(email, db):
            return apology("This email is already taken")

        try:
            db.execute(
                "INSERT INTO users (name, username, email, password, joining_date) VALUES (?, ?, ?, ?, ?);",
                name,
                username,
                email,
                generate_password_hash(password),
                datetime.datetime.now(),
            )
            refrence_id = db.execute(
                "SELECT id FROM users WHERE username = ?;", username
            )[0]["id"]
            db.execute(
                "INSERT INTO role_id (refrence_id, role) VALUES (?, ?);",
                refrence_id,
                "user",
            )
        except:
            return apology("Some things wrong")

        session["id"] = db.execute("SELECT max(id) as last_row_id FROM role_id")[0][
            "last_row_id"
        ]
        if next_url == "user_profile":
            return redirect("/profiles/" + username)
        return redirect("/")

    return render_template(
        "signup.html",
        showLogin=False,
        next=next_url,
        show_footer=False,
        style_class="sign",
    )


@app.route("/profiles/<username>")
def show_user_profile(username):
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            user = db.execute("SELECT * FROM users WHERE id=?;", refrence_id)[0]
            cart = get_cart_products(role, refrence_id, db)
            if user["username"] == username:
                (
                    showLogin,
                    header_name,
                    header_profile_image_path,
                    profile_path,
                ) = getHeaderValues()
                infos = {
                    "Name: ": user["name"],
                    "Username: ": user["username"],
                    "Email: ": user["email"],
                    "Password: ": 8 * "●",
                    "Phone: ": user["phone_number"],
                    "Join Date: ": user["joining_date"][:10],
                    "Birthday: ": user["birthday"],
                }

                profile_image_path = (
                    "../"
                    + app.config["PROFILE_IMAGE_FOLDER"]
                    + "/"
                    + user["profile"]
                    + ".png"
                    if user["profile"] != None and user["profile"] != ""
                    else url_for("static", filename="/img/default_profile.png")
                )
                return render_template(
                    "dashboard.html",
                    showLogin=showLogin,
                    showProfile=not showLogin,
                    show_footer=False,
                    show_cart=True,
                    generate_product_url=generate_product_url,
                    cart=cart,
                    json=json,
                    header_name=header_name,
                    profile_path=profile_path,
                    header_profile_image_path=profile_image_path,
                    profile_image_path=profile_image_path,
                    name=user["name"],
                    username=user["username"],
                    bio=user["biography"]
                    if (user["biography"] != None and user["biography"] != "")
                    else "I'm Potterhead!",
                    house=user["house"],
                    patronus=user["patronus"],
                    wand=user["wand"],
                    infos=infos,
                )
    return redirect("../login?next=user_profile")


@app.route("/getMagicalObjectImage")
def getMagicalObjectImage():
    q = request.args.get("q")
    answer = []
    if q == "house":
        answer = ["../static/img/house" + str(i) + ".png" for i in range(4)]
    elif q == "wand":
        answer = ["../static/img/wand" + str(i) + ".svg" for i in range(1, 13)]
    elif q == "patronus":
        answer = ["../static/img/animal" + str(i) + ".png" for i in range(1, 19)]

    return jsonify(answer)


@app.route("/setHouse", methods=["POST"])
def setHouse():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            data = request.get_json()
            int_data = extract_int_from_str(data["houseID"])
            if data["houseID"] == "Null":
                db.execute("UPDATE users SET house = NULL WHERE id=?;", refrence_id)
            elif int_data != None and 0 <= int_data < 4:
                db.execute(
                    "UPDATE users SET house = ? WHERE id=?;", int_data, refrence_id
                )
            return jsonify({"status": "OK"})
    else:
        return jsonify({"msg": "You should login"})


@app.route("/getHPWA", methods=["POST"])
def getHouse():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            hpwa = db.execute(
                "SELECT house,patronus,wand,profile FROM users WHERE id=?;", refrence_id
            )[0]
            return jsonify(
                {
                    "house_value": hpwa["house"],
                    "patronus_value": hpwa["patronus"],
                    "wand_value": hpwa["wand"],
                    "profile_value": hpwa["profile"],
                }
            )
    else:
        return jsonify({"msg": "You should login"})


@app.route("/setPatronus", methods=["POST"])
def setPatronus():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            data = request.get_json()
            int_data = extract_int_from_str(data["patronusID"])
            if data["patronusID"] == "Null":
                db.execute("UPDATE users SET patronus = NULL WHERE id=?;", refrence_id)
            elif int_data != None and 0 <= int_data < 18:
                db.execute(
                    "UPDATE users SET patronus = ? WHERE id=?;",
                    int_data + 1,
                    refrence_id,
                )
            return jsonify({"status": "OK"})
    else:
        return jsonify({"msg": "You should login"})


@app.route("/setWand", methods=["POST"])
def setWand():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            data = request.get_json()
            int_data = extract_int_from_str(data["wandID"])
            if data["wandID"] == "Null":
                db.execute("UPDATE users SET wand = NULL WHERE id=?;", refrence_id)
            elif int_data != None and 0 <= int_data < 12:
                db.execute(
                    "UPDATE users SET wand = ? WHERE id=?;", int_data + 1, refrence_id
                )
            return jsonify({"status": "OK"})
    else:
        return jsonify({"msg": "You should login"})


@app.route("/upload-profile-img", methods=["POST"])
def uploadProfileImg():
    if "id" in session:
        if "image" not in request.files:
            return "No file uploaded", 400

        file = request.files["image"]
        if file.filename == "":
            return "No file selected", 400

        if file:
            filename = generate_unique_code()
            compress_and_crop_image(
                file, app.config["UPLOAD_FOLDER"] + "/" + filename, (500, 500)
            )
            return filename
    return "error"


@app.route("/confirm-profile-img", methods=["POST"])
def confirmProfileImg():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            image_name = request.get_json()["image_name"]

            old_profile = db.execute(
                "SELECT profile FROM users WHERE id=?;", refrence_id
            )[0]["profile"]
            if old_profile:
                try:
                    os.remove(
                        app.config["PROFILE_IMAGE_FOLDER"] + "/" + old_profile + ".png"
                    )
                except OSError as e:
                    print(f"Error deleting the profile: {e}")

            if image_name == "Null":
                db.execute("UPDATE users SET profile = NULL WHERE id=?;", refrence_id)
            elif image_name != None:
                db.execute(
                    "UPDATE users SET profile = ? WHERE id=?;", image_name, refrence_id
                )
                shutil.copy(
                    app.config["UPLOAD_FOLDER"] + "/" + image_name + ".png",
                    app.config["PROFILE_IMAGE_FOLDER"],
                )
            return jsonify({"status": "OK"})
    else:
        return jsonify({"msg": "You should login"})


@app.route("/cancel-profile-img", methods=["POST"])
def cancelProfileImg():
    data = request.get_json()
    if "image_name" in data:
        try:
            os.remove(app.config["UPLOAD_FOLDER"] + "/" + data["image_name"] + ".png")
        except OSError as e:
            print(f"Error deleting the profile: {e}")
    return "OK", 200


@app.route("/getInfos", methods=["POST"])
def getInfos():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            user = db.execute("SELECT * FROM users WHERE id=?;", refrence_id)[0]
            infos = [
                {"key": "Name", "value": user["name"]},
                {"key": "Username", "value": user["username"]},
                {"key": "Email", "value": user["email"]},
                {"key": "Password", "value": ""},
                {
                    "key": "Phone",
                    "value": user["phone_number"]
                    if user["phone_number"] != None and user["phone_number"] != ""
                    else "",
                },
                {"key": "Join Date", "value": user["joining_date"][:10]},
                {
                    "key": "Birthday",
                    "value": user["birthday"] if user["birthday"] else "",
                },
                {
                    "key": "Bio",
                    "value": user["biography"]
                    if user["biography"] != None and user["biography"] != ""
                    else "I'm Potterhead!",
                },
            ]
            return jsonify(infos)
        elif role == "employee":
            employee_infos = db.execute(
                "SELECT name AS Name, username AS Username, phone_number AS Phone, password AS Password, date_added AS Joined FROM employees WHERE id = ?;",
                refrence_id,
            )[0]
            employee_infos["Password"] = 8 * "●"
            employee_infos["Joined"] = employee_infos["Joined"][:10]
            employee_infos_list = [
                {key: value for key, value in employee_infos.items()}
            ]
            return jsonify(employee_infos_list)
        elif role == "admin":
            admin_infos = db.execute(
                "SELECT name AS Name, username AS Username, phone_number AS Phone, password AS Password, date_added AS Joined FROM admins WHERE id = ?;",
                refrence_id,
            )[0]
            admin_infos["Password"] = 8 * "●"
            admin_infos["Joined"] = admin_infos["Joined"][:10]
            admin_infos_list = [{key: value} for key, value in admin_infos.items()]
            return jsonify(admin_infos_list)
    return jsonify({"msg": "login as user"}), 400


@app.route("/setInfos", methods=["POST"])
def setInfos():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        new_infos = request.get_json()
        if role == "user":
            last_username = db.execute(
                "SELECT username FROM users WHERE id=?;", refrence_id
            )[0]["username"]
            last_email = db.execute("SELECT email FROM users WHERE id=?;", refrence_id)[
                0
            ]["email"]
            if (
                is_empty(new_infos["name"])
                or is_empty(new_infos["username"])
                or is_empty(new_infos["email"])
                or (not is_valid_username(new_infos["username"]))
                or (not is_valid_email(new_infos["email"]))
                or (
                    (not is_valid_password(new_infos["password"]))
                    and (not is_empty(new_infos["password"]))
                )
                or (
                    (not is_valid_phone(new_infos["phone_number"]))
                    and (not is_empty(new_infos["phone_number"]))
                )
                or (
                    (not is_unique_username(new_infos["username"], db))
                    and last_username != new_infos["username"]
                )
                or (
                    (not is_unique_email(new_infos["email"], db))
                    and last_email != new_infos["email"]
                )
                or (
                    (not is_valid_birthday(new_infos["birthday"]))
                    and (not is_empty(new_infos["birthday"]))
                )
            ):
                return jsonify({"status": "Error"})
            for key, value in new_infos.items():
                if key == "password":
                    if is_empty(value):
                        continue
                    db.execute(
                        f"UPDATE users SET {key}=:value WHERE id=:user_id;",
                        value=generate_password_hash(value),
                        user_id=refrence_id,
                    )
                else:
                    db.execute(
                        f"UPDATE users SET {key}=:value WHERE id=:user_id;",
                        value=value,
                        user_id=refrence_id,
                    )
            return jsonify({"status": "OK"})
        elif role == "employee":
            last_username = db.execute(
                "SELECT username FROM employees WHERE id=?;", refrence_id
            )[0]["username"]
            if (
                is_empty(new_infos["name"])
                or is_empty(new_infos["username"])
                or (not is_valid_username(new_infos["username"]))
                or (
                    (not is_valid_password(new_infos["password"]))
                    and (not is_empty(new_infos["password"]))
                )
                or (
                    (not is_valid_phone(new_infos["phone_number"]))
                    and (not is_empty(new_infos["phone_number"]))
                )
                or (
                    (not is_unique_username(new_infos["username"], db))
                    and last_username != new_infos["username"]
                )
            ):
                return jsonify({"status": "Error"})
            for key, value in new_infos.items():
                if key == "password":
                    if is_empty(value):
                        continue
                    db.execute(
                        f"UPDATE employees SET {key}=:value WHERE id=:user_id;",
                        value=generate_password_hash(value),
                        user_id=refrence_id,
                    )
                else:
                    db.execute(
                        f"UPDATE employees SET {key}=:value WHERE id=:user_id;",
                        value=value,
                        user_id=refrence_id,
                    )
            return jsonify({"status": "OK"})
        elif role == "admin":
            last_username = db.execute(
                "SELECT username FROM admins WHERE id=?;", refrence_id
            )[0]["username"]
            if (
                is_empty(new_infos["name"])
                or is_empty(new_infos["username"])
                or (not is_valid_username(new_infos["username"]))
                or (
                    (not is_valid_password(new_infos["password"]))
                    and (not is_empty(new_infos["password"]))
                )
                or (
                    (not is_valid_phone(new_infos["phone_number"]))
                    and (not is_empty(new_infos["phone_number"]))
                )
                or (
                    (not is_unique_username(new_infos["username"], db))
                    and last_username != new_infos["username"]
                )
            ):
                return jsonify({"status": "Error"})
            for key, value in new_infos.items():
                if key == "password":
                    if is_empty(value):
                        continue
                    db.execute(
                        f"UPDATE admins SET {key}=:value WHERE id=:user_id;",
                        value=generate_password_hash(value),
                        user_id=refrence_id,
                    )
                else:
                    db.execute(
                        f"UPDATE admins SET {key}=:value WHERE id=:user_id;",
                        value=value,
                        user_id=refrence_id,
                    )
            return jsonify({"status": "OK"})
    return jsonify({"msg": "login as user"}), 400


@app.route("/checkUsername", methods=["POST"])
def checkUsername():
    return jsonify({"is_valid": check_username(request.get_json()["username"], db)})


@app.route("/checkEmail", methods=["POST"])
def checkEmail():
    return jsonify({"is_valid": check_email(request.get_json()["email"], db)})


@app.route("/admin-dashboard")
def admin_dashboard():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "admin":
            admin_infos = db.execute(
                "SELECT name AS Name, username AS Username, phone_number AS Phone, password AS Password, date_added AS Joined FROM admins WHERE id = ?;",
                refrence_id,
            )[0]
            admin_infos["Password"] = 8 * "●"
            admin_infos["Joined"] = admin_infos["Joined"][:10]
            (
                showLogin,
                header_name,
                header_profile_image_path,
                profile_path,
            ) = getHeaderValues()
            return render_template(
                "dashborad_admin_employee.html",
                showLogin=showLogin,
                showProfile=not showLogin,
                show_footer=False,
                header_name=header_name,
                profile_path=profile_path,
                header_profile_image_path=header_profile_image_path,
                infos=admin_infos,
            )
        else:
            return "Access denied", 403
    return "You should log in first", 401


@app.route("/generateNewProductID")
def generateNewProductID():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role in ["admin", "employee"]:
            return generate_unique_numeric_id(db, 8)
    return "error"


@app.route("/sendProductData", methods=["POST"])
def send_product_data():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role in ["admin", "employee"]:
            is_editing = request.form.get("editing")
            id = request.form.get("id")
            name = request.form.get("name")
            price = request.form.get("price")
            discount = request.form.get("discount")
            description = request.form.get("description")
            overview = request.form.get("overview")
            stock = request.form.get("stock")
            features = request.form.get("features")
            details = request.form.get("details")
            tags = request.form.get("tags")
            categories = request.form.get("categories")
            images = request.files.getlist("images")

            os.makedirs(app.config["PRODUCT_IMGS"], exist_ok=True)
            # Save the uploaded images
            saved_imgs_name = []
            for image in images:
                filename = generate_unique_code()
                save_path = os.path.join(app.config["PRODUCT_IMGS"], filename + ".png")
                image.save(save_path)
                saved_imgs_name.append(filename)

            if is_editing == "true":
                if not images:
                    db.execute(
                        "UPDATE products SET name=?, price=?, discount=?, stock=?, categories=?, overview=?, description=?, details=?, features=?, tags=? WHERE id = ?;",
                        name,
                        price,
                        discount,
                        stock,
                        categories,
                        overview,
                        description,
                        None if not is_valid_json(details) else details,
                        None if not is_valid_json(features) else features,
                        None if not is_valid_json(tags) else tags,
                        id,
                    )
                else:
                    last_images = json.loads(
                        db.execute("SELECT images FROM products WHERE id = ?", id)[0][
                            "images"
                        ]
                    )
                    delete_imgs(last_images)

                    db.execute(
                        "UPDATE products SET name=?, price=?, discount=?, stock=?, categories=?, overview=?, description=?, details=?, features=?, tags=?, images=? WHERE id = ?;",
                        name,
                        price,
                        discount,
                        stock,
                        categories,
                        overview,
                        description,
                        None if not is_valid_json(details) else details,
                        None if not is_valid_json(features) else features,
                        None if not is_valid_json(tags) else tags,
                        json.dumps(saved_imgs_name),
                        id,
                    )
            else:
                db.execute(
                    "INSERT INTO products (id, name, price, discount, stock, categories, overview, description, details, features, tags, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                    id,
                    name,
                    price,
                    discount,
                    stock,
                    categories,
                    overview,
                    description,
                    None if not is_valid_json(details) else details,
                    None if not is_valid_json(features) else features,
                    None if not is_valid_json(tags) else tags,
                    json.dumps(saved_imgs_name),
                )
            return "OK"
    return "error"


@app.route("/delete-product")
def delete_product():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role in ["admin", "employee"]:
            id = request.args.get("id")
            last_images = json.loads(
                db.execute("SELECT images FROM products WHERE id = ?", id)[0]["images"]
            )
            delete_imgs(last_images)
            db.execute("DELETE FROM products WHERE id = ?;", id)
            return "OK"
    return "error"


@app.route("/get-products")
def get_products():
    q = request.args.get("q")
    isSelectAll = True if request.args.get("selectAll") == "True" else False
    n_from, n_to = int(request.args.get("from")), int(request.args.get("to"))

    if isSelectAll:
        return jsonify(
            db.execute(
                "SELECT * FROM products LIMIT :limit OFFSET :offset",
                limit=n_to - n_from,
                offset=n_from,
            )
        )
    else:
        if n_to - n_from < 1:
            return "No result, The given range is wrong"
        # Modified query to use % around the search term for a partial match
        query_param = f"%{q}%"
        return jsonify(
            db.execute(
                "SELECT * FROM products WHERE id=:query OR name LIKE :query LIMIT :limit OFFSET :offset",
                query=query_param,
                limit=n_to - n_from,
                offset=n_from,
            )
        )


@app.route("/get-product-by-id")
def get_product_by_id():
    id = request.args.get("id")
    return jsonify(db.execute("SELECT * FROM products WHERE id=?", id)[0])


@app.route("/get-cart-products", methods=["POST"])
def send_cart_products():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        cart = get_cart_products(role, refrence_id, db)
        return jsonify(cart)


@app.route("/addComment", methods=["POST"])
def addComment():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == 'user':
            json_data = request.json
            print(json_data)
            db.execute(
                "INSERT INTO comments (user_id, product_id, comment, advantages, disadvantages, rate, time, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                refrence_id,
                int(json_data['product_id']),
                json_data['comment'],
                json_data['advantages'],
                json_data['disadvantages'],
                int(json_data['rate']),
                datetime.datetime.now(),
                None if json_data['parent_id'] == 'null' else int(json_data['parent_id']),
            )
        return 'OK'
    return 'Error'


@app.route("/shop")
def shop():
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    role, refrence_id = get_role_and_id(db)
    cart = get_cart_products(role, refrence_id, db)

    return render_template(
        "shop.html",
        cart=cart,
        generate_product_url=generate_product_url,
        show_search=True,
        show_cart=True if role == "user" else False,
        showLogin=showLogin,
        showProfile=not showLogin,
        show_footer=True,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
        json=json,
    )


@app.route("/product/<product_id>/<product_name>")
def product(product_id, product_name):
    role, refrence_id = get_role_and_id(db)
    cart = get_cart_products(role, refrence_id, db)
    product_data = db.execute("SELECT * FROM products WHERE id=?", product_id)[0]
    product_data["images"] = json.loads(product_data["images"])
    current_price = apply_discount(product_data["discount"], product_data["price"])
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()

    return render_template(
        "product_page.html",
        cart=cart,
        show_cart=True if role == "user" else False,
        generate_product_url=generate_product_url,
        showLogin=showLogin,
        showProfile=not showLogin,
        show_footer=True,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
        product_data=product_data,
        json=json,
        is_valid_json=is_valid_json,
        current_price=current_price,
    )


@app.route("/get-stock", methods=["POST"])
def get_product_stock():
    json_data = request.get_json()
    product_id = json_data.pop("id", None)
    if product_id is None:
        return "Error in product id"
    return get_stock(product_id, json_data, db)


@app.route("/add2cart", methods=["POST"])
def add2cart():
    if "id" in session:
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            json_data = request.get_json()
            product_id = json_data.pop("id", None)
            product_count = json_data.pop("count", None)
            if product_id is None:
                return jsonify({"msg": "Error in product id"})
            if product_count is None:
                return jsonify({"msg": "Error in product count"})

            stock_price = get_stock(product_id, json_data, db)[0]
            stock_price["current_price"] = apply_discount(
                "" if not "discount" in stock_price else stock_price["discount"],
                stock_price["price"],
            )
            product_stock = int(stock_price["stock"])
            if product_stock < product_count:
                return jsonify({"msg": "Error, It is not available with this quantity"})

            json_data["id"] = product_id
            cart = db.execute("SELECT cart FROM users WHERE id = ?;", refrence_id)[0][
                "cart"
            ]

            if not is_valid_json(cart):
                json_data["count"] = product_count
                db.execute(
                    "UPDATE users SET cart = ? WHERE id = ?;",
                    json.dumps([json_data]),
                    refrence_id,
                )
                cart = get_cart_products(role, refrence_id, db)
                return jsonify(
                    {
                        "msg": "OK, Product added to cart",
                        "total_count": cart["total_count"],
                        "total_amount": cart["total_amount"],
                        **stock_price,
                    }
                )

            elif json.dumps(json_data)[1:-1] in cart:
                print("it is already in cart")
                json_cart = json.loads(cart)
                for i in range(len(json_cart)):
                    is_found = True
                    for key in json_data.keys():
                        if not (
                            key in json_cart[i] and json_cart[i][key] == json_data[key]
                        ):
                            is_found = False
                    if not is_found:
                        continue
                    elif json_cart[i]["count"] + product_count > product_stock:
                        return jsonify({"msg": "Error, Out of stock"})
                    elif json_cart[i]["count"] + product_count < 1:
                        del json_cart[i]
                        db.execute(
                            "UPDATE users SET cart = ? WHERE id = ?;",
                            json.dumps(json_cart),
                            refrence_id,
                        )
                        cart = get_cart_products(role, refrence_id, db)
                        return jsonify(
                            {
                                "msg": "The product removed from your cart!",
                                "total_count": cart["total_count"],
                                "total_amount": cart["total_amount"],
                                **stock_price,
                            }
                        )
                    else:
                        json_cart[i]["count"] += product_count
                        is_last = (
                            True if json_cart[i]["count"] == product_stock else False
                        )
                        db.execute(
                            "UPDATE users SET cart = ? WHERE id = ?;",
                            json.dumps(json_cart),
                            refrence_id,
                        )
                        cart = get_cart_products(role, refrence_id, db)
                        return jsonify(
                            {
                                "is_last": is_last,
                                "msg": "OK, number of product increased"
                                if product_count > 0
                                else "OK, number of product decreased",
                                "total_count": cart["total_count"],
                                "total_amount": cart["total_amount"],
                                **stock_price,
                            }
                        )
            else:
                json_data["count"] = product_count
                json_cart = json.loads(cart)
                json_cart.append(json_data)
                db.execute(
                    "UPDATE users SET cart = ? WHERE id = ?;",
                    json.dumps(json_cart),
                    refrence_id,
                )
                cart = get_cart_products(role, refrence_id, db)
                return jsonify(
                    {
                        "msg": "OK, Product appended to cart",
                        "total_count": cart["total_count"],
                        "total_amount": cart["total_amount"],
                        **stock_price,
                    }
                )
        else:
            return jsonify({"msg": "Please login as user first"}), 401
    return jsonify({"msg": "Please login first"}), 401


@app.route("/checkout/cart")
def handel_cart_page():
    if "id" in session:
        (
            showLogin,
            header_name,
            header_profile_image_path,
            profile_path,
        ) = getHeaderValues()
        role, refrence_id = get_role_and_id(db)
        cart = get_cart_products(role, refrence_id, db)

        if role != "user":
            return redirect("../login?next=cart")

        return render_template(
            "cart.html",
            is_in_cart=True,
            cart=cart,
            generate_product_url=generate_product_url,
            show_search=True,
            show_cart=False,
            showLogin=showLogin,
            showProfile=not showLogin,
            show_footer=True,
            header_name=header_name,
            profile_path=profile_path,
            header_profile_image_path=header_profile_image_path,
            json=json,
        )
    return redirect("../login?next=cart")


@app.route("/my-address", methods=["GET", "POST"])
def address():
    if not "id" in session:
        return redirect("/")

    role, refrence_id = get_role_and_id(db)
    if role != "user":
        return redirect("../login?next=my-address")

    if request.method == "POST":
        json_address = request.json
        submit_mode = json_address.pop('submitMode')
        addresses = db.execute("SELECT address FROM users WHERE id = ?;", refrence_id)[0]["address"]

        if submit_mode == 'add':
            if not is_valid_json(addresses):
                print("add first address")
                db.execute(
                    "UPDATE users SET address = ? WHERE id = ?;",
                    json.dumps([json_address]), refrence_id)
            else:
                addresses = json.loads(addresses)
                addresses.append(json_address)
                db.execute(
                    "UPDATE users SET address = ? WHERE id = ?;",
                    json.dumps(addresses),
                    refrence_id,
                )
            return "The address added!"

        elif submit_mode == 'edit':
            print('edit')
            if not is_valid_json(addresses):
                return 'Error', 404
            edit_index = json_address.pop('editIndex')
            addresses = json.loads(addresses)
            if len(addresses) <= edit_index:
                return 'Error', 404
            addresses[edit_index] = json_address
            db.execute("UPDATE users SET address = ? WHERE id = ?;", json.dumps(addresses), refrence_id)
            return "Changes saved!"

        elif submit_mode == 'delete':
            print('delete')
            if not is_valid_json(addresses):
                return 'Error', 404
            delete_index = json_address.pop('deleteIndex')
            addresses = json.loads(addresses)
            if len(addresses) <= delete_index:
                return 'Error', 404
            addresses.pop(delete_index)
            db.execute("UPDATE users SET address = ? WHERE id = ?;", json.dumps(addresses), refrence_id)
            return "The address deleted!"
        return "OK"

    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    cart = get_cart_products(role, refrence_id, db)
    addresses = db.execute("SELECT address FROM users WHERE id = ?", refrence_id)[0][
        "address"
    ]
    addresses = [] if not is_valid_json(addresses) else json.loads(addresses)

    return render_template(
        "address.html",
        addresses=addresses,
        cart=cart,
        generate_product_url=generate_product_url,
        show_search=True,
        show_cart=True if role == "user" else False,
        showLogin=showLogin,
        showProfile=not showLogin,
        show_footer=True,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
        json=json,
    )


@app.route("/movies")
def movies():
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    movie_names = [
        "Philosophers Stone",
        "Chamber of Secrets",
        "Prisoner of Azkaban",
        "Goblet of Fire",
        "Order of The Phoenix",
        "Half Blood Prince",
        "Deathly Hallows (I)",
        "Deathly Hallows (II)",
    ]
    return render_template(
        "movies.html",
        showLogin=showLogin,
        showProfile=not showLogin,
        style_class="repeat-spells",
        show_footer=True,
        movies=movie_names,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
    )


@app.route("/books")
def books():
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    hp_book_names = [
        "Philosophers Stone",
        "Chamber of Secrets",
        "Prisoner of Azkaban",
        "Goblet of Fire",
        "Order of The Phoenix",
        "Half Blood Prince",
        "Deathly Hallows",
        "Cursed Child",
    ]
    fb_book_names = [
        "Fantastic Beasts and Where to Find Them",
        "Fantastic Beasts: The Crimes of Grindelwald",
        "Fantastic Beasts: The Secrets of Dumbledore",
    ]
    return render_template(
        "books.html",
        showLogin=showLogin,
        showProfile=not showLogin,
        style_class="repeat-spells",
        show_footer=True,
        hp_book_names=hp_book_names,
        fb_book_names=fb_book_names,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
    )


def getHeaderValues():
    showLogin, header_name, header_profile_image_path, profile_path = True, "", "", "#"
    if "id" in session:
        showLogin = False
        role, refrence_id = get_role_and_id(db)
        if role == "user":
            row = db.execute(
                "SELECT name, username, profile FROM users WHERE id = ?;", refrence_id
            )[0]
            header_name = row["name"]
            header_profile_image_path = (
                app.config["PROFILE_IMAGE_FOLDER"] + "/" + row["profile"] + ".png"
                if row["profile"] is not None
                else "/static/img/default_profile.png"
            )
            profile_path = "/profiles/" + row["username"]
        elif role == "employee":
            header_name = db.execute(
                "SELECT name FROM employees WHERE id = ?;", refrence_id
            )[0]["name"]
            header_profile_image_path, profile_path = (
                url_for("static", filename="img/employee.png"),
                "/employee-dashboard",
            )
        elif role == "admin":
            header_name = db.execute(
                "SELECT name FROM admins WHERE id = ?;", refrence_id
            )[0]["name"]
            header_profile_image_path, profile_path = (
                url_for("static", filename="img/admin.png"),
                "/admin-dashboard",
            )
    return showLogin, header_name, header_profile_image_path, profile_path


@app.route("/about")
def about():
    showLogin, header_name, header_profile_image_path, profile_path = getHeaderValues()
    return render_template(
        "about.html",
        showLogin=showLogin,
        showProfile=not showLogin,
        next="user_profile",
        style_class="",
        show_footer=True,
        header_name=header_name,
        profile_path=profile_path,
        header_profile_image_path=header_profile_image_path,
    )
