document.addEventListener("DOMContentLoaded", function () {
    // Select all forms with the 'g-recaptcha' attribute
    var forms = document.querySelectorAll('form[g-recaptcha]');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            grecaptcha.ready(function () {
                grecaptcha.execute('6LefmJ4pAAAAAH9NbYF2SxW-8E7fTTl51IG1Rny8', { action: 'submit' }).then(function (token) {
                    var formData = new FormData(form);
                    formData.append('g-recaptcha-response', token);
                    fetch(form.action, {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                window.location.href = data.thankYouUrl;
                            } else {
                                alert('Submission failed. Please try again.');
                            }
                        })
                        .catch(error => alert('There was an error processing your request. Please try again.'));
                });
            });
        });
    });
});