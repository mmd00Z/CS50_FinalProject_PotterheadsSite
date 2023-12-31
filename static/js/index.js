window.addEventListener('scroll', function() {
    var items = document.querySelectorAll('.houses');
    items.forEach(function(item) {
        if ((50 < window.innerHeight - item.getBoundingClientRect().top || 50 < window.innerHeight - item.getBoundingClientRect().bottom) && !item.classList.contains('visible')) {
            item.classList.add('visible');
        }
    });
});


window.addEventListener('load', function() {
    var items = document.querySelectorAll('.houses');
    items.forEach(function(item) {
        if ((50 < window.innerHeight - item.getBoundingClientRect().top || 50 < window.innerHeight - item.getBoundingClientRect().bottom) && !item.classList.contains('visible')) {
            item.classList.add('visible');
        }
    });
});

const houses = document.querySelectorAll('.houses');
houses.forEach((house, index) => {
    house.style.transition = 'all 2s ease';
});