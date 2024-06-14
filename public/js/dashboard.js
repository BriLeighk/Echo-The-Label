document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-link');
    const contentPages = document.querySelectorAll('.content-page');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                contentPages.forEach(page => page.classList.remove('active'));
                document.getElementById(page).classList.add('active');
            }
        });
    });

    document.getElementById('sign-out').addEventListener('click', function() {
        fetch('/logout')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                window.location.href = data.redirectUrl;
                } else {
                alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
                alert('Failed to log out');
      });
    });
        
    document.getElementById('addCollectionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
    
        fetch('/add-collection', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Collection added successfully!');
                addCollectionForm.reset();
            } else {
            alert('Error adding collection: ' + data.message);
            }
        });
    

    });
});
