const isUseMap = document.getElementById('is-used-map');
const addAddressContainer = document.querySelector('.add-address-container');
const btnShowAddBox = document.getElementById('btn-show-add-box');
const btnClose = document.getElementById('close');
const edBtnContainers = document.querySelectorAll('.ed-btn-container');
const showCotrollBtns = document.querySelectorAll('.btn-show-cotroll');
const locations = document.querySelectorAll('.location');
const btnEditAddress = document.querySelectorAll('[id^="edit-address-"]');
const btnDeleteAddress = document.querySelectorAll('[id^="delete-address-"]');

let submitMode = 'add'; // or edit
let editIndex;

// let customIcon = L.divIcon({
//     className: 'custom-icon', // Define a CSS class for the icon
//     html: '<i style="color: var(--darker-fg-color-);" class="bi bi-geo-alt-fill"></i>', // Insert your HTML element here
//     iconSize: [25, 25] // Set the size of the icon
// });
let customIcon = L.icon({
    iconUrl: '/static/img/loc_icon.png',
    iconSize: [34, 34], // Set the size of the icon
    iconAnchor: [17, 34], // Set the anchor point of the icon
    popupAnchor: [0, 0] // Set the anchor point for popups
});

let selectedLocation;
let map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

locations.forEach(loc => {
    loc = L.map(loc).setView([loc.dataset.lat, loc.dataset.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(loc);
    L.marker(loc.getCenter(), { draggable: false, icon: customIcon }).addTo(loc);
});

showCotrollBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const p = document.getElementById('ed-btn-container-' + btn.dataset.id);
        if (p.style.display == 'flex') {
            p.style.display = 'none';
        } else {
            p.style.display = 'flex';
        }
    });
});

isUseMap.addEventListener('change', handelIsUseMap);

function handelIsUseMap() {
    console.log(isUseMap.checked);
    if (isUseMap.checked) {
        document.querySelector('.disable-overlay').style.display = 'none';
        map.dragging.enable();
    } else {
        document.querySelector('.disable-overlay').style.display = 'block';
        map.dragging.disable();
    }
}

btnShowAddBox.addEventListener('click', () => {
    addAddressContainer.style.display = 'block';

    if (submitMode === 'edit') {
        for (const item of document.querySelectorAll('form input')) {
            item.value = '';
        }
        isUseMap.checked = true;
        handelIsUseMap();
    }

    submitMode = 'add';

    map.setView([20, 0], 2);
    let marker = L.marker(map.getCenter(), { draggable: false, icon: customIcon }).addTo(map);
    selectedLocation = map.getCenter();

    map.on('move', function() {
        selectedLocation = map.getCenter();
        marker.setLatLng(selectedLocation);
        console.log(selectedLocation);
    });
});

btnClose.addEventListener('click', closeAddContainer);

document.addEventListener('click', function(event) {
    const targetElement = event.target;
    const isEditButton = Array.from(btnEditAddress).some(button => button.contains(targetElement));
    if (!addAddressContainer.contains(targetElement) && !btnShowAddBox.contains(targetElement) && !isEditButton) { closeAddContainer(); }
});

function closeAddContainer() {
    addAddressContainer.style.display = 'none';
}

btnDeleteAddress.forEach(btnDelete => {
    btnDelete.addEventListener('click', () => {
        let jsonObject = {'submitMode': 'delete', 'deleteIndex': parseInt(btnDelete.id.slice(15))};
        fetch('/my-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonObject)
            })
            .then(response => response.text())
            .then(text => {
                showSnackbar(text);
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});

btnEditAddress.forEach(btnEdit => {
    btnEdit.addEventListener('click', () => {
        addAddressContainer.style.display = 'block';
        submitMode = 'edit';
        editIndex = parseInt(btnEdit.id.slice(13));
        console.log(editIndex);

        prevAddress = JSON.parse(btnEdit.dataset.prevAddress);

        console.log(prevAddress);

        let prevIsUsedLoc = ('location' in prevAddress) ? true : false;
        let prevLoc;
        if (prevIsUsedLoc) {
            isUseMap.checked = true;
            prevLoc = prevAddress.location;
            delete prevAddress.location;
            map.setView([prevLoc.lat, prevLoc.lng], 15);
        } else {
            isUseMap.checked = false;
        }
        handelIsUseMap();

        for (const key in prevAddress) {
            document.getElementById(key).value = prevAddress[key];
        }

        map.on('move', function() {
            selectedLocation = map.getCenter();
            marker.setLatLng(selectedLocation);
            console.log(selectedLocation);
        });
        let marker = L.marker(map.getCenter(), { draggable: false, icon: customIcon }).addTo(map);
        selectedLocation = map.getCenter();
    });
});

document.getElementById('address-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    let formData = new FormData(this);

    let jsonObject = {'submitMode': submitMode};
    if (submitMode === 'edit') {
        jsonObject['editIndex'] = editIndex;
    }
    formData.forEach(function(value, key) {
        jsonObject[key] = value;
    });

    console.log(selectedLocation);
    if (isUseMap.checked) {
        jsonObject['location'] = selectedLocation;
    }

    console.log(jsonObject);

    fetch('/my-address', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonObject)
    })
    .then(response => response.text())
    .then(text => {
        showSnackbar(text);
        closeAddContainer();
        location.reload()
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
