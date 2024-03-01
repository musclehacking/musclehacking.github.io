document.addEventListener("DOMContentLoaded", function () {
    var testingFlag = true; // Adjust this flag for testing or production environments

    var cookieUtilities = {
        setCookie: function (name, value, days) {
            if (!testingFlag) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + (value || "") + expires + "; path=/";
            }
        },
        getCookie: function (name) {
            if (!testingFlag) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }
    };

    var displayPopup = function () {
        var popup = document.querySelector(".exit-int-p-up");
        if (popup) {
            popup.style.display = "block"; // Make the popup visible
            popup.classList.add("visible");
            if (!testingFlag) {
                cookieUtilities.setCookie("exitIntentShown", true, 30);
            }
        }
    };

    // Check and set the delay for displaying the popup
    if (testingFlag || window.matchMedia("(max-width: 1439px)").matches) {
        var delayTime = testingFlag ? 2000 : 20000; // 2 seconds for testing, otherwise 20 seconds
        setTimeout(displayPopup, delayTime);
    }

    // Safely add event listener for the close button
    var closeButton = document.querySelector(".closebtn");
    if (closeButton) {
        closeButton.addEventListener("click", function (event) {
            event.preventDefault();
            var popup = document.querySelector(".exit-int-p-up");
            if (popup) {
                popup.classList.remove("visible");
            }
        }, false);
    }

    // Safely add event listener for clicking outside the popup to close it
    var popup = document.querySelector(".exit-int-p-up");
    if (popup) {
        popup.addEventListener("click", function (event) {
            if (event.target === this) {
                event.preventDefault();
                event.stopPropagation();
                this.classList.remove("visible");
            }
        }, false);
    }

    // Add event listener for the Escape key to close the popup
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            var popup = document.querySelector(".exit-int-p-up");
            if (popup) {
                popup.classList.remove("visible");
            }
        }
    });
    // Controls the close button
    document.querySelector(".exit-int-p-up").querySelector("#hide-btn").addEventListener("click", function () { document.querySelector(".exit-int-p-up").style.display = "none"; a = !0 })
});
