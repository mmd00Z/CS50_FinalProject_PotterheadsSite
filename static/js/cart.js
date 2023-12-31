const overwievContainer = document.querySelector('.cart-view-container');

window.onscroll = () => {
    overwievContainer.style.marginTop = `${window.pageYOffset}px`;
    if (window.pageYOffset >= 70) {
    } else {
        document.querySelector('.cart-overeview-container').classList.remove("sticky");
    }
};