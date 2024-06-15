document.addEventListener('DOMContentLoaded', function() {
  function fetchProducts(category = 'all') {
    fetch(`/api/products?category=${category}`)
        .then(response => response.json())
        .then(products => {
            const productsDiv = document.querySelector('.products');
            productsDiv.innerHTML = ''; // Clear existing content
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p class="price">$${product.price}</p>
                    <p class="description">${product.description}</p>
                    <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
                `;
                productsDiv.appendChild(productDiv);

                productDiv.addEventListener('click', () => openModal(product));
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
    }

    fetchProducts();

    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            fetchProducts(category);
        });
    });

  
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('add-to-cart')) {
        const productId = e.target.getAttribute('data-id');
        fetch('/api/add-to-cart', {
          method: 'POST',
          body: JSON.stringify({ productId }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Product added to cart!');
          } else {
            alert('Error adding product to cart');
          }
        });
      }
    });


    const productModal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalAddToCart = document.getElementById('modalAddToCart');
    const closeModalBtns = document.querySelectorAll('.modal .close');

    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          productModal.style.display = 'none';
      });
  });

    function openModal(product) {
        productModal.style.display = 'block';
        modalImage.src = product.imageUrl;
        modalTitle.innerText = product.name;
        modalPrice.innerText = `$${product.price}`;
        modalDescription.innerText = product.description;
        modalAddToCart.dataset.id = product._id;
    }

    span.onclick = function() {
        productModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == productModal) {
            productModal.style.display = 'none';
        }
    }
});
  