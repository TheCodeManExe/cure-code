function applyInitialStyles() {
    const elements = document.querySelectorAll('body');

    elements.forEach(element => {
        element.style.opacity = '1';
    });


    checkVisibility();
}

window.addEventListener('load', applyInitialStyles);

window.addEventListener('beforeunload', function(event){
    const elements = document.querySelectorAll('body');

    elements.forEach(element => {
        element.style.opacity = '0';
    });
})