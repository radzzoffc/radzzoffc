function toggleMenu() {
      const menu = document.getElementById('nav-menu');
      menu.classList.toggle('active');
    }

    document.addEventListener('click', function(event) {
      const isClickInside = document.querySelector('nav').contains(event.target);
      if (!isClickInside) {
        document.getElementById('nav-menu').classList.remove('active');
      }
    });