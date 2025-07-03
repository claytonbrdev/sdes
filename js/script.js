// Script principal - funcionalidades gerais do sistema

document.querySelectorAll('.sidebar > ul > li > a').forEach(function(menuItem) {
  menuItem.addEventListener('click', function(e) {
    const submenu = this.nextElementSibling;
    if (submenu && submenu.classList.contains('submenu')) {
      e.preventDefault();
      submenu.classList.toggle('show');
    }
  });
});