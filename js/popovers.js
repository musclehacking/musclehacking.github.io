document.addEventListener("DOMContentLoaded", function() {
    // The code below initialises popovers with default hover behavior
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'hover'
        });
    });
});