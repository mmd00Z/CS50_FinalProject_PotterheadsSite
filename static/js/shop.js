let slideIndex = 0;
let currentSlideNumber = 0;
const slides = document.getElementsByClassName("slideshow-item");
const slidesContainer = document.querySelector(".slideshow-container");
const dots = document.getElementsByClassName("dot");
const btnNext = document.getElementById("next");
const btnPrev = document.getElementById("prev");
const productContainer = document.querySelector('.product-container .content')
const sideBar = document.querySelector('.side-bar');

btnNext.onclick = nextSlide;
btnPrev.onclick = prevSlide;

const nextSlideIntervalDuration = 8000;
let nextSlideInterval = setInterval(nextSlide, nextSlideIntervalDuration);

fetch('/get-products?selectAll=True&from=0&to=50')
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            let str_poduct_item = `
            <a href="../product/${data[i]['id'] + '/' + generateProductURL(data[i]['name'])}" class="product-item">
            <div class="img-container">
            <img alt="${data[i]['name']}" src="${'../static/imgs_products/' + JSON.parse(data[i]['images'])[0] + '.png'}"${(data[i]['stock'] == "0")? " class=\"unavailable-product\"":''}>
            </div>
            <span class="name">${data[i]['name']}</span>
            <div class="buy-item-container">
            <div class="price-container">
            ${(data[i]['stock'] == "0")? "<span>Out of Stock</span>":`<span class="current-price">${(data[i]['discount'] == '')? data[i]['price']:calculateDiscountedPrice(data[i]['discount'], data[i]['price'])}<span class="dollar">$</span></span>`}
            `+((data[i]['discount'] == '')? '':`<div class="discount-price">
            <span class="orginal-price">${data[i]['price']}<span class="dollar">$</span></span>
            <span class="discount">-${data[i]['discount']}</span>
            </div>`)
            +`</div>
            ${(data[i]['stock'] == "0")? '':`<button class="btn-buy" id="${data[i]['id']}">Buy</button>`}
            </div>
            </a>`;
            productContainer.innerHTML += str_poduct_item;
        }
        console.log(data); // For example, log the data to the console
    })
    .catch(error => {
        console.error('Error:', error);
    });

window.addEventListener('scroll', () => {
    const hContent = productContainer.offsetHeight;
    const hSideBar = sideBar.offsetHeight;
    const marginValue = window.scrollY - 410;
    if (marginValue + hSideBar < hContent) {
        if (marginValue > 0) {
            sideBar.style.marginTop = marginValue + 'px';
        } else {
            sideBar.style.marginTop = '0px';
        }
    } else {
        sideBar.style.marginTop = 'auto';
    }
});

function nextSlide() {
    clearInterval(nextSlideInterval);
    currentSlideNumber = (currentSlideNumber + 1 >= slides.length) ? 0 : currentSlideNumber + 1;
    let last_slide = slideIndex++;
    slidesContainer.scrollLeft = 0;
    if (slideIndex >= slides.length) {
        slideIndex = 0;
        last_slide--;
        const element = slidesContainer.children[slideIndex];
        slidesContainer.removeChild(slidesContainer.children[slideIndex]);
        slidesContainer.appendChild(element);
        slideIndex = slidesContainer.children.length - 1;
    }
    for (let dot of dots) {
        dot.className = "dot";
    }
    dots[currentSlideNumber].classList.add("active");
    slides[slideIndex].style.display = "inline-block";
    console.log(last_slide, slideIndex);
    setTimeout(() => {
        slides[last_slide].className = "slideshow-item gotoLeft";
        slides[slideIndex].className = "slideshow-item gotoLeft";
    }, 0);
    setTimeout(() => {
        slides[last_slide].style.display = "none";
        slides[last_slide].className = 'slideshow-item';
        slides[slideIndex].className = 'slideshow-item';
        nextSlideInterval = setInterval(nextSlide, nextSlideIntervalDuration);
    }, 800);
}

function prevSlide() {
    clearInterval(nextSlideInterval);
    currentSlideNumber = (currentSlideNumber - 1 < 0) ? slides.length - 1 : currentSlideNumber - 1;
    let hundred_percent = slidesContainer.offsetWidth;
    let last_slide = slideIndex--;
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
        last_slide++;
        const element = slidesContainer.children[slideIndex];
        slidesContainer.removeChild(slidesContainer.children[slideIndex]);
        slidesContainer.insertBefore(element, slidesContainer.firstChild);
        slideIndex = 0;
    }
    for (let dot of dots) {
        dot.className = "dot";
    }
    dots[currentSlideNumber].classList.add("active");
    slides[last_slide].style.display = "inline-block";
    slides[slideIndex].style.display = "inline-block";
    slidesContainer.scroll(hundred_percent, 0);
    setTimeout(() => {
        slides[last_slide].className = "slideshow-item gotoRight";
        slides[slideIndex].className = "slideshow-item gotoRight";
    }, 0);
    setTimeout(() => {
        slides[last_slide].style.display = "none";
        slides[last_slide].className = 'slideshow-item';
        slides[slideIndex].className = 'slideshow-item';
        slidesContainer.scrollLeft = 0;
        nextSlideInterval = setInterval(nextSlide, nextSlideIntervalDuration);
    }, 800);
}

function extractProductNameFromURL(url) {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const decodedProductName = lastPart.replace(/-/g, ' ');
    return decodeURIComponent(decodedProductName);
}

function calculateDiscountedPrice(discount, original_price) {
    if (typeof discount !== "string" || typeof original_price !== "number") {
        throw new Error("Invalid input. Please provide a valid discount format and original price.");
    }
    const discountType = discount.slice(-1); // Get the last character to determine the discount type
    const discountAmount = parseFloat(discount.slice(0, -1)); // Extract the numerical value of the discount

    if (isNaN(discountAmount)) {
        throw new Error("Invalid discount format. Please provide a valid discount value.");
    }
    let discountedPrice;
    if (discountType === "%") {
        if (discountAmount < 0 || discountAmount > 100) {
            throw new Error("Percentage discount should be between 0 and 100.");
        }
        discountedPrice = original_price - (original_price * discountAmount) / 100;
    } else if (discountType === "$") {
        if (discountAmount < 0) {
            throw new Error("Dollar discount should be a positive value.");
        }
        discountedPrice = original_price - discountAmount;
    } else {
        throw new Error("Invalid discount type. Please use '%' or '$' as the discount format.");
    }
    return discountedPrice;
}