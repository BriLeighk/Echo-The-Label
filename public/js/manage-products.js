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

    const descriptionTextArea = document.getElementById('description');
    const detailsTextArea = document.getElementById('details');
    const errorMessagesDiv = document.getElementById('error-messages');

    //Attach the input event listener to adjust the height as the user types

    descriptionTextArea?.addEventListener('input', function () {
        autoExpandTextarea(descriptionTextArea);
    });

    detailsTextArea?.addEventListener('input', function () {
        autoExpandTextarea(detailsTextArea);
    })

    //Initial call to adjust the height when the page loads
    autoExpandTextarea(descriptionTextArea);
    autoExpandTextarea(detailsTextArea);


    //Function to automatically adjust the height of the textArea
    function autoExpandTextarea(element) {
        element.style.height = 'auto';
        element.style.height = (element.scrollHeight) + 'px';
    }

    
    // Fetch categories
    function fetchCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                console.log('Fetched categories:', categories);
                updateCategoryDropdown(categories);
                if (categoryList) updateShopPageCategories(categories);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }

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

    function fetchProducts(category = '') {
        fetch(`/api/products${category ? `?category=${category}` : ''}`)
            .then(response => response.json())
            .then(products => {
                const productList = document.querySelector('.product-list');
                if (!productList) {
                    console.error('Product list element not found.');
                    return;
                }
                productList.innerHTML = ''; // Clear existing content

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
                        <p class="indented"><strong>Stock:</strong> ${product.stockQuantity ?? 'N/A'}</p> <!-- Added stock quantity -->
                        <form method="POST" action="/delete-product">
                            <input type="hidden" name="productId" value="${product._id}">
                            <button type="button" class="delete-button" data-id="${product._id}"><i class="fas fa-trash"></i></button>
                        </form>
                    `;
                    productList.appendChild(productDiv);
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

        console.log('Form data before submission:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        if (categorySearchInput.value) {
            formData.set('category', categorySearchInput.value);
        }

        fetch('/add-product', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response from adding product:', data);
                if (data.success) {
                    this.reset();
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
                editProductModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching product:', error);
            });
    }

    if (editProductImageInput) {
        // Updates Edit Modal Image Display
        editProductImageInput.addEventListener('change', function() {
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

    if (editProductForm) {
        // Handle Edit Product Form Submission
        editProductForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const productId = editProductId.value;

            const fileInput = document.getElementById('edit-product-image');
            if (fileInput && fileInput.files.length > 0) {
                formData.append('edit-product-image', fileInput.files[0]);
            }
            
            fetch(`/edit-product/${productId}`, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
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
    }

    
    if (closeEditProductModalBtn) {
        // Close edit modal when the close button is clicked
        closeEditProductModalBtn.addEventListener('click', function () {
            editProductModal.style.display = 'none';
        });
    }
    

    // Click outside window to close the edit modal
    window.addEventListener('click', function (event) {
        if (event.target === editProductModal) {
            editProductModal.style.display = 'none';
        }
    });

});
