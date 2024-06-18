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
                    <p class="details">${product.details}</p>
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
    const modalDetails = document.getElementById('modalDetails');
    const modalAddToCart = document.getElementById('modalAddToCart');
    const closeButton = document.querySelector('.product-modal .close');

    function openModal(product) {
        productModal.style.display = 'block';
        modalImage.src = product.imageUrl;
        modalTitle.innerText = product.name;
        modalPrice.innerText = `$${product.price}`;
        modalDescription.innerText = product.description;
        modalDetails.innerText = product.details;
        modalAddToCart.dataset.id = product._id;
    }

    closeButton.addEventListener('click', function() {
      console.log('Close button clicked');
      productModal.style.display = 'none';
  });

    window.addEventListener('click', function(event) {
      if (event.target === productModal) {
          console.log('Outside modal clicked');
          productModal.style.display = 'none';
      }
    });

    
});
  