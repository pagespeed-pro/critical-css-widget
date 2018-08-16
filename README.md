# Critical CSS Widget

A browser widget to extract Critical CSS and Full CSS from a page. Can be used via the browser console.

The widget is based on a concept by Paul Kinlan, head of Chrome webdeveloper relations team.

https://gist.github.com/PaulKinlan/6284142

The original snippet uses a Chrome innovation called `getMatchedCSSRules` which is deprecated and will be removed in Chrome 63.

The Critical CSS Widget is made cross browser using a [polyfill](https://github.com/ovaldi/getMatchedCSSRules) for `getMatchedCSSRules` and it includes a tool to extract the full CSS of a page and to provide the extracted CSS as a file download with annotated file references, information about the viewport, file size and a row index to quickly navigate to the critical CSS from a specific stylesheet.

The critical CSS is also printed in groups in the browser console which enables to extract critical CSS from specific stylesheets.

![image](https://github.com/o10n-x/critical-css-widget/blob/master/critical-css-widget.png?v1)

# Usage

Copy & paste the widget javascript code directly in the browser console (F12) and use the following methods with an optional callback to extract critical CSS.

### Extract Critical CSS

```javascript
// file download
o10n.extract();

// callback
o10n.extract('critical',function(css) {
   console.log('Extracted critical CSS:',css);
});
```

### Extract Full CSS

```javascript
// file download
o10n.extract('full');

// callback
o10n.extract('full',function(css) {
   console.log('Extracted Full CSS:',css);
});
```


### Copy & Paste Instant Extract

The following code will instantly start a Critical CSS download after pasting the code into the browser console.

```javascript
(function(d,c,s) {s=d.createElement('script');s.async=true;s.onload=c;s.src='https://cdn.rawgit.com/o10n-x/critical-css-widget/master/critical-css-widget.min.js';d.head.appendChild(s);})(document,function() {
   // critical css file download
   o10n.extract();
});
```
