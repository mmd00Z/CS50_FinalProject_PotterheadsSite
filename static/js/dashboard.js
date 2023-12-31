const house_icon = document.querySelector('#house i');
const btnHouse = document.getElementById('house');
const patronus_icon = document.querySelector('#patronus i');
const btnPatronus = document.getElementById('patronus');
const wand_icon = document.querySelector('#wand i');
const btnWand = document.getElementById('wand');
const addProfileIcon = document.querySelector('#add-profile i');
const addProfile = document.getElementById('add-profile');
const select_title = document.getElementById('select-title');
const selector = document.getElementById('selector');
const selectorContainer = document.getElementById('selector-container');
const btnClose = document.getElementById('btn-close-selector');
const btnCancel = document.getElementById('cancel');
const btnOK = document.getElementById('ok');
const btnRemove = document.getElementById('btn-remove');
const overviewInfo = document.querySelector('.overview-info');
const bioContainer = document.getElementById('bio-container');
const bioP = document.getElementById('bio');
const profileImage = document.getElementById('profile-image');
const btnEdit = document.getElementById('btn-edit');
const errorMsg = document.getElementById('error-msg');
const btnInfoCancel = document.getElementById('btn-info-cancel');
const btnInfoOK = document.getElementById('btn-info-ok');
const infoContianer = document.querySelector('.info-contianer');
const infoControl = document.querySelector('.info-control');

let progressRate;
let uploadStatus;
let fileInput;
let dropZone;
let progressBar;
let fileName;
let uploadedMsg;
let image_name;
let infos_data;

let inputName;
let inputUsername;
let inputEmail;
let inputPassword;
let inputPhone;
let inputBirthday;
let inputBio;

let house_value = null;
let patronus_value = null;
let wand_value = null;
let profile_img_value = null;

let is_selecting_house = false;
let is_selecting_animal = false;
let is_selecting_wand = false;
let is_selected_profile = false;
let is_selecting_profile = false;
let last_selected_house = null;
let last_selected_animal = null;
let last_selected_wand = null;
let houses = [];
let animals = [];
let wands = [];
let isBioDown = false;

main();

function main() {
    // get house, patronus, wand, avatar from backend
    getHPWA().then(hpwa => {
        console.log(hpwa);
        house_value = hpwa['house_value'];
        patronus_value = hpwa['patronus_value'];
        wand_value = hpwa['wand_value'];
        profile_img_value = hpwa['profile_value'];
        console.log(profile_img_value);
        applyHouseToUI(house_value);
    }).catch(error => {
        console.log('Error:', error);
    });
    loadMagicalInfo();
    window.addEventListener('load', responsiveBio);
    window.addEventListener('resize', responsiveBio);
}


function getHPWA() {
    return new Promise((resolve, reject) => {
        fetch('../getHPWA', {
            method: 'POST',
        })
            .then(response => {
                console.log('Response:', response);
                resolve(response.json());
            })
            .catch(error => {
                console.log('Error:', error);
                reject(error);
            });
    });
}

function applyHouseToUI(user_house) {
    if (user_house == null) {
        removeHouseFromUI();
    }
    else {
        user_house = extractIntegerFromString(user_house);
        if (user_house == 0) {
            document.documentElement.style.setProperty('--primary-color-theme', 'rgba(200, 50, 80, 1)');
            document.getElementsByTagName('main')[0].style.background = 'linear-gradient(to top, #191926 50%, rgba(90, 25, 45, 1))';
        }
        else if (user_house == 1) {
            document.documentElement.style.setProperty('--primary-color-theme', 'rgba(255, 180, 0, 1)');
            document.getElementsByTagName('main')[0].style.background = 'linear-gradient(to top, #191926 50%, rgba(125, 90, 25, 1))';
        }
        else if (user_house == 2) {
            document.documentElement.style.setProperty('--primary-color-theme', 'rgba(25, 200, 220, 1)');
            document.getElementsByTagName('main')[0].style.background = 'linear-gradient(to top, #191926 50%, rgba(5, 65, 85, 1))';
        }
        else if (user_house == 3) {
            document.documentElement.style.setProperty('--primary-color-theme', 'rgba(20, 180, 140, 1)');
            document.getElementsByTagName('main')[0].style.background = 'linear-gradient(to top, #191926 50%, rgba(10, 90, 70, 1))';
        }
    }
}

function removeHouseFromUI() {
    document.documentElement.style.setProperty('--primary-color-theme', 'rgba(180, 65, 210, .8)');
    document.getElementsByTagName('main')[0].style.background = '#191926';
}

function loadMagicalInfo() {
    fetch('../getMagicalObjectImage?q=house')
        .then(response => response.json())
        .then(data => {
            data.forEach((imageUrl, index) => {
                const btnHouse = document.createElement('button');
                btnHouse.classList.add("transparent-btn");
                btnHouse.id = 'house' + index;
                const imgHouse = document.createElement('img');
                imgHouse.src = imageUrl;
                btnHouse.appendChild(imgHouse);
                btnHouse.addEventListener('click', () => {
                    if (last_selected_house === btnHouse.id) {
                        btnHouse.style.boxShadow = 'none';
                        btnHouse.style.border = 'none';
                        last_selected_house = null;
                    }
                    else {
                        if (last_selected_house !== null) {
                            document.getElementById(last_selected_house).style.boxShadow = 'none';
                            document.getElementById(last_selected_house).style.border = 'none';
                        }
                        last_selected_house = btnHouse.id;
                        btnHouse.style.boxShadow = '0px 0px 20px -5px var(--primary-color-theme)';
                        btnHouse.style.border = 'solid 1px var(--primary-color-theme)';
                    }
                });
                houses.push(btnHouse);
            });
        });

    fetch('../getMagicalObjectImage?q=patronus')
        .then(response => response.json())
        .then(data => {
            data.forEach((imageUrl, index) => {
                const btnAnimal = document.createElement('button');
                btnAnimal.classList.add("transparent-btn");
                btnAnimal.id = 'Animal' + index;
                const imgAnimal = document.createElement('img');
                imgAnimal.src = imageUrl;
                btnAnimal.appendChild(imgAnimal);
                btnAnimal.addEventListener('click', () => {
                    if (last_selected_animal === btnAnimal.id) {
                        btnAnimal.style.boxShadow = 'none';
                        btnAnimal.style.border = 'none';
                        last_selected_animal = null;
                    }
                    else {
                        if (last_selected_animal !== null) {
                            document.getElementById(last_selected_animal).style.boxShadow = 'none';
                            document.getElementById(last_selected_animal).style.border = 'none';
                        }
                        last_selected_animal = btnAnimal.id;
                        btnAnimal.style.boxShadow = '0px 0px 20px -5px var(--primary-color-theme)';
                        btnAnimal.style.border = 'solid 1px var(--primary-color-theme)';
                    }
                });
                animals.push(btnAnimal);
            });
        });

    fetch('../getMagicalObjectImage?q=wand')
        .then(response => response.json())
        .then(data => {
            data.forEach((imageUrl, index) => {
                const btnWand = document.createElement('button');
                btnWand.classList.add("transparent-btn");
                btnWand.id = 'wand' + index;
                const imgWand = document.createElement('img');
                imgWand.src = imageUrl;
                imgWand.style.height = '150px';
                imgWand.style.width = 'unset';
                btnWand.appendChild(imgWand);
                btnWand.addEventListener('click', () => {
                    if (last_selected_wand === btnWand.id) {
                        btnWand.style.boxShadow = 'none';
                        btnWand.style.border = 'none';
                        last_selected_wand = null;
                    }
                    else {
                        if (last_selected_wand !== null) {
                            document.getElementById(last_selected_wand).style.boxShadow = 'none';
                            document.getElementById(last_selected_wand).style.border = 'none';
                        }
                        last_selected_wand = btnWand.id;
                        btnWand.style.boxShadow = '0px 0px 20px -5px var(--primary-color-theme)';
                        btnWand.style.border = 'solid 1px var(--primary-color-theme)';
                    }
                });
                wands.push(btnWand);
            });
        });
}

btnHouse.addEventListener('click', () => {
    btnRemove.style.display = (house_value == null) ? 'none' : 'block';
    is_selecting_house = true;
    let position = 0
    if (house_icon.style.display !== 'none') {
        position = house_icon.getBoundingClientRect();
        selector.style.top = (position.top + 15) + 'px';
    }
    else {
        position = document.querySelector('#house span').getBoundingClientRect();
        selector.style.top = (position.top - 80) + 'px';
    }
    select_title.innerText = 'Select your house';
    selector.style.left = position.left + 'px';
    selector.style.borderRadius = '5px';
    selector.style.display = 'flex';
    selector.style.animation = 'show-selector .6s ease-in forwards';
    selectorContainer.classList.remove(...selectorContainer.classList);
    selectorContainer.classList.add('for-show-houses');
    setTimeout(() => {
        houses.forEach(house => {
            selectorContainer.appendChild(house);
        });
    }, 550);
});

btnPatronus.addEventListener('click', () => {
    btnRemove.style.display = (patronus_value == null) ? 'none' : 'block';
    is_selecting_animal = true;
    let position = 0
    if (patronus_icon.style.display !== 'none') {
        position = patronus_icon.getBoundingClientRect();
        selector.style.top = (position.top + 15) + 'px';
    }
    else {
        position = document.querySelector('#house span').getBoundingClientRect();
        selector.style.top = (position.top - 80) + 'px';
    }
    select_title.innerText = 'Select your Patronus Charm';
    selector.style.left = position.left + 'px';
    selector.style.borderRadius = '5px';
    selector.style.display = 'flex';
    selector.style.animation = 'show-selector .6s ease-in forwards';
    selectorContainer.classList.remove(...selectorContainer.classList);
    selectorContainer.classList.add('for-show-patronus');
    setTimeout(() => {
        animals.forEach(animal => {
            selectorContainer.appendChild(animal);
        });
    }, 550);
});

btnWand.addEventListener('click', () => {
    btnRemove.style.display = (wand_value == null) ? 'none' : 'block';
    is_selecting_wand = true;
    let position = 0
    if (wand_icon.style.display !== 'none') {
        position = wand_icon.getBoundingClientRect();
        selector.style.top = (position.top + 15) + 'px';
    }
    else {
        position = document.querySelector('#wand span').getBoundingClientRect();
        selector.style.top = (position.top - 80) + 'px';
    }
    select_title.innerText = 'Select your wand';
    selector.style.left = position.left + 'px';
    selector.style.borderRadius = '5px';
    selector.style.display = 'flex';
    selector.style.animation = 'show-selector .6s ease-in forwards';
    selectorContainer.classList.remove(...selectorContainer.classList);
    selectorContainer.classList.add('for-show-wands');
    setTimeout(() => {
        wands.forEach(wand => {
            selectorContainer.appendChild(wand);
        });
    }, 550);
});

btnOK.addEventListener('click', () => {
    if (is_selecting_house) {
        if (last_selected_house !== null) {
            fetch('../setHouse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ houseID: last_selected_house })
            }).then(response => response.json())
                .then(result => {
                    console.log('Response from Flask server:', result);
                })
                .catch(error => {
                    console.log('Error:', error);
                });
            for (let i = 0; i < btnHouse.children.length; i++) {
                if (btnHouse.children[i].nodeName.toLowerCase() === 'img') {
                    hasImgChild = true;
                    btnHouse.children[i].remove();
                    break;
                }
            }
            applyHouseToUI(last_selected_house);
            let selected_house_img = document.querySelector('#' + last_selected_house + ' img');
            document.querySelector('#house i').style.display = 'none';
            const house_logo = document.createElement('img');
            house_logo.src = selected_house_img.src;
            house_logo.classList.add('house-logo');
            btnHouse.insertBefore(house_logo, btnHouse.firstChild);
            document.getElementById(last_selected_house).style.border = 'none';
            document.getElementById(last_selected_house).style.boxShadow = 'none';
            house_value = last_selected_house;
            last_selected_house = null;
            is_selecting_house = false;
            cloes();
        }
    }
    else if (is_selecting_animal) {
        fetch('../setPatronus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patronusID: last_selected_animal })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < btnPatronus.children.length; i++) {
            if (btnPatronus.children[i].nodeName.toLowerCase() === 'img') {
                hasImgChild = true;
                btnPatronus.children[i].remove();
                break;
            }
        }
        let selected_patronus_img = document.querySelector('#' + last_selected_animal + ' img');
        document.querySelector('#patronus i').style.display = 'none';
        const patronus_logo = document.createElement('img');
        patronus_logo.src = selected_patronus_img.src;
        patronus_logo.classList.add('patronus-logo');
        btnPatronus.insertBefore(patronus_logo, btnPatronus.firstChild);
        document.getElementById(last_selected_animal).style.border = 'none';
        document.getElementById(last_selected_animal).style.boxShadow = 'none';
        patronus_value = last_selected_animal;
        last_selected_animal = null;
        is_selecting_animal = false;
        cloes();
    }
    else if (is_selecting_wand) {
        fetch('../setWand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wandID: last_selected_wand })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < btnWand.children.length; i++) {
            if (btnWand.children[i].nodeName.toLowerCase() === 'img') {
                hasImgChild = true;
                btnWand.children[i].remove();
                break;
            }
        }
        let selected_wand_img = document.querySelector('#' + last_selected_wand + ' img');
        document.querySelector('#wand i').style.display = 'none';
        const wand_logo = document.createElement('img');
        wand_logo.src = selected_wand_img.src;
        wand_logo.classList.add('wand-logo');
        btnWand.insertBefore(wand_logo, btnWand.firstChild);
        document.getElementById(last_selected_wand).style.border = 'none';
        document.getElementById(last_selected_wand).style.boxShadow = 'none';
        wand_value = last_selected_wand;
        last_selected_wand = null;
        is_selecting_wand = false;
        cloes();
    }

    if (is_selected_profile) {
        fetch('../confirm-profile-img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'image_name': image_name })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
                profile_img_value = image_name;
                profileImage.src = '../static/imgs_accepted_profile/' + image_name + '.png';
                document.querySelector('.profile-image-small').src = '../static/imgs_accepted_profile/' + image_name + '.png';
            })
            .catch(error => {
                console.log('Error:', error);
            });
        is_selected_profile = false;
        cloes();
    }
});

btnRemove.addEventListener('click', () => {
    if (is_selecting_house) {
        fetch('../setHouse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ houseID: 'Null' })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < btnHouse.children.length; i++) {
            if (btnHouse.children[i].nodeName.toLowerCase() === 'img') {
                hasImgChild = true;
                btnHouse.children[i].remove();
                break;
            }
        }
        document.querySelector('#house i').style.display = 'block';
        removeHouseFromUI();
        house_value = null;
    }

    if (is_selecting_animal) {
        fetch('../setPatronus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patronusID: 'Null' })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < btnPatronus.children.length; i++) {
            if (btnPatronus.children[i].nodeName.toLowerCase() === 'img') {
                hasImgChild = true;
                btnPatronus.children[i].remove();
                break;
            }
        }
        document.querySelector('#patronus i').style.display = 'block';
        patronus_value = null;
    }

    if (is_selecting_wand) {
        fetch('../setWand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wandID: 'Null' })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < btnWand.children.length; i++) {
            if (btnWand.children[i].nodeName.toLowerCase() === 'img') {
                hasImgChild = true;
                btnWand.children[i].remove();
                break;
            }
        }
        document.querySelector('#wand i').style.display = 'block';
        wand_value = null;
    }

    if (is_selecting_profile) {
        fetch('../confirm-profile-img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'image_name': 'Null' })
        }).then(response => response.json())
            .then(result => {
                console.log('Response from Flask server:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
        profileImage.src = '../static/img/default_profile.png';
        document.querySelector('.profile-image-small').src = '../static/img/default_profile.png';
        profile_img_value = null;
    }
    cloes();
});

addProfile.addEventListener('click', () => {
    console.log(profile_img_value);
    btnRemove.style.display = (profile_img_value === null || profile_img_value === undefined) ? 'none' : 'block';
    setTimeout(() => {
        is_selecting_profile = true;
        let position = 0;
        position = addProfileIcon.getBoundingClientRect();
        selector.style.top = (position.top + 15) + 'px';
        selector.style.left = position.left + 'px';
        select_title.innerText = 'Select your avatar';
        selector.style.borderRadius = '5px';
        selector.style.animation = 'show-selector .6s ease-in forwards';
        selectorContainer.classList.remove(...selectorContainer.classList);
        selectorContainer.innerHTML = `
        <button id="drop-zone" class="flex-column">
            <input type="file" class="file-input" id="fileInput" accept="image/*">
            <i class="bi bi-cloud-arrow-up"></i>
            <span>Drag your image here or click to browse</span>
        </button>
        <div class="upload-status">
            <span id="uploaded-msg"><span id="file-name">profile.png</span></span>
            <div class="progress-bar">
                <span id="progress-rate">20%</span>
                <div class="progress-bar-fill" id="progressBar"></div>
            </div>
        </div>`;
        uploadStatus = document.querySelector('.upload-status');
        fileInput = document.getElementById('fileInput');
        dropZone = document.getElementById('drop-zone');
        progressBar = document.getElementById('progressBar');
        progressRate = document.getElementById('progress-rate');
        fileName = document.getElementById('file-name');
        uploadedMsg = document.getElementById('uploaded-msg');

        selector.style.display = 'flex';
        uploadStatus.style.display = 'none';
        uploadStatus.style.alignItems = '';
        selectorContainer.classList.add('flex-column');
        dropZone.addEventListener('click', handelZoneClick);
        dropZone.addEventListener('dragleave', handelDragleave);
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
        fileInput.addEventListener('change', handleFileSelectBrows, false);
    }, 0)
});

function handelZoneClick() {
    fileInput.click();
}

function handelDragleave() {
    dropZone.style.filter = '';
}

function handleFileSelectBrows(event) {
    var file = event.target.files[0];
    uploadFile(file);
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropZone.style.filter = 'brightness(2.5) grayscale(.6)';
}

function handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();

    let file = event.dataTransfer.files[0];
    uploadFile(file);
}

function uploadFile(file) {
    dropZone.style.filter = '';
    uploadStatus.style.display = 'flex';
    progressBar.style.width = '0%';
    fileName.innerText = file.name;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload-profile-img', true);

    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            let progress = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = progress + '%';
            progressRate.innerText = progress + '%';
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            image_name = xhr.responseText;
            dropZone.innerHTML = '<img src="../static/imgs_temp_uploaded/' + image_name + '.png" alt="Uploaded Image" />';
            dropZone.style.width = '350px';
            dropZone.style.height = '350px';
            document.querySelector('.progress-bar').style.display = 'none';
            fileName.style.color = 'var(--primary-color-theme)';
            fileName.style.filter = 'brightness(1.5)';
            uploadStatus.style.alignItems = 'center';
            uploadedMsg.innerHTML = 'Upload image ' + uploadedMsg.innerHTML + ' done.';
            dropZone.removeEventListener('click', handelZoneClick);
            dropZone.removeEventListener('dragleave', handelDragleave);
            dropZone.removeEventListener('dragover', handleDragOver);
            dropZone.removeEventListener('drop', handleFileSelect);
            fileInput.removeEventListener('change', handleFileSelectBrows);
            is_selected_profile = true;
        } else {
            dropZone.innerHTML = 'Error uploading image.';
        }
    };

    let formData = new FormData();
    formData.append('image', file);
    xhr.send(formData);
}

btnCancel.addEventListener('click', () => {
    if (is_selecting_profile) {
        fetch('../cancel-profile-img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'image_name': image_name })
        })
    }
    cloes();
});

btnClose.addEventListener('click', cloes);

function cloes() {
    is_selecting_house = false;
    is_selecting_animal = false;
    is_selecting_wand = false;
    is_selected_profile = false;
    is_selecting_profile = false;
    selector.style.display = 'none';
    selectorContainer.innerHTML = "";
}

document.addEventListener('click', function(event) {
    const targetElement = event.target;
    if (!selector.contains(targetElement) && !btnHouse.contains(targetElement) && !btnPatronus.contains(targetElement) && !btnWand.contains(targetElement))
        cloes();
});

btnEdit.addEventListener('click', () => {
    fetch('../getInfos', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(infos => {
            infos_data = { ...infos };
            delete infos[5];
            let str_edit_panel = '';
            infos.forEach((info) => {
                if (info.key !== 'Bio') {
                    str_edit_panel +=
                        `<div class="info-item">
        <label for="input${info.key}">${info.key}: </label>
        <input class="info-value" id="input${info.key}" type="text" value="${info.value}">
    </div>`;
                } else {
                    str_edit_panel +=
                        `<div class="info-item bio-edit">
        <label for="input${info.key}">${info.key}: </label>
        <textarea class="info-value" id="input${info.key}" rows="5">${info.value}</textarea>
    </div>`;
                }
            });
            infoContianer.innerHTML = str_edit_panel;
            const firstField = document.querySelector('.info-item:first-child input');
            firstField.focus();
            firstField.setSelectionRange(firstField.value.length, firstField.value.length);
            infoControl.style.display = 'flex';

            inputName = document.getElementById('inputName');
            inputUsername = document.getElementById('inputUsername');
            inputEmail = document.getElementById('inputEmail');
            inputEmail.placeholder = `example@email.com`;
            inputPassword = document.getElementById('inputPassword');
            inputPassword.type = 'password';
            inputPassword.placeholder = `Leave if don't want to change`;
            inputPhone = document.getElementById('inputPhone');
            inputPhone.placeholder = `09xxxxxxxxx`;
            inputBirthday = document.getElementById('inputBirthday');
            inputBirthday.type = 'date';
            inputBio = document.getElementById('inputBio');
            inputBio.placeholder = `About you ...`;

            inputName.addEventListener('blur', () => {
                condition = isEmpty(inputName.value);
                checkInputUI(inputName, condition, !condition, "You should provide a name!");
            });
            inputUsername.addEventListener('blur', () => {
                isUniqueUsername(inputUsername.value)
                    .then(isValid => {
                        condition = isEmpty(inputUsername.value) || !isValidUsername(inputUsername.value) || !isValid;
                        checkInputUI(inputUsername, condition, !condition, (!isValid) ? "This username is already token!" : "You should provide a valid username! Username can only contain A-Z, a-z, 0-9, - and _ character.");
                    })
                    .catch(error => {
                        console.log('Error:', error);
                    });
            });
            inputEmail.addEventListener('blur', () => {
                isUniqueEmail(inputEmail.value)
                    .then(isValid => {
                        condition = isEmpty(inputEmail.value) || !isValidEmail(inputEmail.value) || !isValid;
                        checkInputUI(inputEmail, condition, !condition, (!isValid) ? "This email is already token!" : "You should provide a valid email!");
                    })
                    .catch(error => {
                        console.log('Error:', error);
                    });
            });
            inputPassword.addEventListener('blur', () => {
                console.log(inputPassword.value);
                condition1 = !isValidPassword(inputPassword.value) && !isEmpty(inputPassword.value);
                condition2 = isValidPassword(inputPassword.value) && !isEmpty(inputPassword.value);
                checkInputUI(inputPassword, condition1, condition2, "Password requires at least 8 characters with uppercase, lowercase, and a number.");
            });
            inputPhone.addEventListener('blur', () => {
                condition1 = !isValidPhoneNumber(inputPhone.value) && !isEmpty(inputPhone.value);
                condition2 = isValidPhoneNumber(inputPhone.value) && !isEmpty(inputPhone.value);
                checkInputUI(inputPhone, condition1, condition2, "You should provide a valid phone number!");
            });
            inputBirthday.addEventListener('blur', () => {
                condition1 = !isValidBirthday(inputBirthday.value) && !isEmpty(inputBirthday.value);
                condition2 = isValidBirthday(inputBirthday.value) && !isEmpty(inputBirthday.value);
                checkInputUI(inputBirthday, condition1, condition2, "You should provide a valid date!");
            });
            inputPassword.value = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    btnEdit.style.display = 'none';
});

btnInfoOK.addEventListener('click', () => {
    let submitInfo = {};
    isUniqueUsername(inputUsername.value)
        .then(is_unique_username => {
            isUniqueEmail(inputEmail.value)
                .then(is_unique_email => {
                    if (isEmpty(inputName.value)) {
                        showErrorMsg('You should provide a name!');
                        return;
                    } else if (!is_unique_username) {
                        showErrorMsg('This username is already token!');
                        return;
                    } else if (isEmpty(inputUsername.value) || !isValidUsername(inputUsername.value)) {
                        showErrorMsg('You should provide a valid username! Username can only contain A-Z, a-z, 0-9, - and _ character.');
                        return;
                    } else if (isEmpty(inputEmail.value) || !isValidEmail(inputEmail.value)) {
                        showErrorMsg('You should provide a valid email!');
                        return;
                    } else if (!is_unique_email) {
                        showErrorMsg('This email is already token!');
                        return;
                    } else if (!isValidPassword(inputPassword.value) && !isEmpty(inputPassword.value)) {
                        showErrorMsg('Password requires at least 8 characters with uppercase, lowercase, and a number.');
                        return;
                    } else if (!isValidPhoneNumber(inputPhone.value) && !isEmpty(inputPhone.value)) {
                        showErrorMsg('You should provide a valid phone number!');
                        return;
                    } else if (!isValidBirthday(inputBirthday.value) && !isEmpty(inputBirthday.value)) {
                        showErrorMsg('You should provide a valid date!');
                        return;
                    }

                    infos_data[0]['value'] = inputName.value;
                    infos_data[1]['value'] = inputUsername.value;
                    infos_data[2]['value'] = inputEmail.value;
                    infos_data[4]['value'] = inputPhone.value;
                    infos_data[6]['value'] = inputBirthday.value;
                    infos_data[7]['value'] = inputBio.value;
                    bioP.innerText = inputBio.value;

                    submitInfo['name'] = inputName.value;
                    submitInfo['username'] = inputUsername.value;
                    submitInfo['email'] = inputEmail.value;
                    submitInfo['password'] = inputPassword.value;
                    submitInfo['phone_number'] = inputPhone.value;
                    submitInfo['birthday'] = inputBirthday.value;
                    submitInfo['biography'] = inputBio.value;

                    console.log(infos_data);
                    console.log(submitInfo);

                    fetch('../setInfos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(submitInfo)
                    })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result);
                            closeEdit();
                        })
                        .catch(error => {
                            console.log('Error:', error);
                        });
                })
                .catch(error => {
                    console.log('Error:', error);
                });
        })
        .catch(error => {
            console.log('Error:', error);
        });
});

btnInfoCancel.addEventListener('click', () => {
    closeEdit();
});

function closeEdit() {
    let str_edit_panel = '';
    btnEdit.style.display = 'block';
    Object.values(infos_data).forEach((info) => {
        if (info.key !== 'Bio') {
            str_edit_panel +=
                `<div class="info-item">
                <label>${info.key}: </label>
                <span class="info-value">${(info.key === 'Password') ? '●'.repeat(8) : (info.value === '') ? 'None' : info.value}</span>
            </div>`
        }
    });
    infoContianer.innerHTML = str_edit_panel;
    infoControl.style.display = 'none';
}

function responsiveBio() {
    if (!isBioDown && window.innerWidth <= 600) {
        let bio = overviewInfo.children[2];
        if (bio) {
            let clonedBio = bio.cloneNode(true);
            overviewInfo.removeChild(bio);
            bioContainer.appendChild(clonedBio);
            isBioDown = true;
        }
    }
    else if (window.innerWidth > 600) {
        let bio = bioContainer.children[0];
        if (bio) {
            let clonedBio = bio.cloneNode(true);
            bioContainer.removeChild(bio);
            overviewInfo.appendChild(clonedBio);
            isBioDown = false;
        }
    }
}

function checkInputUI(inputElement, if_condition, else_condition, error_msg) {
    let validation_icon = document.createElement("i");
    if (if_condition) {
        validation_icon.className = "bi bi-exclamation-triangle";
        if (inputElement.parentNode.children.length >= 3) {
            inputElement.parentNode.replaceChild(validation_icon, inputElement.parentNode.children[2]);
        } else {
            inputElement.parentNode.appendChild(validation_icon);
        }
        inputElement.style.paddingRight = '20px';
        showErrorMsg(error_msg);
    } else if (else_condition) {
        validation_icon.className = "bi bi-check-lg";
        if (inputElement.parentNode.children.length >= 3) {
            inputElement.parentNode.replaceChild(validation_icon, inputElement.parentNode.children[2]);
        } else {
            inputElement.parentNode.appendChild(validation_icon);
        }
        inputElement.style.paddingRight = '20px';
        errorMsg.style.display = 'none';
    }
}

function showErrorMsg(msg) {
    errorMsg.style.display = 'block';
    errorMsg.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${msg}`;
}

function extractIntegerFromString(string) {
    const match = string.match(/\d+/);
    return (match) ? parseInt(match[0]) : null;
}

function isEmpty(name) {
    return !name.trim();
}

function isValidUsername(username) {
    let pattern = /^[a-zA-Z0-9_-]+$/;
    return pattern.test(username);
}

function isValidBirthday(birthday) {
    try {
        new Date(birthday);
        return true;
    } catch (error) {
        return false;
    }
}

function isValidEmail(email) {
    const pattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return pattern.test(email);
}

function isUniqueEmail(email) {
    return new Promise((resolve, reject) => {
        fetch('../checkEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'email': email })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                resolve(result['is_valid']);
            })
            .catch(error => {
                console.log('Error:', error);
                reject(error);
            });
    });
}

function isUniqueUsername(username) {
    return new Promise((resolve, reject) => {
        fetch('../checkUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'username': username })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                resolve(result['is_valid']);
            })
            .catch(error => {
                console.log('Error:', error);
                reject(error);
            });
    });
}

function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function isValidPhoneNumber(phoneNumber) {
    if (phoneNumber.length > 11 || phoneNumber.length < 10)
        return false;
    const pattern = /^\+?[\d\- ]+$/;
    return pattern.test(phoneNumber);
}
