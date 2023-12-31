const btnEditInfo = document.getElementById('btn-edit');
const errorMsg = document.getElementById('error-msg');
const btnInfoCancel = document.getElementById('btn-info-cancel');
const btnInfoOK = document.getElementById('btn-info-ok');
const infoContianer = document.querySelector('.info-contianer');
const infoControl = document.querySelector('.info-control');
const btnAddProducts = document.getElementById('btn-add-goods');
const btnEditProducts = document.getElementById('btn-edit-goods');
const btnDeleteProducts = document.getElementById('btn-delete-goods');
const productPanel = document.querySelector('.product-panel');
const btnProductCancel = document.getElementById('btn-product-cancel');
const btnProductOK = document.getElementById('btn-product-ok');
const inputProductID = document.getElementById('product-id');
const selectedFilePanel = document.getElementById('selected-file-panel');
const btnSearchProduct = document.getElementById('btn-search-product');
const searchQuery = document.getElementById('query');

let inputName;
let inputUsername;
let inputPassword;
let inputPhone;

let fileInput = document.getElementById('fileInput');
let dropZone = document.getElementById('drop-zone');
let fileName = document.getElementById('file-name');
let img_files = [];

let isEditingProduct = false;

let lastSelectedProductID = null;
let lastSelectedProductIndex = null;

let waitContainer = document.getElementById('wait-container');
let waitMsg = document.getElementById('wait-msg');

dropZone.addEventListener('click', handelZoneClick);
dropZone.addEventListener('dragleave', handelDragleave);
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
fileInput.addEventListener('change', handleFileSelectBrows, false);
btnEditInfo.addEventListener('click', handelBtnEditInfo);
btnInfoOK.addEventListener('click', handelBtnInfoOK);
btnInfoCancel.addEventListener('click', closeEdit);


btnEditProducts.style.display = 'none';
btnDeleteProducts.style.display = 'none';

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName == 'products') {
        searchQuery.focus();
    }
}

btnDeleteProducts.addEventListener('click', () => {
    document.querySelector('.search-result').innerHTML = '';
    if (lastSelectedProductID !== null) {
        fetch(`/delete-product?id=${lastSelectedProductID}`)
            .then(response => response.text())
            .then(responseText => {
                if (responseText === 'OK') {
                    showAlert('Success', 'Product deleted!');
                    lastSelectedProductIndex = null;
                    lastSelectedProductID = null;
                    btnEditProducts.style.display = 'none';
                    btnDeleteProducts.style.display = 'none';
                    btnAddProducts.style.display = 'inline-block';
                } else {
                    showAlert('Error', 'There is a problem in deleting the product!');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }
});

btnEditProducts.addEventListener('click', () => {
    document.querySelector('.search-result').innerHTML = '';
    if (lastSelectedProductID !== null) {
        isEditingProduct = true;
        btnAddProducts.style.display = 'none';
        btnEditProducts.style.display = 'none';
        btnDeleteProducts.style.display = 'none';
        productPanel.style.display = 'grid';
        window.scrollTo(0, productPanel.offsetTop - 80);

        fetch(`/get-product-by-id?id=${lastSelectedProductID}`)
            .then(response => response.json())
            .then(productData => {
                const fields = document.querySelectorAll('.product-item input, .product-item textarea');
                for (const field of fields) {
                    if (productData.hasOwnProperty(field.name)) {
                        field.value = productData[field.name];
                    }
                    // show images
                    // const productImgs = JSON.parse(productData['images'])
                    // for (const imageName of productImgs) {
                    // }
                    // set delete imgs
                    // set edit mode
                }
                lastSelectedProductIndex = null;
                lastSelectedProductID = null;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

btnSearchProduct.addEventListener('click', searchProduct);

searchQuery.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchProduct();
    }
});

function searchProduct() {
    lastSelectedProductID = null;
    document.querySelector('.search-result').style.display = 'flex';
    const query = searchQuery.value;
    fetch(`/get-products?q=${query}&from=0&to=10`)
        .then(response => response.json())
        .then(data => {
            document.querySelector('.search-result').innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                document.querySelector('.search-result').innerHTML += `
        <div id="${'search-result-' + i}" pid="${data[i]['id']}" class="search-result-item align-center marging-inline-20 gap-10 padding-15 border-2-foreground">
			<img src="${'../static/imgs_products/' + JSON.parse(data[i]['images'])[0] + '.png'}" alt="${data[i]['name']}" class="product-img">
			<div class="flex-column flex-grow-1">
				<span class="product-name font-size-1-2">${data[i]['name']} <span class="product-id">(id: ${data[i]['id']})</span></span>
				<p class="overview">${data[i]['overview']}</p>
			</div>
			<div class="flex-column space-between min-w-80 mb-auto">
				<span class="stock">stock: ${data[i]['stock']}</span>
				<div>
					<span class="current-price">${(data[i]['discount'] == '')? data[i]['price']:calculateDiscountedPrice(data[i]['discount'], data[i]['price'])}<span class="dollar">$</span></span>
					`+((data[i]['discount'] == '')? '':`<div class="discount-price">
						<span class="orginal-price">${data[i]['price']}<span class="dollar">$</span></span>
						<span class="discount">-${data[i]['discount']}</span>
					</div>`)+`
				</div>
			</div>
		</div>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('click', (event) => {
    const target = event.target.closest('.search-result-item');
    if (target) {
        const id = extractIntegerFromString(target.id);
        const allItem = document.querySelectorAll('.search-result-item');
        btnEditProducts.style.display = 'inline-block';
        btnDeleteProducts.style.display = 'inline-block';
        for (let item of allItem) {
            item.className = "search-result-item align-center marging-inline-20 gap-10 padding-15 border-2-foreground";;
        }
        if (id == lastSelectedProductIndex) {
            lastSelectedProductIndex = null;
            lastSelectedProductID = null;
            btnEditProducts.style.display = 'none';
            btnDeleteProducts.style.display = 'none';
            btnAddProducts.style.display = 'inline-block';
            for (let item of allItem) {
                item.className = "search-result-item align-center marging-inline-20 gap-10 padding-15 border-2-foreground";
            }
        } else {
            btnAddProducts.style.display = 'none';
            lastSelectedProductIndex = id;
            allItem[lastSelectedProductIndex].className += ' active';
            lastSelectedProductID = target.textContent.match(/\(id: (\d+)\)/)[1];
        }
    }
});

btnAddProducts.addEventListener('click', () => {
    lastSelectedProductIndex = null;
    lastSelectedProductID = null;
    isEditingProduct = false;
    document.querySelector('.search-result').innerHTML = '';
    btnAddProducts.style.display = 'none';
    fetch('../generateNewProductID', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.text()).then(new_generated_id => {
        inputProductID.value = new_generated_id;
        productPanel.style.display = 'grid';
        productPanel.scrollTop = 0;
    }).catch(error => {
        console.error('Error:', error);
    });
});

btnProductOK.addEventListener('click', () => {
    sendProductData('/sendProductData');
});

btnProductCancel.addEventListener('click', closeProductPanel);

function closeProductPanel() {
    productPanel.style.display = 'none';
    btnAddProducts.style.display = 'inline-block';
    resetProductPanel();
}

function handelZoneClick() {
    fileInput.click();
}

function handelDragleave() {
    dropZone.style.color = 'var(--foreground-color-)';
    dropZone.style.borderColor = 'var(--foreground-color-)';
}

function handleFileSelectBrows(event) {
    for (let i = 0; i < event.target.files.length; i++) {
        img_files.push(event.target.files[i]);
    }
    updateSelectedFileList();
    console.log(img_files);
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropZone.style.color = '#fff';
    dropZone.style.borderColor = '#fff';
}

function handleFileSelect(event) {
    dropZone.style.color = 'var(--foreground-color-)';
    dropZone.style.borderColor = 'var(--foreground-color-)';
    event.stopPropagation();
    event.preventDefault();
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
        img_files.push(event.dataTransfer.files[i]);
    }
    updateSelectedFileList();
    console.log(img_files);
}

function updateSelectedFileList() {
    let str_selected_file_panel = '';
    for (let i = 0; i < img_files.length; i++) {
        str_selected_file_panel += `<div class="selected-file-item">
            <img class="preview-image" src="${URL.createObjectURL(img_files[i])}">
            <span class="filename">${img_files[i].name}<button id="delete-img-${i}"><i class="bi bi-trash"></i></button></span>
        </div>`
    }
    selectedFilePanel.innerHTML = str_selected_file_panel;

    for (let i = 0; i < img_files.length; i++) {
        document.getElementById(`delete-img-${i}`).addEventListener('click', () => {
            img_files.splice(i, 1);
            updateSelectedFileList();
        });
    }

    if (img_files.length > 0) {
        selectedFilePanel.style.display = 'flex';
    } else {
        selectedFilePanel.style.display = 'none';
    }
}

function resetProductPanel() {
    let all_inputs = document.querySelectorAll('.product-panel input, .product-panel textarea');
    for (let i = 0; i < all_inputs.length; i++) {
        all_inputs[i].value = '';
    }
    img_files = [];
    updateSelectedFileList();
}

function sendProductData(path) {
    productPanel.style.display = 'none';

    let xhr = new XMLHttpRequest();
    xhr.open('POST', path, true);

    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            waitContainer.style.display = 'flex';
            waitMsg.innerHTML = 'Please wait!';
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
            showAlert('Success', 'Your changes has been saved', 600, 5000)
        } else {
            showAlert('Error', 'Error in send product data', 600, 5000)
        }
        waitContainer.style.display = 'none';
        closeProductPanel();
    };

    let formData = new FormData();
    let product_data = document.querySelectorAll('.product-item input, .product-item textarea');
    formData.append('editing', isEditingProduct);
    for (let i = 0; i < product_data.length; i++) {
        formData.append(product_data[i].name, product_data[i].value);
    }
    console.log(formData);
    console.log(img_files);
    for (let i = 0; i < img_files.length; i++) {
        formData.append('images', img_files[i], img_files[i].name);
    }
    xhr.send(formData);
}

function handelBtnInfoOK() {
    let submitInfo = {};
    isUniqueUsername(inputUsername.value)
        .then(is_unique_username => {
            if (isEmpty(inputName.value)) {
                showErrorMsg('You should provide a name!');
                return;
            } else if (!is_unique_username) {
                showErrorMsg('This username is already token!');
                return;
            } else if (isEmpty(inputUsername.value) || !isValidUsername(inputUsername.value)) {
                showErrorMsg('You should provide a valid username! Username can only contain A-Z, a-z, 0-9, - and _ character.');
                return;
            } else if (!isValidPassword(inputPassword.value) && !isEmpty(inputPassword.value)) {
                showErrorMsg('Password requires at least 8 characters with uppercase, lowercase, and a number.');
                return;
            } else if (!isValidPhoneNumber(inputPhone.value) && !isEmpty(inputPhone.value)) {
                showErrorMsg('You should provide a valid phone number!');
                return;
            }
            infos_data[0]['Name'] = inputName.value;
            infos_data[1]['Username'] = inputUsername.value;
            infos_data[2]['Phone'] = inputPhone.value;
            submitInfo['name'] = inputName.value;
            submitInfo['username'] = inputUsername.value;
            submitInfo['password'] = inputPassword.value;
            submitInfo['phone_number'] = inputPhone.value;

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
}

function handelBtnEditInfo() {
    fetch('../getInfos', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(infos => {
            infos_data = { ...infos };
            delete infos[5];
            let str_edit_panel = '';
            console.log(infos);
            infos.forEach((info) => {
                if (Object.keys(info)[0] != 'Joined') {
                    str_edit_panel +=
                        `<div class="info-item">
            <label for="input${Object.keys(info)[0]}">${Object.keys(info)[0]}: </label>
            <input class="info-value" id="input${Object.keys(info)[0]}" type="text" value="${info[Object.keys(info)[0]]}" autocomplete="off">
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
            inputPassword = document.getElementById('inputPassword');
            inputPassword.type = 'password';
            inputPassword.placeholder = `Leave if don't want to change`;
            inputPhone = document.getElementById('inputPhone');
            inputPhone.type = 'tel';
            inputPhone.placeholder = `09xxxxxxxxx`;

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
            inputPassword.value = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    btnEditInfo.style.display = 'none';
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

function closeEdit() {
    let str_edit_panel = '';
    btnEditInfo.style.display = 'block';
    console.log(infos_data);
    Object.values(infos_data).forEach((info) => {
        str_edit_panel +=
            `<div class="info-item">
                <label>${Object.keys(info)[0]}: </label>
                <span class="info-value">${(Object.keys(info)[0] === 'Password') ? '●'.repeat(8) : info[Object.keys(info)[0]]}</span>
            </div>`
    });
    infoContianer.innerHTML = str_edit_panel;
    infoControl.style.display = 'none';
}

function showErrorMsg(msg) {
    errorMsg.style.display = 'block';
    errorMsg.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${msg}`;
}

function isEmpty(name) {
    return !name.trim();
}

function isValidUsername(username) {
    let pattern = /^[a-zA-Z0-9_-]+$/;
    return pattern.test(username);
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

function extractIntegerFromString(string) {
    const match = string.match(/\d+/);
    return (match) ? parseInt(match[0]) : null;
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


function showAlert(title = 'Success', msg = 'Your changes has been saved', show_delay = 600, progress_delay = 5000) {
    let alertContainer = document.getElementById('alert-container');
    let alertProgress = document.getElementById('alert-progress');
    let alertIcon = document.querySelector('#alert-content i');
    if (title == 'Success') {
        alertContainer.style.backgroundColor = '#16a085';
        alertProgress.style.backgroundColor = '#55efc4';
        alertIcon.className = 'bi bi-check-circle-fill';
    } else if (title == 'Error') {
        alertContainer.style.backgroundColor = '#c0392b';
        alertProgress.style.backgroundColor = '#ff7675';
        alertIcon.className = 'bi bi-exclamation-triangle-fill';
    }
    alertContainer.style.transition = `all ${show_delay}ms cubic-bezier(0.68, -0.55, 0.265, 1.35)`;
    alertContainer.classList.add('active');
    alertProgress.classList.add('active');
    document.getElementById('alert-title').innerHTML = title;
    document.getElementById('alert-msg').innerHTML = msg;
    alertProgress.style.animation = `progress-down ${progress_delay}ms ${show_delay}ms forwards linear`;
    setTimeout(() => {
        alertContainer.classList.remove('active');
    }, progress_delay + show_delay);
    setTimeout(() => {
        alertProgress.style.animation = '';
    }, progress_delay + (2 * show_delay));
}