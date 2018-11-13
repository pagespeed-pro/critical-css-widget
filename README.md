# Critical CSS Widget [DEPRECATED]

This widget is deprecated. For improved Critical CSS extraction, see [style.tools](https://style.tools/).

Visit https://style.tools/ to install the new widget or copy the folowing widget code in the browser bookmarks link field.

```javascript
!function(r,a,k,l,f,g,b,m){function n(c,b,d){a.open();b&&(r.onmessage=b);d&&a.addEventListener("securitypolicyviolation",d);a.write(c);a.close()}f="https://style.tools/";g="Style.Tools";var c=a.createElement("script");c.src=f+"x.js";c.onerror=function(){function p(d){if(c=d?d.violatedDirective:0){if("script-src"==c||m)return;m=1;b&&l(b)}if(!q){var h=f+"#"+a.location;a.getElementById("e").innerHTML='<h2 style="color:red;">'+g+(c?' blocked by CSP <font color="blue">'+c+"</font>":" failed to load")+
'.</h2><h3>Redirecting <a href="'+h+'">'+h+"</a>...</h3>";b=k(function(){a.location.href=h},3E3)}}var q;n("<h2>Loading "+g+" via Service Worker...</h2><iframe src="+f+'go height=50></iframe><p id="e"></p>',function(a){q=1;b&&l(b);n("<script>"+a.data+"\x3c/script>")},p);b=k(p,2E3)};a.head.appendChild(c)}(window,document,setTimeout,clearTimeout);
```

The Style.Tools editor works best when used from the bookmarks bar. Fetch requests will then be local without the need for a CORS proxy.

Style.Tools is like Dev Tools for CSS optimization. It looks similar and the startup time is instant.

Style.Tools provides two Critical CSS extraction solutions:

1) a browser widget (this widget but improved)
2) a professional quality Critical CSS extractor based on PostCSS and Penthouse.js.

## About (old widget)

A browser widget to extract Critical CSS and Full CSS from a page. Can be used via the browser console.

The widget is based on a concept by Paul Kinlan, head of Chrome webdeveloper relations team.

https://gist.github.com/PaulKinlan/6284142

The original snippet uses a Chrome innovation called `getMatchedCSSRules` which is deprecated and will be removed in Chrome 63.

The Critical CSS Widget is made cross browser using a [polyfill](https://github.com/ovaldi/getMatchedCSSRules) for `getMatchedCSSRules`.

![image](https://user-images.githubusercontent.com/8843669/36543121-1da8cc7e-17e3-11e8-8ed1-a7f69b47757c.png)

## Usage

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
