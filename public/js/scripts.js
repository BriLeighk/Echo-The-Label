
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    //Section One////////////////////////////////////////////
    const startButton = document.getElementById("start-button");
    const hero = document.getElementById("hero");
    const heroContent = document.querySelector(".hero-content");
    const aboutSection = document.getElementById("about");
    const footer = document.querySelector("footer");
    const header = document.querySelector("header");

    // Function to show home content
    function showHomeContent() {
        aboutSection.classList.remove('hidden');
        footer.classList.remove('hidden');
        aboutSection.classList.add('show');
        footer.classList.add('show');
    }
    

    // Section One
    startButton?.addEventListener("click", function(e) {
        e.preventDefault();
        hero.classList.add("shrink");
        heroContent.classList.add("shrink");
        header.style.opacity = 1;
        header.style.pointerEvents = "all";
        showHomeContent();

        setTimeout(() => {
            startButton.textContent = "Shop Now";
            startButton.setAttribute("href", "shop.html");
        }, 2500); // Match the transition duration
    });

    // Handles button functionalities (home button)
    document.querySelector('.home-button')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/home';
    });


    //Section Two////////////////////////////////////////////
    const menuBtn = document.getElementById('menu-btn');
    const menuPopup = document.getElementById('menu-popup');
    const closeBtn = document.getElementById('close-btn');
    

    //Section Two /////////////////////////////////////
    menuBtn?.addEventListener('click', function() {
        menuPopup.style.display = 'block';
    });

    closeBtn?.addEventListener('click', function() {
        menuPopup.style.display = 'none';
    });

    // Close the menu popup if the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (event.target === menuPopup) {
            menuPopup.style.display = 'none';
        }
    });

    // Handle scroll to about section
    document.getElementById('about-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.location.pathname === '/home') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/home#about';
        }
    });

    // Smooth scroll to about section if coming from another page
    if (window.location.hash === '#about') {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    }
    
});