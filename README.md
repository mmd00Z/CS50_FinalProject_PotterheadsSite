# **HarryPotter Fan & Shopping Site**

## Video Demo:
**https://youtu.be/IOOdtO6yHuY**

![image](https://github.com/mmd00Z/CS50_FinalProject_PotterheadsSite/assets/94078617/112b1c65-ca32-4c39-a975-2de3c994cbe5)


## Overview
This project is a website that introduces the Wizarding World to users and introduces them to Harry Potter books and movies. Also, Potterhead fans (Harry Potter fans) can buy their magic items from its store to start their magical adventure and step into the fantasy world and challenge technology with their imagination.

## Technologies
in Frontend: HTML, CSS, JS, Bootstrap (just for icon not styles)

in Backend: Python, Flask, SQLite

## Description
On your home page, you will be introduced to the magical world of Harry Potter and the entire story of Harry Potter. You will also be delighted to see the picture of the Hogwarts School of Witchcraft and Wizardry and read about the Hogwarts Houses and learn about the characteristics of each of the Gryffindor, Hufflepuff, Ravenclaw and Slytherin houses.

Users can create a new account and log in to their account, and for this an access control system has been implemented.

In addition to editing your profile information, you can choose your magic features through your dashboard. You can also enter your address in the address page to send your purchased orders.

On the books and movies page, you can see the collection of Harry Potter books and movies.
In order to shade the posters as well as the name of each book or movie, the color appropriate to the poster is considered, which is implemented manually, but in this project, a suitable color recognition system is implemented for each image.

You can see and buy different products from the store. For each product, the description and details that the admin entered through the admin dashboard when adding that product can be seen. This admin has the ability to edit the information and prices of each product completely and professionally.
Considering that each product can be sold with different features (color, size, etc.), each product has the ability to choose between different options, each of which can have its own unique price, discount, and stock quantity. The admin can enter all this information through the admin page.


## File Structure
- **Root** (PotterheadsSite)
    - **flask_session:** to save session and keep users loged in
    - **static**
        - **css**
        - **js**
        - **fonts**
        - **img:** the images that are used in the main pages of the site
        - **imgs_accepted_profile:** Profile pictures of users (named by UUID)
        - **imgs_products:** Product images (named by UUID)
        - **imgs_temp_uploaded:** To temporarily store the user's profile picture
    - **templates** <br>
    All html file for site pages including layout.html that contan header, footer and ...
    - **app.py** <br>
    The main code file of the web application that includes all the defined routes and handles user requests
    - **helpers.py:** helper functions used in app.py
    - **hp.db:** Site database that includes tables to store information about users, products, etc
    - **add_admin.py:** To manually add an admin


## Conclusion
HarryPotter Fan & Shopping Site is not just an online marketplace but a digital adventure that celebrates the magic of the Harry Potter universe. Step into this enchanting realm and experience the wizarding journey firsthand. Be part of the magic at HarryPotter Fan & Shopping Site!

## Developer
Developed by **Mohammad Reza Gholami**
©@mmd00Z
