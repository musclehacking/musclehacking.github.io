document.addEventListener("DOMContentLoaded", function () { var a = !1; window.addEventListener("scroll", function () { a || (660 < pageYOffset ? document.getElementById("floating-em-opt").setAttribute("style", "opacity: 1; visibility: visible;") : document.getElementById("floating-em-opt").setAttribute("style", "opacity: 0; visibility: hidden;")) }); document.getElementById("floating-em-opt").querySelector("#hide-btn").addEventListener("click", function () { document.getElementById("floating-em-opt").style.display = "none"; a = !0 }) });