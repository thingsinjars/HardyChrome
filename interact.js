// Page Interaction
// ===
//
// This script is injected into the inspected page and measures the computed CSS properties on the elements.
//
// The majority of this script is the DOM highlighter.

(function() {

  /* DOM Element Highlighter */
  var highlighter;

  // Create floating highligh element and ensure user can't interact with it
  function makeHighlighter() {
    highlighter = document.createElement('div');
    highlighter.style.background = 'rgba(255,100,200,0.5)';
    highlighter.style.zIndex = 10000;
    highlighter.style.position = 'absolute';
    highlighter.style.pointerEvents = 'none';
    document.body.appendChild(highlighter);
  }

  // Calculate actual offset of the element currently being hovered
  // Modified from: http://stackoverflow.com/questions/442404/dynamically-retrieve-the-position-x-y-of-an-html-element
  function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      top: _y,
      left: _x
    };
  }

  // Move the generated floating highlight into position
  // and make it the right size.
  function highlightElement(e) {
    var t = e.target,
      offset = getOffset(t);

    highlighter.style.top = offset.top + "px";
    highlighter.style.left = offset.left + "px";
    highlighter.style.width = t.clientWidth + "px";
    highlighter.style.height = t.clientHeight + "px";

    e.preventDefault();
    e.stopPropagation();

  }

  function unhighlightElement(e) {
    var t = e.target;
    e.preventDefault();
    e.stopPropagation();

  }

  // Handler for launching the test generation flow

  function launcher(e) {
    e.preventDefault();
    e.stopPropagation();

    sendObjectToDevTools({
      action: 'setup',
      content: {
        location: window.location.href,
        path: getFullSelector(e.target),
        styles: window.getComputedStyle(e.target)
      }
    });
  }

  // Work up the DOM until we get to parent, creating a specific CSS selector as we do
  function getFullSelector(node) {
    var path = [];

    do {
      path.unshift(node.nodeName.toLowerCase() + (node.id ? '#' + node.id : '') + (node.className ? '.' + node.className.replace(/\s+/g, ".") : ''));
    }
    while ((node.nodeName.toLowerCase() != 'html') && (node = node.parentNode) );
    return path.join(" > ");
  }

  function init() {
    sendObjectToDevTools({
      'action': 'init'
    });
    var allElements = document.querySelectorAll('*');
    makeHighlighter();

    // Attach visual highlight for hovered elements
    for (var i = 0; i < allElements.length; ++i) {
      var item = allElements[i];
      item.onmouseover = highlightElement;
      item.onmouseout = unhighlightElement;
    }

    document.addEventListener('click', launcher, true);

  }

  function sendObjectToDevTools(message) {
    // The callback here can be used to execute something on receipt
    chrome.extension.sendMessage(message, function(message) {});
  }

  init();
}());