if (document.getElementById('back-to-top')) {
  var scrollTrigger = 1000;

  var backToTop = function() {
    if (window.scrollY > scrollTrigger) {
      document.getElementById('back-to-top').classList.add('show');
    } else {
      document.getElementById('back-to-top').classList.remove('show');
    }
  };

  function scrollToTop(o) {
    var scrollHeight = window.scrollY,
        scrollStep = Math.PI / (o / 15),
        cosParameter = scrollHeight / 2,
        l,
        r = 0,
        c = setInterval(function() {
          if (window.scrollY != 0) {
            r += 1;
            l = cosParameter - cosParameter * Math.cos(r * scrollStep);
            window.scrollTo(0, scrollHeight - l);
          } else {
            clearInterval(c);
          }
        }, 15);
  }

  backToTop();
  window.addEventListener('scroll', function() {
    backToTop();
  });
}