# Critical CSS Widget

A browser widget to extract Critical CSS and Full CSS from a page. Can be used via the browser console.

The widget is based on a concept by Paul Kinlan, head of Chrome webdeveloper relations team.

https://gist.github.com/PaulKinlan/6284142

The original snippet uses a Chrome innovation called `getMatchedCSSRules` which is deprecated and will be removed in Chrome 63.

The Critical CSS Widget is made cross browser using a [polyfill](https://github.com/ovaldi/getMatchedCSSRules) and it includes a tool to extract the full CSS of a page and to provide the extracted CSS as a file download with annotated file references.

# Usage

Copy & paste the widget javascript code directly in the browser console (F12) and use the following methods with an optional callback to extract critical CSS.

### Extract Critical CSS

```javascript
// file download
window.extractCriticalCSS();

// callback
window.extractCriticalCSS(function(css) {
  console.log('Extracted critical CSS:',css);
});
```

### Extract Full CSS

```javascript
// file download
window.extractFullCSS();

// callback
window.extractFullCSS(function(css) {
  console.log('Extracted Full CSS:',css);
});
```


### Copy & Paste Instant Extract

The following code will instantly start a Critical CSS download after pasting the code into the browser console.

```javascript
(function(d,c,s) {s=d.createElement('script');s.async=true;s.onload=c;s.src='https://cdn.rawgit.com/o10n-x/critical-css-widget/74474ace/critical-css-widget.min.js';d.head.appendChild(s);})(document,function() {
 // critical css file download
window.extractCriticalCSS();
});
```
