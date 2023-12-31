const ID = parseInt(document.getElementById('id').innerText)
const biggerImgs = document.getElementsByClassName('bigger-img');
const productImgOverlays = document.getElementsByClassName('product-img-overlay');
const imgsSliderContainer = document.querySelector('.imgs-slider-container');
const productImgs = document.querySelectorAll('.product-img');
const btnNext = document.getElementById('next');
const btnPrev = document.getElementById('prev');
const inputCount = document.getElementById('count');
const selectItems = document.querySelectorAll('.select-item');
const btnAdd2Cart = document.getElementById('btn-add2cart');
const btnSendComment = document.getElementById('btn-send-comment');

let currentImgIndex = 0;
let isMagnifierVisible = false;
let shouldMagnifierVisible = true;

const stars = document.querySelectorAll('.star');
let rate = 0;

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        rate = index + 1;
        for (let i = 0; i < stars.length; i++) {
            if(i < rate) {
                stars[i].classList.remove('bi-star');
                stars[i].classList.add('bi-star-fill');
            } else {
                stars[i].classList.remove('bi-star-fill');
                stars[i].classList.add('bi-star');
            }
        }
    });
    star.addEventListener('mouseover', () => {
        for (let i = 0; i < stars.length; i++) {
            if(i <= index) {
                stars[i].classList.remove('bi-star');
                stars[i].classList.add('bi-star-fill');
            } else {
                stars[i].classList.remove('bi-star-fill');
                stars[i].classList.add('bi-star');
            }
        }
    });
    star.addEventListener('mouseleave', () => {
        for (let i = 0; i < stars.length; i++) {
            if(i < rate) {
                stars[i].classList.remove('bi-star');
                stars[i].classList.add('bi-star-fill');
            } else {
                stars[i].classList.remove('bi-star-fill');
                stars[i].classList.add('bi-star');
            }
        }
    });
});

btnSendComment.addEventListener("click", function() {
    let formData = new FormData(document.getElementById("comment-form"));

    formData.append("product_id", ID);
    formData.append("rate", rate);
    formData.append("parent_id", null);

    let jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch("/addComment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});



btnAdd2Cart.addEventListener('click', () => {
    const selectdItems = document.querySelectorAll('.selected');
    let jsonOptions = { "id": ID, "count": parseInt(inputCount.value)};
    selectdItems.forEach(item => {
        jsonOptions[item.classList[1]] = item.id;
    });
    fetch('../../../add2cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonOptions)
    })
        .then(response => {
            console.log(response);
            updateCart();
            showCart();
            isCartVisible = true;
        })
        .catch(error => console.error('Error:', error));
});

function checkAvailability() {
    const selectdItems = document.querySelectorAll('.selected');
    let jsonOptions = { "id": ID };
    selectdItems.forEach(item => {
        jsonOptions[item.classList[1]] = item.id;
    });
    console.log(jsonOptions);
    fetch('../../../get-stock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonOptions)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let stock = data['stock'];
            let orginal_price;
            let discount;
            if (stock > 0) {
                orginal_price = data['price'];
                discount = data['discount'];
                if (discount == '' || discount == undefined) {
                    document.getElementById('current-price').innerHTML = `${orginal_price}<span class="dollar">$</span>`;
                    document.getElementById('discount-price').classList.add('hide');
                } else {
                    document.getElementById('discount-price').classList.remove('hide');
                    document.getElementById('current-price').innerHTML = `${apply_discount(discount, orginal_price)}<span class="dollar">$</span>`;
                }
                document.getElementById('stock').innerText = stock;
                document.getElementById('discount').innerText = discount;
                document.getElementById('orginal-price').innerHTML = `${orginal_price}<span class="dollar">$</span>`;
                if (parseInt(inputCount.value) <= parseInt(stock)) {
                    inStockUI();
                } else {
                    outOfStockUI();
                }
            } else {
                outOfStockUI();
            }
        })
        .catch(error => console.error('Error:', error));
}

selectItems.forEach(selectItem => {
    selectItem.addEventListener('click', () => {
        document.getElementById("selected-" + selectItem.classList[1] + "-name").innerText = selectItem.id;
        selectItems.forEach(item => {
            if (selectItem.classList[1] == item.classList[1]) {
                item.classList.remove('selected');
            }
            selectItem.classList.add('selected');
        });
        checkAvailability();
    });
});

document.getElementById('plus').addEventListener('click', () => {
    setCountValueInRange(1);
});

document.getElementById('minus').addEventListener('click', () => {
    setCountValueInRange(-1);
});

inputCount.addEventListener('change', () => {
    setCountValueInRange();
});

function setCountValueInRange(add = 0) {
    inputCount.value = parseInt(inputCount.value) + add;
    if (inputCount.value < 1) {
        inputCount.value = 1;
    } else if (inputCount.value > 1000) {
        inputCount.value = 1000;
    }
    checkAvailability();
}

document.querySelector('.bigger-img-container').addEventListener('mousemove', (event) => {
    if (shouldMagnifierVisible) {
        if (!isMagnifierVisible) {
            magnify(".bigger-img.active", 2);
            isMagnifierVisible = true;
        }
    }
});

document.querySelector('.bigger-img-container').addEventListener('mouseleave', () => {
    removeMagnifier();
    isMagnifierVisible = false;
});

function removeMagnifier() {
    const magnifierElements = document.querySelectorAll(".img-magnifier-glass");
    magnifierElements.forEach(magnifierElement => {
        if (magnifierElement) {
            magnifierElement.remove();
        }
    });
}

btnNext.addEventListener('mouseover', () => { shouldMagnifierVisible = false; });
btnPrev.addEventListener('mouseover', () => { shouldMagnifierVisible = false; });
btnNext.addEventListener('mouseleave', () => { shouldMagnifierVisible = true; });
btnPrev.addEventListener('mouseleave', () => { shouldMagnifierVisible = true; });


function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("info-container");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("info-tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

btnNext.addEventListener('click', () => {
    biggerImgs[currentImgIndex].className = "bigger-img passive";
    productImgOverlays[currentImgIndex].style.display = 'block';
    productImgs[currentImgIndex].style.border = 'none';
    currentImgIndex = (++currentImgIndex == biggerImgs.length) ? 0 : currentImgIndex;
    productImgOverlays[currentImgIndex].style.display = 'none';
    productImgs[currentImgIndex].style.border = 'solid 2px var(--foreground-color-)';
    biggerImgs[currentImgIndex].className = "bigger-img active";
    imgsSliderContainer.scrollLeft = 90 * currentImgIndex;
    removeMagnifier();
    magnify(".bigger-img.active", 2);
});

btnPrev.addEventListener('click', () => {
    biggerImgs[currentImgIndex].className = "bigger-img passive";
    productImgOverlays[currentImgIndex].style.display = 'block';
    productImgs[currentImgIndex].style.border = 'none';
    currentImgIndex = (currentImgIndex == 0) ? biggerImgs.length - 1 : --currentImgIndex;
    productImgOverlays[currentImgIndex].style.display = 'none';
    productImgs[currentImgIndex].style.border = 'solid 2px var(--foreground-color-)';
    biggerImgs[currentImgIndex].className = "bigger-img active";
    imgsSliderContainer.scrollLeft = 90 * currentImgIndex;
    removeMagnifier();
    magnify(".bigger-img.active", 2);
});

function magnify(query, zoom) {
    var img, glass, w, h, bw;
    img = document.querySelector(query);

    /* Create magnifier glass: */
    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");

    /* Insert magnifier glass: */
    img.parentElement.insertBefore(glass, img);

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;
    glass.style.display = 'none'; // none befor setting possition by courser pos

    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);

    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e) {
        var pos, x, y;
        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        x = pos.x;
        y = pos.y;

        /* Prevent the magnifier glass from being positioned outside the image: */
        // if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
        // if (x < w / zoom) { x = w / zoom; }
        // if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
        // if (y < h / zoom) { y = h / zoom; }
        /* Set the position of the magnifier glass: */
        glass.style.left = (x - w) + "px";
        glass.style.top = (y - h) + "px";
        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        // if ((pos.x < 32 && pos.y > 191 && pos.y < 259) || (pos.x > 368 && pos.y > 191 && pos.y < 259)) {
        //     glass.style.display = 'none';
        // }
        // else {
            glass.style.display = 'block';
        // }
    }

    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}

function apply_discount(discount, price) {
    price = parseFloat(price);

    if (discount === '') {
        return price;
    } else if (discount.endsWith('%')) {
        let discount_amount = parseFloat(discount.slice(0, -1)) / 100;
        let current_price = price - (price * discount_amount);
        return current_price;
    } else if (discount.endsWith('$')) {
        let discount_amount = parseFloat(discount.slice(0, -1));
        let current_price = price - discount_amount;
        return current_price;
    } else {
        throw new Error("Invalid discount format. Please use either '%' or '$' at the end.");
    }
}

function outOfStockUI() {
    document.getElementById('out-of-stock').classList.remove('hide');
    document.getElementById('stock-container').classList.add('hide');
    document.querySelector('.buy-container .price-container').classList.add('hide');
    document.querySelector('.add2cart-container').classList.add('disable');
    document.getElementById('btn-add2cart').disabled = true;
}

function inStockUI() {
    document.getElementById('out-of-stock').classList.add('hide');
    document.getElementById('stock-container').classList.remove('hide');
    document.querySelector('.buy-container .price-container').classList.remove('hide');
    document.querySelector('.add2cart-container').classList.remove('disable');
    document.getElementById('btn-add2cart').removeAttribute('disabled');
    document.getElementById('minus').removeAttribute('disabled');
    document.getElementById('plus').removeAttribute('disabled');
    inputCount.value = (inputCount.value < 1) ? 1 : inputCount.value;
}
