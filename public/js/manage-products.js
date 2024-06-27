document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category');
    const categorySearchInput = document.getElementById('category-search');
    const dropdownList = document.querySelector('.dropdown-list');

    const deleteCategoryModal = document.getElementById('delete-category-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const closeModalBtn = document.querySelector('#delete-category-modal .close');

    const deleteProductModal = document.getElementById('delete-product-modal');
    const confirmProductDeleteBtn = document.getElementById('confirm-product-delete');
    const cancelProductDeleteBtn = document.getElementById('cancel-product-delete');
    const closeProductModalBtn = document.querySelector('#delete-product-modal .close');

    const editProductModal = document.getElementById('edit-product-modal');
    const closeEditProductModalBtn = editProductModal.querySelector('.close');
    const editProductForm = document.getElementById('edit-product-form');
    const editProductTitle = document.getElementById('edit-product-title');
    const editProductDescription = document.getElementById('edit-product-description');
    const editProductDetails = document.getElementById('edit-product-details');
    const editProductPrice = document.getElementById('edit-product-price');
    const editProductStock = document.getElementById('edit-product-stock');
    const editProductId = document.getElementById('edit-product-id');

    const editProductImageInput = document.getElementById('edit-product-image');
    const editProductImagePreview = document.getElementById('edit-product-image-preview');
    let categoryToDelete = null;
    let productToDelete = null;

    const errorMessagesDiv = document.getElementById('error-messages');
    const additionalImagesInputContainer = document.getElementById('additionalImagesContainer');
    const additionalImagesInput = document.getElementById('additionalImages');
    const additionalImagesPreview = document.getElementById('additionalImagesPreview');
    const editAdditionalImagesInput = document.getElementById('editAdditionalImages');
    let additionalImagesFiles = [];

    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterCollection = document.getElementById('filter-collection');

    const addCollectionForm = document.getElementById('add-collection-form'); //form to add collection
    const collectionList = document.querySelector('.collection-list'); //list of collections in owner dashboard (for CRUD operations)

    const nameInput = document.getElementById('collection-name');
    const descriptionInput = document.getElementById('description');
    const coverPhotoInput = document.getElementById('coverPhoto');
    const backgroundColorPicker = document.getElementById('backgroundColorPicker');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorInput = document.getElementById('textColor');

    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    const previewCoverPhoto = document.getElementById('preview-cover-photo');
    const collectionPreview = document.getElementById('collection-preview');

    console.log('Script loaded');

    // Add event listeners with logging
    if (nameInput) {
        console.log('Name input found:', nameInput);
        nameInput.addEventListener('input', (e) => {
            console.log('Name input event:', e.target.value);
            updatePreview();
        });
    } else {
        console.error('Name input not found');
    }

    descriptionInput.addEventListener('input', (e) => {
        console.log('Description input event:', e.target.value);
        updatePreview();
    });
    coverPhotoInput.addEventListener('change', (e) => {
        console.log('Cover photo change event:', e.target.value);
        updatePreview();
    });
    backgroundColorInput.addEventListener('input', (e) => {
        console.log('Background color input event:', e.target.value);
        updatePreview();
    });
    textColorInput.addEventListener('input', (e) => {
        console.log('Text color input event:', e.target.value);
        updatePreview();
    });

    function updatePreview() {
        console.log('Updating preview...');

        const nameValue = nameInput.value;
        console.log('Name input value:', nameValue);
        previewName.textContent = nameValue || 'Collection Name';
        console.log('Preview name text:', previewName.textContent);

        const descriptionValue = descriptionInput.value;
        console.log('Description input value:', descriptionValue);
        previewDescription.textContent = descriptionValue || 'Description';
        console.log('Preview description text:', previewDescription.textContent);

        const backgroundColor = backgroundColorInput.value;
        console.log('Background color value:', backgroundColor);
        if (backgroundColor) {
            collectionPreview.style.backgroundColor = `#${backgroundColor}`;
        } else {
            collectionPreview.style.backgroundColor = '#ffffff';
        }
        console.log('Collection preview background color:', collectionPreview.style.backgroundColor);

        const textColor = textColorInput.value;
        console.log('Text color value:', textColor);
        if (textColor) {
            collectionPreview.style.color = `#${textColor}`;
        } else {
            collectionPreview.style.color = '#000000';
        }
        console.log('Collection preview text color:', collectionPreview.style.color);

        const file = coverPhotoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewCoverPhoto.src = e.target.result;
                previewCoverPhoto.style.display = 'block';
                console.log('Cover photo preview updated');
            };
            reader.readAsDataURL(file);
        } else {
            previewCoverPhoto.style.display = 'none';
            console.log('No cover photo selected');
        }
    }

    updatePreview(); // Initial preview update




    // Handling the change event for the additional images
    function handleAdditionalImagesInputChange(e) {
        const newFiles = Array.from(e.target.files);
        newFiles.forEach(file => {
            if (!additionalImagesFiles.some(f => f.name === file.name && f.size === file.size)) {
                additionalImagesFiles.push(file);
                addImagePreview(file, additionalImagesPreview);
            }
        });

        e.target.value = '';
        const newInput = e.target.cloneNode(); //Clones input field to allow more files to be added
        newInput.addEventListener('change', handleAdditionalImagesInputChange);
        e.target.parentNode.replaceChild(newInput, e.target);
    }

    additionalImagesInputContainer.querySelector('input').addEventListener('change', handleAdditionalImagesInputChange);

    // Function to add image preview and handle image removal
    function addImagePreview(file, previewContainer) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgDiv = document.createElement('div');
            imgDiv.classList.add('thumbnail');
            imgDiv.innerHTML = `
                <img src="${e.target.result}" alt="Additional Image">
                <button class="delete-thumbnail">×</button>
            `;
            imgDiv.querySelector('.delete-thumbnail').addEventListener('click', function () {
                imgDiv.remove();
                additionalImagesFiles = additionalImagesFiles.filter(f => f !== file);
            });
            previewContainer.appendChild(imgDiv);
        };
        reader.readAsDataURL(file);
    }

    const editAdditionalImagesPreview = document.getElementById('edit-additional-images-container');
    let editAdditionalImagesFiles = []; // Store the current additional images

    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');

    toggleButton.addEventListener('click', function () {
        sidebar.classList.toggle('minimized');
        if (sidebar.classList.contains('minimized')) {
            toggleButton.textContent = '⮞'; // Change icon to right arrow
        } else {
            toggleButton.textContent = '⮜'; // Change icon to left arrow
        }
    });

    function openEditModal(productId) {
        fetch(`/api/product/${productId}`)
            .then(response => response.json())
            .then(product => {
                editProductId.value = product._id;
                editProductTitle.value = product.name;
                editProductDescription.value = product.description;
                editProductDetails.value = product.details;
                editProductPrice.value = product.price;
                editProductStock.value = product.stockQuantity;
                editProductImagePreview.src = product.imageUrl; // default image if no image exists

                // Display existing additional images
                editAdditionalImagesFiles = product.additionalImages.slice(); // Copy existing additional images to the list
                displayThumbnails(product.imageUrl, product.additionalImages, editAdditionalImagesPreview);
                editProductModal.style.display = 'block';
                resetAdditionalImagesInput();
            })
            .catch(error => {
                console.error('Error fetching product:', error);
            });
    }

    function displayThumbnails(primaryImageUrl, images, container) {
        container.innerHTML = '';

        // Display primary image
        if (primaryImageUrl) {
            const primaryImageDiv = document.createElement('div');
            primaryImageDiv.classList.add('thumbnail');
            primaryImageDiv.innerHTML = `
                <img src="${primaryImageUrl}" alt="Primary Image">
                <button class="delete-thumbnail" data-index="primary">&times;</button>
            `;
            container.appendChild(primaryImageDiv);
        }

        // Display additional images
        images.forEach((imageUrl, index) => {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');
            thumbnailDiv.innerHTML = `
                <img src="${imageUrl}" alt="Product Image">
                <button class="delete-thumbnail" data-index="${index}">&times;</button>
            `;

            container.appendChild(thumbnailDiv);
        });
    }

    function handleEditAdditionalImagesInputChange(e) {
        const newFiles = Array.from(e.target.files);
        newFiles.forEach(file => {
            if (!editAdditionalImagesFiles.some(f => f.name === file.name && f.size === file.size)) {
                editAdditionalImagesFiles.push(file);
                addImagePreview(file, editAdditionalImagesPreview);
            }
        });

        e.target.value = '';
        const newInput = e.target.cloneNode();
        newInput.addEventListener('change', handleEditAdditionalImagesInputChange);
        e.target.parentNode.replaceChild(newInput, e.target);
    }

    editAdditionalImagesInput.addEventListener('change', handleEditAdditionalImagesInputChange);

    document.getElementById('edit-additional-images-container').addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-thumbnail')) {
            const index = e.target.dataset.index;
            const productId = document.getElementById('edit-product-id').value;
            const imageUrl = e.target.previousElementSibling.src.split('/uploads/')[1]; // Extract relative path

            fetch('/delete-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, imageUrl: `/uploads/${imageUrl}` })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    e.target.parentElement.remove(); // Remove the image thumbnail from the DOM

                    // Update the product's additional images in the frontend
                    editAdditionalImagesFiles = editAdditionalImagesFiles.filter(file => file.name !== imageUrl.split('/').pop());
                } else {
                    console.error('Error deleting image:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    function resetAdditionalImagesInput() {
        editAdditionalImagesInput.value = '';
    }

    if (editProductImageInput) {
        // Updates Edit Modal Image Display
        editProductImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    editProductImagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    editProductForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const productId = document.getElementById('edit-product-id').value;

        const fileInput = document.getElementById('edit-product-image');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('edit-product-image', fileInput.files[0]);
        }

        // Append additional images
        editAdditionalImagesFiles.forEach(file => {
            formData.append('editAdditionalImages', file);
        });

        fetch(`/edit-product/${productId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchProducts();
                editProductModal.style.display = 'none';
            } else {
                alert('Error updating product: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the product.');
        });
    });

    // Additional existing code...

    function fetchCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                console.log('Fetched categories:', categories);
                updateCategoryDropdown(categories);
                if (categoryList) updateShopPageCategories(categories);
                updateFilterDropdown(filterCategory, categories);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }


    function fetchCollections() {
        fetch('/api/collections')
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error(data.message || 'Invalid response format');
                }
                console.log('Fetched collections:', data);
                updateCollectionList(data);
                updateFilterDropdown(filterCollection, data);
            })
            .catch(error => {
                console.error('Error fetching collections:', error.message);
            });
    }


    function updateCollectionList(collections) {
        const collectionList = document.querySelector('.collection-list');
        collectionList.innerHTML = ''; // Clear existing collections

        collections.forEach(collection => {
            const collectionDiv = document.createElement('div');
            collectionDiv.className = 'collection-item';
            collectionDiv.dataset.collectionId = collection._id;
            collectionDiv.innerHTML = `
                <img src="${collection.coverPhoto}" alt="${collection.name}">
                <div>
                    <h2>${collection.name}</h2>
                    <p class="description">${collection.description}</p>
                </div>
                <button type="button" class="delete-button" data-id="${collection._id}"><i class="fas fa-trash"></i></button>
            `;
            collectionDiv.style.setProperty('--background-color', `#${collection.backgroundColor}`);
            collectionDiv.style.setProperty('--text-color', `#${collection.textColor}`);
            collectionList.appendChild(collectionDiv);

            const deleteButton = collectionDiv.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => {
                deleteCollection(collection._id, collectionDiv);
            });
        });
    }
    
    fetchCollections();

    function updateCategoryDropdown(categories) {
        if (!dropdownList) return; // Check if the dropdownList exists
        dropdownList.innerHTML = ''; // Clear the dropdown list

        categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = category.name;
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.addEventListener('click', () => {
                categorySearchInput.value = category.name;
                categorySelect.value = category.name;
                dropdownList.classList.remove('visible');
            });

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; //may change to a different one
            deleteButton.className = 'delete-category-button';
            deleteButton.style.marginLeft = '10px';
            deleteButton.dataset.category = category.name;
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                categoryToDelete = category.name;
                deleteCategoryModal.style.display = 'block';
            });

            item.appendChild(deleteButton);
            dropdownList.appendChild(item);
        });
    }

    function updateFilterDropdown(dropdown, items) {
        dropdown.innerHTML = '<option value="">All</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = item.name;
            dropdown.appendChild(option);
        });
    }

    const categoryList = document.querySelector('.categories ul');
    if (categoryList) {
        function updateShopPageCategories(categories) {
            categoryList.innerHTML = '<li><a href="#" class="category-link" data-category="all">All</a></li>'; // Clear existing categories
            categories.forEach(category => {
                const categoryItem = document.createElement('li');
                categoryItem.innerHTML = `<a href="#" class="category-link" data-category="${category.name}">${category.name}</a>`;
                categoryList.appendChild(categoryItem);
            });

            // Attach event listener to the new category links
            const categoryLinks = document.querySelectorAll('.category-link');
            categoryLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const category = this.dataset.category;
                    fetchProducts(category);
                });
            });
        }
    } else {
        console.error('Category list element not found.');
    }

    categorySearchInput?.addEventListener('input', () => {
        const searchTerm = categorySearchInput.value.toLowerCase();
        const items = dropdownList.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            if (item.textContent.toLowerCase().includes(searchTerm) || item.textContent === '+ Add New Category') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        if (searchTerm && !Array.from(items).some(item => item.textContent.toLowerCase() === searchTerm)) {
            newCategoryInput.style.display = 'none';
            newCategoryInput.required = false;
            categorySelect.value = searchTerm;
        }
    });

    categorySearchInput?.addEventListener('focus', () => {
        dropdownList.classList.add('visible');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            dropdownList.classList.remove('visible');
        }
    });

    function fetchProducts(category = '', collection = '', search = '') {
        let url = `/api/products?`;
        if (category) url += `category=${category}&`;
        if (collection) url += `collection=${collection}&`;
        if (search) url += `search=${search}&`;
    
        fetch(url)
            .then(response => response.json())
            .then(products => {
                const productList = document.querySelector('.product-list');
                if (!productList) {
                    console.error('Product list element not found.');
                    return;
                }
    
                const existingProductItems = Array.from(productList.children);
    
                // Mark all existing product items for hiding
                existingProductItems.forEach(item => item.classList.add('hide'));
    
                setTimeout(() => {
                    // Clear existing content after the hiding animation completes
                    productList.innerHTML = '';
    
                    if (products.length === 0) {
                        productList.innerHTML = '<p>No products found.</p>'; // Display a message when no products are found
                        return;
                    }
    
                    products.forEach(product => {
                        const productDiv = document.createElement('div');
                        productDiv.className = 'product-item';
                        productDiv.dataset.productId = product._id;
                        productDiv.innerHTML = `
                        <button type="button" class="edit-product" data-id="${product._id}">
                        <i class="fas fa-edit"></i>
                        </button>
                            <img src="${product.imageUrl}" alt="${product.name}">
                            <h2>${product.name}</h2>
                            <p class="indented"><strong>Price:</strong> $${product.price}</p>
                            <p class="indented"><strong>Category:</strong> ${product.category}</p>
                            <p class="indented"><strong>Collection:</strong> ${product.collectionName}</p>
                            <p class="indented"><strong>Stock:</strong> ${product.stockQuantity ?? 'N/A'}</p> <!-- Added stock quantity -->
                            <form method="POST" action="/delete-product">
                                <input type="hidden" name="productId" value="${product._id}">
                                <button type="button" class="delete-button" data-id="${product._id}"><i class="fas fa-trash"></i></button>
                            </form>
                        `;
    
                        productList.appendChild(productDiv);
    
                        // Trigger the transition
                        setTimeout(() => productDiv.classList.remove('hide'), 10);
                    });
    
                    const deleteButtons = document.querySelectorAll('.delete-button');
                    deleteButtons.forEach(button => {
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            productToDelete = button.dataset.id;
                            deleteProductModal.style.display = 'block';
                        });
                    });
                    // Attach edit event listener
                    const editButtons = document.querySelectorAll('.edit-product');
                    editButtons.forEach(button => {
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            const productId = button.dataset.id;
                            openEditModal(productId);
                        });
                    });
                }, 50); // Match the transition duration
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    document.querySelector('.product-list')?.addEventListener('submit', function (e) {
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
            const form = e.target;

            fetch(form.action, {
                method: 'POST',
                body: new URLSearchParams(new FormData(form))
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const productDiv = form.closest('.product-item');
                        productDiv.remove(); // Remove the product div from the DOM
                    } else {
                        alert('Error deleting product: ' + data.message);
                    }
                })
        }
    });

    fetchCategories();
    fetchCollections();
    fetchProducts();


    // Handle category deletion when confirm button is clicked
    confirmDeleteBtn?.addEventListener('click', () => {
        if (categoryToDelete) {
            confirmDeleteBtn.disabled = true; // Disable the button to prevent multiple clicks
            confirmDeleteBtn.textContent = 'Deleting...'; // Change the text to indicate the deletion is in progress
            fetch(`/delete-category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categoryName: categoryToDelete })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the category from the list
                        const dropdownItems = dropdownList.querySelectorAll('.dropdown-item');
                        dropdownItems.forEach(item => {
                            if (item.textContent === categoryToDelete) {
                                item.remove();
                            }
                        });

                        // Update categories dropdown
                        categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
                        data.categories.forEach(category => {
                            const newOption = document.createElement('option');
                            newOption.value = category.name;
                            newOption.textContent = category.name;
                            categorySelect.appendChild(newOption);
                        });

                        // Update the shop page categories dynamically
                        updateShopPageCategories(data.categories);

                        fetchProducts();

                        deleteCategoryModal.style.display = 'none';
                        categoryToDelete = null;

                    } else {
                        console.error(`Error deleting category: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                })
                .finally(() => {
                    confirmDeleteBtn.disabled = false; // Re-enable the button
                    confirmDeleteBtn.textContent = 'Yes, delete'; // Reset the button text
                    deleteCategoryModal.style.display = 'none'; // Ensure the modal is closed
                    fetchProducts();
                });
        }
    });

    // Close modal when the close button or cancel button is clicked
    closeModalBtn?.addEventListener('click', function () {
        console.log('Close button clicked');
        deleteCategoryModal.style.display = 'none';
        categoryToDelete = null;
    });

    //click outside window
    window.addEventListener('click', function (event) {
        if (event.target === deleteCategoryModal) {
            deleteCategoryModal.style.display = 'none';
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteCategoryModal.style.display = 'none';
        categoryToDelete = null;
    });

    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('inStock');

    function validateForm(event) {
        let valid = true;
        let errorMessage = '';

        const priceValue = parseFloat(priceInput.value);
        const stockValue = parseInt(stockInput.value, 10);

        if (isNaN(priceValue) || priceValue < 0) {
            valid = false;
            errorMessage += 'Price cannot be negative.<br>';
        }

        if (isNaN(stockValue) || stockValue <= 0) {
            valid = false;
            errorMessage += 'Stock quantity must be greater than zero.<br>';
        }

        if (!valid) {
            errorMessagesDiv.innerHTML = errorMessage;
            event.preventDefault();
            if (event.defaultPrevented) {
                return;
            }

        } else {
            errorMessagesDiv.innerHTML = '';
        }
    }
    
    


    // Add a collection to the collections page after the owner clicks the "add collection" button
    addCollectionForm.addEventListener('submit', function(e) { 
        e.preventDefault();

        const formData = new FormData(this);

        fetch('/add-collection', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(text => {
            console.log('REsponse text:', text);
            return JSON.parse(text);
        })
            .then(data => {
                if (data.success) {
                    this.reset();
                    backgroundColorPicker.value = '#000000'; // Reset color picker
                    backgroundColorInput.value = ''; // Reset the hidden color input

                    textColorPicker.value = '#000000';
                    textColorInput.value = '';
                

                    const collection = data.collection;
                    const collectionDiv = document.createElement('div');
                    collectionDiv.className = 'collection-item';
                    collectionDiv.dataset.collectionId = collection._id;
                    collectionDiv.innerHTML = `
                        <img src="${collection.coverPhoto}" alt="${collection.name}">
                        <div>
                            <h2>${collection.name}</h2>
                            <p class="description">${collection.description}</p>
                        </div>
                        <button type="button" class="delete-button" data-id="${collection._id}"><i class="fas fa-trash"></i></button>
                    `;
                    collectionDiv.style.setProperty('--text-color', '#${collection.textColor}');
                    collectionDiv.style.setProperty('--background-color', `#${collection.backgroundColor}`);
                    collectionList.appendChild(collectionDiv);

                    const deleteButton = collectionDiv.querySelector('.delete-button');
                    deleteButton.addEventListener('click', () => {
                        deleteCollection(collection._id, collectionDiv);
                });

                } else {
                    alert('Error adding collection: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred whle adding the collection.');
            });
        
    });

    // Delete collection in the owner dashboard
    function deleteCollection(collectionId, collectionDiv) {
        fetch('/delete-collection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collectionId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                collectionDiv.remove();
            } else {
                alert('Error deleting collection: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the collection.');
        });
    }



    // Prevent Enter key from submitting the form and opening the modal
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const formElements = Array.from(this.elements);
                const currentIndex = formElements.indexOf(document.activeElement);
                if (currentIndex >= 0 && currentIndex < formElements.length - 1) {
                    e.preventDefault();
                    formElements[currentIndex + 1].focus();
                }
            }
        });
    }

    // ADD PRODUCT FORM
    addProductForm.addEventListener('submit', function (e) {
        e.preventDefault();

        validateForm(e);

        const formData = new FormData(this);

        if (categorySearchInput.value) {
            formData.set('category', categorySearchInput.value);
        }

        additionalImagesFiles.forEach(file => {
            formData.append('additionalImages', file);
        });

        console.log('FormData before sending:', Array.from(formData.entries()));

        fetch('/add-product', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.reset();
                    additionalImagesFiles = []; // Clear the additional images files array
                    additionalImagesInput.value = ''; // Clear the input value to allow re-upload of the same file if needed
                    additionalImagesPreview.innerHTML = '';
                    categorySearchInput.value = '';
                    dropdownList.classList.remove('visible');

                    const product = data.product;
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product-item';
                    productDiv.dataset.productId = product._id;
                    productDiv.innerHTML = `
                    <button type="button" class="edit-product" data-id="${product._id}">
                    <i class="fas fa-edit"></i>
                    </button>
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p class="indented"><strong>Price:</strong> $${product.price}</p>
                        <p class="indented"><strong>Category:</strong> ${product.category}</p>
                        <p class="indented"><strong>Stock:</strong> ${product.stockQuantity ?? 'N/A'}</p> <!-- Added stock quantity -->
                        <form method="POST" action="/delete-product">
                            <input type="hidden" name="productId" value="${product._id}">
                            <button type="button" class="delete-button" data-id="${product._id}"><i class="fas fa-trash"></i></button>
                        </form>
                    `;

                    document.querySelector('.product-list').appendChild(productDiv);

                    // Attach delete event listener
                    const deleteButton = productDiv.querySelector('.delete-button');
                    deleteButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        productToDelete = deleteButton.dataset.id;
                        deleteProductModal.style.display = 'block';
                    });

                    // Attach edit event listener
                    const editButton = productDiv.querySelector('.edit-product');
                    editButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        const productId = editButton.dataset.id;
                        openEditModal(productId);
                    });

                    // Fetch and update categories
                    fetchCategories();
                    fetchProducts();

                } else {
                    alert('Error adding product: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding the product (manage-products).');
            });
    });

    // Handle product deletion when confirm button is clicked
    if (confirmProductDeleteBtn) {
        confirmProductDeleteBtn.addEventListener('click', () => {
            if (productToDelete) {
                confirmProductDeleteBtn.disabled = true; // Disable the button to prevent multiple clicks
                confirmProductDeleteBtn.textContent = 'Deleting...'; // Change the text to indicate the deletion is in progress
                fetch(`/delete-product`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId: productToDelete })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Remove the product from the list
                            const productItems = document.querySelectorAll('.product-item');
                            productItems.forEach(item => {
                                if (item.dataset.productId === productToDelete) {
                                    item.remove();
                                }
                            });
                            console.log(`Product "${productToDelete}" deleted successfully.`);

                            fetchProducts();

                            deleteProductModal.style.display = 'none';
                            productToDelete = null;

                        } else {
                            console.error(`Error deleting product: ${data.message}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
                    .finally(() => {
                        confirmProductDeleteBtn.disabled = false; // Re-enable the button
                        confirmProductDeleteBtn.textContent = 'Yes, delete'; // Reset the button text
                        deleteProductModal.style.display = 'none'; // Ensure the modal is closed
                        fetchProducts();
                    });
            }
        });
    }

    if (closeProductModalBtn) {
        // Close product modal when the close button or cancel button is clicked
        closeProductModalBtn.addEventListener('click', function () {
            deleteProductModal.style.display = 'none';
            productToDelete = null;
        });
    }

    window.addEventListener('click', function (event) {
        if (event.target === deleteProductModal) {
            deleteProductModal.style.display = 'none';
        }
    });

    if (cancelProductDeleteBtn) {
        cancelProductDeleteBtn.addEventListener('click', () => {
            deleteProductModal.style.display = 'none';
            productToDelete = null;
        });
    }

    // Function to display additional images as thumbnails
    function displayThumbnails(images, primaryImageUrl, container) {
        container.innerHTML = '';

        // Display primary image
        if (primaryImageUrl) {
            const primaryImageDiv = document.createElement('div');
            primaryImageDiv.classList.add('thumbnail');
            primaryImageDiv.innerHTML = `
                <img src="${primaryImageUrl}" alt="Primary Image">
                <button class="delete-thumbnail" data-index="primary">&times;</button>
            `;
            container.appendChild(primaryImageDiv);
        }

        images.forEach((imageUrl, index) => {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');
            thumbnailDiv.innerHTML = `
            <img src="${imageUrl}" alt="Product Image">
                <button class="delete-thumbnail" data-index="${index}">&times;</button>
            `;

            container.appendChild(thumbnailDiv);
        });
    }

    // Open Edit Modal
    function openEditModal(productId) {
        fetch(`/api/product/${productId}`)
            .then(response => response.json())
            .then(product => {
                editProductId.value = product._id;
                editProductTitle.value = product.name;
                editProductDescription.value = product.description;
                editProductDetails.value = product.details;
                editProductPrice.value = product.price;
                editProductStock.value = product.stockQuantity;
                editProductImagePreview.src = product.imageUrl; // default image if no image exists
                displayThumbnails(product.additionalImages, null, editAdditionalImagesPreview);
                editProductModal.style.display = 'block';
                resetAdditionalImagesInput();
            })
            .catch(error => {
                console.error('Error fetching product:', error);
            });
    }

    document.getElementById('edit-additional-images-container').addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-thumbnail')) {
            const index = e.target.dataset.index;
            const productId = document.getElementById('edit-product-id').value;
            const imageUrl = e.target.previousElementSibling.src.split('/uploads/')[1]; // Extract relative path

            fetch('/delete-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, imageUrl: `/uploads/${imageUrl}` })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    e.target.parentElement.remove(); // Remove the image thumbnail from the DOM

                    // Update the product's additional images in the frontend
                    const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
                    if (productItem) {
                        const additionalImagesContainer = productItem.querySelector('.additional-images-container');
                        if (additionalImagesContainer) {
                            const imageElement = additionalImagesContainer.querySelector(`img[src="${data.imageUrl}"]`);
                            if (imageElement) {
                                imageElement.parentElement.remove(); // Remove image from product tile
                            }
                        }
                    }
                } else {
                    console.error('Error deleting image:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
                
            fetch(`/api/product/${productId}`)
                .then(response => response.json())
                .then(product => {
                    product.additionalImages.splice(index, 1); // Remove the image from the list
                    displayThumbnails(product.additionalImages, editAdditionalImagesPreview);
                })
                .catch(error => {
                    console.error('Error fetching product:', error);
                });
        }
    });

    document.getElementById('editAdditionalImages').addEventListener('change', function () {
        const additionalImagesPreview = document.getElementById('edit-additional-images-container');
        additionalImagesPreview.innerHTML = '';
        Array.from(this.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgDiv = document.createElement('div');
                imgDiv.classList.add('thumbnail');
                imgDiv.innerHTML = `
                  <img src="${e.target.result}" alt="Additional Image">
                  <button class="delete-thumbnail">×</button>
                `;
                imgDiv.querySelector('.delete-thumbnail').addEventListener('click', function () {
                    imgDiv.remove();
                });
                additionalImagesPreview.appendChild(imgDiv);
            };
            reader.readAsDataURL(file);
        });
    });

    if (editProductImageInput) {
        // Updates Edit Modal Image Display
        editProductImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log('Image file read successfully:', e.target.result);
                    editProductImagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    editProductForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const productId = document.getElementById('edit-product-id').value;

        const fileInput = document.getElementById('edit-product-image');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('edit-product-image', fileInput.files[0]);
        }

        // Append additional images
        const additionalImagesInput = document.getElementById('editAdditionalImages');
        for (let i = 0; i < additionalImagesInput.files.length; i++) {
            formData.append('editAdditionalImages', additionalImagesInput.files[i]);
        }

        fetch(`/edit-product/${productId}`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchProducts();
                    editProductModal.style.display = 'none';
                } else {
                    alert('Error updating product: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the product.');
            });
    });
    

    if (closeEditProductModalBtn) {
        // Close edit modal when the close button is clicked
        closeEditProductModalBtn.addEventListener('click', function () {
            editProductModal.style.display = 'none';
            resetAdditionalImagesInput();
        });
    }

    // Click outside window to close the edit modal
    window.addEventListener('click', function (event) {
        if (event.target === editProductModal) {
            editProductModal.style.display = 'none';
            resetAdditionalImagesInput();
        }
    });

   // Event listeners to trigger instant updates
    searchInput.addEventListener('input', () => {
        const search = searchInput.value;
        const category = filterCategory.value;
        const collection = filterCollection.value;
        fetchProducts(category, collection, search);
    });

    filterCategory.addEventListener('change', () => {
        const category = filterCategory.value;
        const collection = filterCollection.value;
        const search = searchInput.value;
        fetchProducts(category, collection, search);
    });

    filterCollection.addEventListener('change', () => {
        const collection = filterCollection.value;
        const category = filterCategory.value;
        const search = searchInput.value;
        fetchProducts(category, collection, search);
    });


    


});
