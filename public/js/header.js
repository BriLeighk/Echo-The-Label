document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const profileIcons = document.querySelectorAll(".profile-icon");
    const loginModal = document.getElementById("loginModal");
    const createAccountModal = document.getElementById("createAccountModal");
    const closeButtons = document.querySelectorAll(".close");
    const createAccountBtn = document.getElementById("createAccountBtn");
    const signInBtn = document.getElementById("signInBtn");

    const menuBtn = document.getElementById('menu-btn');
    const menuPopup = document.getElementById('menu-popup');
    const closeBtn = document.getElementById('close-btn');
    const homeIcons = document.querySelectorAll('.home-icon a, .echo-text');


    menuBtn.addEventListener('click', function() {
        menuPopup.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        menuPopup.style.display = 'none';
    });

    // Close the menu popup if the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (event.target === menuPopup) {
            menuPopup.style.display = 'none';
        }
    });

    // Redirect to the home page when the home button or Echo text is clicked
    homeIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/home';
        });
    });

        profileIcons.forEach(icon => {
            icon.addEventListener("click", function(e) {
                e.preventDefault();
                checkLoginStatus(loggedIn => {
                    if (loggedIn) {
                        window.location.href = '/dashboard';
                    } else {
                        loginModal.style.display = 'block';
                    }
                });
            });
        });

    //checks if user is logged in via placeholder check (checking cookies)
    // Function to check login status
    function checkLoginStatus(callback) {
        fetch('/api/check-login')
            .then(response => response.json())
            .then(data => {
                callback(data.loggedIn);
            })
            .catch(error => {
                console.error('Error checking login status:', error);
                callback(false);
            });
    }

    // Clear modal fields and error messages
    function clearModal(modal) {
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => input.value = '');

        const errorMessages = modal.querySelectorAll('.error-message');
        errorMessages.forEach(errorMessage => errorMessage.textContent = '');
    }
    

    closeButtons.forEach(button => {
        button.addEventListener("click", function() {
            loginModal.style.display = "none";
            createAccountModal.style.display = "none";
            clearModal(loginModal);
            clearModal(createAccountModal);
        });
    });

    createAccountBtn.addEventListener("click", function() {
        loginModal.style.display = "none";
        createAccountModal.style.display = "block";
        clearModal(loginModal);
    });

    signInBtn.addEventListener("click", function() {
        createAccountModal.style.display = "none";
        loginModal.style.display = "block";
        clearModal(createAccountModal);
    });

    

    window.addEventListener("click", function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = "none";
            clearModal(loginModal);
        }
        if (event.target == createAccountModal) {
            createAccountModal.style.display = "none";
            clearModal(createAccountModal);
        }
    });

    // Handle login form submission
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        loginError.textContent = ''; //Clear previous error message

        const formData = new FormData(loginForm);


        fetch('/login', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectUrl;
            } else {
                loginError.textContent = data.message; // Display new error message
            }
        });
    });


    // Handle create account form submission
    const createAccountForm = document.getElementById("createAccountForm");
    const createAccountError = document.getElementById("createAccountError");

    createAccountForm.addEventListener("submit", function(e) {
        e.preventDefault();
        createAccountError.textContent = ''; // Clear previous error message

        const formData = new FormData(createAccountForm);
        
        fetch('/create-account', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("createAccountModal").style.display = 'none';
                loginModal.style.display = 'block';
                createAccountForm.reset();
                createAccountError.textContent = '';
            } else {
                createAccountError.textContent = data.message; // Display new error message
            }
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('loginModal')) {
            document.getElementById('loginModal').style.display = 'none';
            clearModal(loginModal);
        }
        if (event.target == document.getElementById('createAccountModal')) {
            document.getElementById('createAccountModal').style.display = 'none';
            clearModal(createAccountModal);
        }
    });

    // Handle the close button for the login modal
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('createAccountModal').style.display = 'none';
            clearModal(loginModal);
            clearModal(createAccountModal);
        });
    });

    fetch('/partials/header')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));
        
});
