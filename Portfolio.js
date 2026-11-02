/* ========================================
   Adiviking Portfolio Script
   Works with OurWork.html + admin.html
======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ---------- Mobile Menu ----------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // ---------- Project Filtering ----------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.getElementById('projectsGrid');

    if (filterButtons.length && projectsGrid) {
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterButtons.forEach(function (btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');
                const cards = projectsGrid.querySelectorAll('.project-card');

                cards.forEach(function (card) {
                    const category = card.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(function () {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(function () {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ---------- Smooth style for cards ----------
    document.querySelectorAll('.project-card').forEach(function (card) {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });

});