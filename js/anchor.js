anchors.options = {
    placement: 'left',
    visible: 'always'
};
anchors.add('.post-body h2, #how-to-use,.post-body h3:not(#share-t,#comm-t),.post-body h4,.post-body h5')
document.addEventListener('DOMContentLoaded', (event) => {
    click_to_copy_to_clipboard();
    function click_to_copy_to_clipboard() {
        var anchors = document.getElementsByClassName("anchorjs-link");
        for (i = 0; i < anchors.length; i++) {
            anchors[i].addEventListener("click", function (e) {
                e.preventDefault();

                var baseURL = location.origin + location.pathname;
                var fragment = this.getAttribute("href");
                var link = baseURL + fragment;

                copyToClipboard(link);
            });
        }
        document.getElementById("l-box").addEventListener("click", function (e) {
            e.preventDefault();
            var pageurl = [location.protocol, '//', location.host, location.pathname].join('');
            copyToClipboard(pageurl);
        });
    }
    function copyToClipboard(text) {
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }
    tippy('.anchorjs-link', {
        content: 'Click to Copy',
        hideOnClick: true,
        touch: false,
        animation: 'shift-toward-extreme',
        theme: 'muscle',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
        offset: [0, 0],
        delay: 50
    });
    tippy('.anchorjs-link', {
        content: 'Link Copied',
        animation: 'shift-toward-extreme',
        trigger: 'click',
        hideOnClick: false,
        touch: false,
        theme: 'muscle',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
        offset: [0, 0],
        onShow(instance) {
            setTimeout(() => {
                instance.hide();
            }, 750);
        }
    });
    const twInstance = tippy('#tw-box', {
        content: 'Share on Twitter',
        hideOnClick: true,
        touch: false,
        animation: 'shift-toward-extreme',
        placement: 'right',
        theme: 'tw',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
    });
    tippy('#f-box', {
        content: 'Share on Facebook',
        hideOnClick: true,
        touch: false,
        animation: 'shift-toward-extreme',
        placement: 'right',
        theme: 'fa',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
    });
    tippy('#li-box', {
        content: 'Share on Linkedin',
        hideOnClick: true,
        touch: false,
        animation: 'shift-toward-extreme',
        placement: 'right',
        theme: 'lkn',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
    });
    tippy('#e-box', {
        content: 'Email this to Someone',
        hideOnClick: true,
        touch: false,
        animation: 'shift-toward-extreme',
        placement: 'right',
        theme: 'em',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
    });
    tippy('#l-box', {
        content: "Click to Copy URL",
        animation: 'shift-toward-extreme',
        hideOnClick: true,
        touch: false,
        placement: 'right',
        theme: 'link',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
    });
    tippy('#l-box', {
        content: "Link Copied!",
        animation: 'shift-toward-extreme',
        trigger: 'click',
        hideOnClick: false,
        touch: false,
        placement: 'right',
        theme: 'link',
        arrow: '<svg id="svg" width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z" /><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z" /></svg>',
        onShow(instance) {
            setTimeout(() => {
                instance.hide();
            }, 1000);
        }
    });
});