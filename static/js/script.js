// Get references to HTML elements
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownContent = document.querySelector('.dropdown-content');
const dropdownIcon = document.querySelector('.dropdown i');
const nav = document.querySelector('.nav-links');
const toggleMobile = document.querySelector('#toggle-mobile');
const navLinks = document.querySelectorAll('.nav-links li');
const btnCart = document.getElementById('btn-cart');
const cartPanel = document.querySelector('.cart-panel');
const cartContainer = document.querySelector('.cart-container');
const emptyCart = document.getElementById('empty-cart');
const btnViewCart = document.getElementById('btn-view-cart');
let isNavLinksVisible = false;
let isCartVisible = false;

// Toggle dropdown visibility when the button is clicked
if (dropdownBtn) {
    dropdownBtn.addEventListener('click', function() {
        if (dropdownContent.style.display === 'block') {
            dropdownIcon.className = 'bi bi-chevron-down';
            dropdownContent.style.animation = 'slideUp .6s forwards';
            setTimeout(function() {
                dropdownContent.style.display = 'none';
                dropdownContent.style.animation = '';
            }, 1000);
        } else {
            dropdownContent.style.animation = 'slideDown .6s forwards';
            dropdownContent.style.display = 'block';
            dropdownIcon.className = 'bi bi-chevron-up';
        }
    });
}

// Click event on the page
document.addEventListener('click', function(event) {
    const targetElement = event.target;
    // Check if the click is inside the dropdown button or the dropdown content
    if (!nav.contains(targetElement) && !toggleMobile.contains(targetElement) && isNavLinksVisible && window.innerWidth < 750) {
        isNavLinksVisible = false;
        nav.style.animation = 'animated-hide-nav-links .5s ease forwards';
        setTimeout(() => {
            navLinks.forEach((link, index) => {
                link.style.animation = '';
                link.style.display = 'none';
            });
        }, 200);
        setTimeout(() => {
            nav.style.display = '';
            nav.style.animation = '';
        }, 500);
    }

    if (dropdownBtn && !dropdownBtn.contains(targetElement) && !dropdownContent.contains(targetElement)) {
        if (dropdownContent.style.display === 'block') {
            dropdownIcon.className = 'bi bi-chevron-down';
            dropdownContent.style.animation = 'slideUp .6s forwards';
            setTimeout(function() {
                dropdownContent.style.display = 'none';
                dropdownContent.style.animation = '';
            }, 1000);
        }
    }

    if (isCartVisible && !btnCart.contains(targetElement) && !cartPanel.contains(targetElement)) {
        hideCart();
        isCartVisible = false;
    }
});


toggleMobile.addEventListener('click', () => {
    isNavLinksVisible = !isNavLinksVisible;

    if (isNavLinksVisible) {
        nav.style.animation = 'animated-show-nav-links .5s ease forwards';
        nav.style.display = 'flex';
        setTimeout(() => {
            nav.style.animation = '';
        }, 500);

        navLinks.forEach((link, index) => {
            link.style.animation = `navLinkFade .5s ease forwards ${index / 7 + 0.3}s`;
            link.style.display = '';
        });
    } else {
        nav.style.animation = 'animated-hide-nav-links .5s ease forwards';
        setTimeout(() => {
            navLinks.forEach((link, index) => {
                link.style.animation = '';
                link.style.display = 'none';
            });
        }, 200);
        setTimeout(() => {
            nav.style.display = '';
            nav.style.animation = '';
            navLinks.forEach((link, index) => {
                link.style.display = 'flex';
            });
        }, 500);
    }
    // toggleMobile Animation
    toggleMobile.classList.toggle('toggle');
});

if (btnCart) {
    btnCart.addEventListener('click', () => {
        if (!isCartVisible) { showCart(); }
        else { hideCart(); }
    });
}

function showCart() {
    if (!isCartVisible) {
        cartPanel.style.display = 'flex';
        cartPanel.style.animation = 'animated-show-cart .5s ease forwards';
        isCartVisible = true;
    }
}

function hideCart() {
    if (isCartVisible) {
        cartPanel.style.animation = 'animated-hide-cart .5s ease forwards';
        setTimeout(() => { cartPanel.style.display = 'none'; isCartVisible = false; }, 500);
    }
}

function updateCart() {
    fetch('http://127.0.0.1:5000/get-cart-products', {
        method: 'POST',
    })
        .then(response => response.json())
        .then(cart => {
            console.log(cart);
            cartContainer.innerHTML = '';
            document.getElementById('total-amount').innerHTML = cart['total_amount'];
            document.getElementById('total-count').innerHTML = cart['total_count'];
            console.log(!cart['cart_products'].length);
            if (!cart['cart_products'].length) {
                emptyCart.style.display = 'block';
                btnViewCart.disabled = true;
                btnViewCart.classList.add('disable');
                return;
            }
            emptyCart.style.display = 'none';
            btnViewCart.disabled = false;
            btnViewCart.classList.remove('disable');
            for (const product of cart['cart_products']) {
                let features = ''
                for (const option in product['features']) {
                    features += `
                        <span><span class="color-fg">${option}: </span>${product['features'][option]}</span>
                        `;
                }
                console.log(product['features']);
                cartContainer.innerHTML += `
            <div class="cart-product">
                <div>
                    <a href="/product/${product['id']}/${generateProductURL(product['name'])}">
                        <img src="/static/imgs_products/${product['image']}.png" alt="">
                    </a>
                    <div class="plus-minus-product-container">
                        <button class="minus-product" data-id="${product['id']}" data-features='${JSON.stringify(product['features'])}'>
                            <i class="${(product['count'] > 1) ? 'bi bi-dash' : 'bi bi-trash'}"></i>
                        </button>
                        <span>${product['count']}</span>
                        <button class="plus-product" data-id="${product['id']}" data-features='${JSON.stringify(product['features'])}'${(product['count'] == product['stock']) ? ' disabled' : ''}>
                            <i class="bi bi-plus" ${(product['count'] == product['stock']) ? 'style="color: #aaa;"' : ''}></i>
                        </button>
                    </div>
                </div>
                <div class="cart-product-info">
                    <span class="name">${product['name']}</span>
                    ${features}
                    <div class="price-container"  style="margin-top: auto;">
                        <span class="current-price">${product['current_price']}<span class="dollar">$</span></span>
                        <div class="discount-price${(product['discount'] == '') ? ' hide' : ''}">
                            <span class="orginal-price">${product['price']}<span class="dollar">$</span></span>
                            <span class="discount">-${product['discount']}</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
                    `;
            }
            setEventToProductCountChanger();
        })
        .catch(error => console.error('Error:', error));
}

function setEventToProductCountChanger() {
    const btnsMinusProduct = document.querySelectorAll('.minus-product');
    const btnsPlusProduct = document.querySelectorAll('.plus-product');
    btnsPlusProduct.forEach(btnPlusProduct => {
        btnPlusProduct.addEventListener('click', () => {
            const jsonOptions = { count: 1, 'id': parseInt(btnPlusProduct.dataset.id), ...JSON.parse(btnPlusProduct.dataset.features) };
            console.log(jsonOptions);
            fetch('http://127.0.0.1:5000/add2cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonOptions)
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.hasOwnProperty('total_amount') && data.hasOwnProperty('total_count')) {
                        document.getElementById('total-amount').innerHTML = data['total_amount'];
                        document.getElementById('total-count').innerHTML = data['total_count'];
                    }
                    if (data.msg.includes('OK')) {
                        const count = btnPlusProduct.parentNode.children[1];
                        count.innerText = parseInt(count.innerText) + 1;
                        const priceContainer = btnPlusProduct.parentNode.parentNode.parentNode.children[1].lastElementChild;
                        priceContainer.children[0].innerHTML = `${parseInt(count.innerText) * parseInt(data['current_price'])}<span class="dollar">$</span>`;
                        priceContainer.children[1].children[0].innerHTML = `${parseInt(count.innerText) * parseInt(data['price'])}<span class="dollar">$</span>`;
                        if(data.hasOwnProperty('discount') && !priceContainer.children[0].classList.contains('hide') && data['discount'].slice(-1) === '$') {
                            priceContainer.children[1].children[1].innerHTML = `-${parseFloat(data['discount'].slice(0, -1)) * parseInt(count.innerText)}$`
                        }
                        btnPlusProduct.parentNode.children[0].children[0].className = 'bi bi-dash';
                        if (data.msg == 'Error, Out of stock' || (data.hasOwnProperty('is_last') && data['is_last'] === true)) {
                            btnPlusProduct.disabled = true;
                            btnPlusProduct.children[0].style.color = '#aaa';
                        }
                    } else {
                        showSnackbar(data.msg);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    });
    btnsMinusProduct.forEach(btnMinusProduct => {
        btnMinusProduct.addEventListener('click', () => {
            const jsonOptions = { count: -1, 'id': parseInt(btnMinusProduct.dataset.id), ...JSON.parse(btnMinusProduct.dataset.features) };
            console.log(jsonOptions);
            fetch('http://127.0.0.1:5000/add2cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonOptions)
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.hasOwnProperty('total_amount') && data.hasOwnProperty('total_count')) {
                        document.getElementById('total-amount').innerHTML = data['total_amount'];
                        document.getElementById('total-count').innerHTML = data['total_count'];
                    }
                    if (data.msg.includes('OK')) {
                        const count = btnMinusProduct.parentNode.children[1];
                        count.innerText = (parseInt(count.innerText) - 1 >= 1) ? parseInt(count.innerText) - 1 : 1;
                        const priceContainer = btnMinusProduct.parentNode.parentNode.parentNode.children[1].lastElementChild;
                        priceContainer.children[0].innerHTML = `${parseInt(count.innerText) * parseInt(data['current_price'])}<span class="dollar">$</span>`;
                        priceContainer.children[1].children[0].innerHTML = `${parseInt(count.innerText) * parseInt(data['price'])}<span class="dollar">$</span>`;
                        if(data.hasOwnProperty('discount') && !priceContainer.children[0].classList.contains('hide') && data['discount'].slice(-1) === '$') {
                            priceContainer.children[1].children[0].innerHTML = `-${parseFloat(data['discount'].slice(0, -1)) * parseInt(count.innerText)}$`
                        }
                        if (count.innerText == 1) {
                            btnMinusProduct.children[0].className = 'bi bi-trash';
                        }
                        btnMinusProduct.parentNode.children[2].children[0].style.color = '';
                        btnMinusProduct.parentNode.children[2].disabled = false;
                    } else {
                        if (data.msg == 'The product removed from your cart!') {
                            updateCart();
                        }
                        showSnackbar(data.msg);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    });
}

function showSnackbar(msg = 'Error', delay = 3000) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerHTML = msg;
    snackbar.className = "show";
    setTimeout(function() { snackbar.className = snackbar.className.replace("show", ""); }, delay);
}

function generateProductURL(productName) {
    const encodedProductName = encodeURIComponent(productName);
    return encodedProductName.replace(/%20/g, '-');
}

setEventToProductCountChanger();