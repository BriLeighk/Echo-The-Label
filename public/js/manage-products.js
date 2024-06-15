document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category');
    const categorySearchInput = document.getElementById('category-search');
    const dropdownList = document.querySelector('.dropdown-list');
    
    const deleteCategoryModal = document.getElementById('delete-category-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const closeModalBtn = document.querySelector('.modal .close');
    let categoryToDelete = null;

    // Fetch categories
    function fetchCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                console.log('Fetched categories:', categories);
                updateCategoryDropdown(categories);
                updateShopPageCategories(categories);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }

    function updateCategoryDropdown(categories) {
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

    function updateShopPageCategories(categories) {
        const categoryList = document.querySelector('.categories ul');
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

    categorySearchInput.addEventListener('input', () => {
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

    categorySearchInput.addEventListener('focus', () => {
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
                productList.innerHTML = ''; // Clear existing content

                products.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product-item';
                    productDiv.dataset.productId = product._id;
                    productDiv.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p class="indented"><strong>Description:</strong> ${product.description}</p>
                        <p class="indented"><strong>Price:</strong> $${product.price}</p>
                        <p class="indented"><strong>Category:</strong> ${product.category}</p>
                        <form method="POST" action="/delete-product">
                            <input type="hidden" name="productId" value="${product._id}">
                            <button type="submit" class="delete-button"><i class="fas fa-trash"></i></button>
                        </form>
                    `;
                    productList.appendChild(productDiv);
                });
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    document.querySelector('.product-list').addEventListener('submit', function (e) {
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
    confirmDeleteBtn.addEventListener('click', () => {
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
                        console.message(`Category "${categoryToDelete}" deleted successfully.`);
                        

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
    closeModalBtn.addEventListener('click', () => {
        deleteCategoryModal.style.display = 'none';
        categoryToDelete = null;
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteCategoryModal.style.display = 'none';
        categoryToDelete = null;
    });

    document.getElementById('add-product-form').addEventListener('submit', function (e) {
        e.preventDefault();
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
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p class="indented"><strong>Description:</strong> ${product.description}</p>
                        <p class="indented"><strong>Price:</strong> $${product.price}</p>
                        <p class="indented"><strong>Category:</strong> ${product.category}</p>
                        <form method="POST" action="/delete-product">
                            <input type="hidden" name="productId" value="${product._id}">
                            <button type="submit" class="delete-button"><i class="fas fa-trash"></i></button>
                        </form>
                    `;
                    
                    document.querySelector('.product-list').appendChild(productDiv);

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
});
