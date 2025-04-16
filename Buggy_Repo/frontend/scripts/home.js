//Why was this file created???
//Why did I do this???
//I don't know...
//
//Is there some use for this... hmmm...

// Wait for the DOM to be fully loaded before executing any JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Home page loaded');
    
    // Cache DOM elements for better performance
    const featuredProducts = document.querySelector('.featured-products');
    const navLinks = document.querySelectorAll('.nav-link');
    const searchForm = document.querySelector('#search-form');
    const loginButton = document.querySelector('#login-button');
    const registerButton = document.querySelector('#register-button');
    
    // Initialize the page
    loadFeaturedProducts();
    setupEventListeners();
    
    // Function to fetch and display featured products
    function loadFeaturedProducts() {
        fetch('/api/products/featured')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayProducts(data);
            })
            .catch(error => {
                console.error('Error fetching featured products:', error);
                featuredProducts.innerHTML = '<p>Unable to load products at this time.</p>';
            });
    }
    
    // Function to display products in the UI
    function displayProducts(products) {
        if (!featuredProducts) return;
        
        featuredProducts.innerHTML = '';
        
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('product-card');
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="price">$${product.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            featuredProducts.appendChild(productElement);
        });
        
        // Add event listeners to the newly created Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }
    
    // Function to handle adding products to cart
    function addToCart(event) {
        const productId = event.target.getAttribute('data-id');
        
        fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Product added to cart!');
                updateCartCounter();
            } else {
                showNotification('Failed to add product to cart', 'error');
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            showNotification('An error occurred', 'error');
        });
    }
    
    // Update the cart item counter in the navbar
    function updateCartCounter() {
        fetch('/api/cart/count')
            .then(response => response.json())
            .then(data => {
                const cartCounter = document.querySelector('.cart-count');
                if (cartCounter) {
                    cartCounter.textContent = data.count;
                }
            })
            .catch(error => console.error('Error updating cart count:', error));
    }
    
    // Show notification to user
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 10);
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Navigation menu highlighting
        if (navLinks) {
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
        
        // Search form
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchInput = this.querySelector('input').value.trim();
                
                if (searchInput) {
                    window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
                }
            });
        }
        
        // Auth buttons
        if (loginButton) {
            loginButton.addEventListener('click', function() {
                window.location.href = '/login';
            });
        }
        
        if (registerButton) {
            registerButton.addEventListener('click', function() {
                window.location.href = '/register';
            });
        }
        
        // Handle scroll events
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    }
});