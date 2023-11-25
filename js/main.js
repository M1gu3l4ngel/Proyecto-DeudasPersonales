//-----------------------------------------------
// Dark/Light Mode
//-----------------------------------------------
const checkbox = document.querySelector('input[name=mode]');

checkbox.addEventListener('change', function () {
    trans();
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('data-theme', theme);
});

let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition');
    }, 1000);
}

const storedTheme = localStorage.getItem('data-theme');
if (storedTheme) {
    document.documentElement.dataset.theme = storedTheme;
}
//-----------------------------------------------

//-----------------------------------------------
// Iniciar AOSAnimation
//-----------------------------------------------
AOS.init({
    easing: 'ease-out-back', duration: 2000
})
//-----------------------------------------------