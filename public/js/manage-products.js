document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category');
    const categorySearchInput = document.getElementById('category-search');
    const dropdownList = document.querySelector('.dropdown-list');

    // Fetch categories
    function fetchCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                console.log('Fetched categories:', categories);
                dropdownList.innerHTML = ''; // Clear the dropdown list

                categories.forEach(category => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.textContent = category.name;
                    item.addEventListener('click', () => {
                        categorySearchInput.value = category.name;
                        categorySelect.value = category.name;
                        dropdownList.classList.remove('visible');
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.className = 'delete-category-button';
                    deleteButton.dataset.id = category._id;
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteCategory(category._id);
                    });

                    item.appendChild(deleteButton);
                    dropdownList.appendChild(item);
                });

                const addNewItem = document.createElement('div');
                addNewItem.className = 'dropdown-item';
                addNewItem.textContent = '+ Add New Category';
                addNewItem.addEventListener('click', () => {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.required = true;
                    categorySearchInput.value = '';
                    categorySearchInput.focus();
                });
                dropdownList.appendChild(addNewItem);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }

    function deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category? This will remove all products under this category.')) {
            fetch(`/delete-category/${categoryId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Category deleted successfully.');
                        fetchCategories();
                        fetchProducts();
                    } else {
                        alert('Error deleting category: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error deleting category:', error);
                    alert('An error occurred while deleting the category.');
                });
        }
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

    function fetchProducts() {
        fetch('/api/products')
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
                .catch(error => {
                    console.error('Error deleting product:', error);
                    alert('An error occurred while deleting the product.');
                });
        }
    });

    fetchCategories();
    fetchProducts();

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

                    if (data.newCategory) {
                        const newOption = document.createElement('option');
                        newOption.value = data.newCategory.name;
                        newOption.textContent = data.newCategory.name;
                        categorySelect.insertBefore(newOption, categorySelect.lastElementChild);

                        const categoryList = document.querySelector('.categories ul');
                        const categoryItem = document.createElement('li');
                        categoryItem.innerHTML = `<a href="#" class="category-link" data-category="${data.newCategory.name}">${data.newCategory.name}</a>`;
                        categoryList.appendChild(categoryItem);

                        categoryItem.querySelector('a').addEventListener('click', function (e) {
                            e.preventDefault();
                            const category = this.dataset.category;
                            fetchProducts(category);
                        });
                    }
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
