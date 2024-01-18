function getTitle() {
    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && twitterTitle.content) {
        return twitterTitle.content;
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
        return ogTitle.content;
    }

    var h1Tag = document.querySelector('h1');
    if (h1Tag) {
        return h1Tag.innerText;
    }

    return "Worth reading"; // Default title if none found
}

function getMetaContentByName(name, content) {
    var content = (content === undefined) ? 'content' : content;
    var meta = document.querySelector(`meta[name='${name}'], meta[property='${name}']`);

    if (meta) {
        return meta.getAttribute(content);
    } else if (name === 'og:url') {
        return window.location.href; // Fallback to current URL
    } else {
        return null;
    }
}

function updateSocialShareLinks() {
    var twitterTitle = getTitle(); // Get title for Twitter
    var title = document.title || "Worth reading"; // Default title if not found for other platforms
    var url = getMetaContentByName('og:url'); // Get the URL from meta tag

    // Update Twitter Link
    var twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterTitle)} ${encodeURIComponent(url)}&via=musclehacking`;
    document.querySelector('#tw-box a').href = twitterLink;

    // Update Facebook Link
    var facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    document.querySelector('#f-box a').href = facebookLink;

    // Update LinkedIn Link
    var linkedInLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    document.querySelector('#li-box a').href = linkedInLink;

    // Update Email Link
    var emailLink = `mailto:?subject=${encodeURIComponent('Worth a read')}&body=${encodeURIComponent('You might find this interesting: ' + url)}`;
    document.querySelector('#e-box a').href = emailLink;
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    updateSocialShareLinks();
});