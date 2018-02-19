/** 
 * Critical CSS Widget
 * @link https://github.com/o10n-x/critical-css-widget
 */
(function(window) {

    /**
     * Critical CSS extraction
     *
     * Based on a concept by PaulKinlan
     * @link https://gist.github.com/PaulKinlan/6284142
     *
     * Made cross browser using 
     * @link https://github.com/ovaldi/getMatchedCSSRules
     */
    var CSSCriticalPath = function(w, d, opts) {
        var opt = opts || {};
        var css = {};
        var inlineCount = 0;
        var pushCSS = function(r) {

            var stylesheetFile = r.parentStyleSheet.href;
            if (!stylesheetFile) {
                inlineCount++;
                stylesheetFile = 'inline';
            } else {
                stylesheetFile = stylesheetFile;
            }
            if (!!css[stylesheetFile] === false) {
                css[stylesheetFile] = {
                    media: r.parentStyleSheet.media,
                    css: {}
                };
            }

            if (!!css[stylesheetFile].css[r.selectorText] === false) {
                css[stylesheetFile].css[r.selectorText] = {};
            }

            var styles = r.style.cssText.split(/;(?![A-Za-z0-9])/);
            for (var i = 0; i < styles.length; i++) {
                if (!!styles[i] === false) continue;
                var pair = styles[i].split(": ");
                pair[0] = pair[0].trim();
                pair[1] = pair[1].trim();
                css[stylesheetFile].css[r.selectorText][pair[0]] = pair[1];
            }
        };

        var parseTree = function() {
            // Get a list of all the elements in the view.
            var height = w.innerHeight;
            var walker = d.createTreeWalker(d, NodeFilter.SHOW_ELEMENT, function(node) {
                return NodeFilter.FILTER_ACCEPT;
            }, true);

            while (walker.nextNode()) {
                var node = walker.currentNode;
                var rect = node.getBoundingClientRect();
                if (rect.top < height || opt.scanFullPage) {
                    var rules = w.getMatchedCSSRules(node);
                    if (!!rules) {
                        for (var r = 0; r < rules.length; r++) {
                            pushCSS(rules[r]);
                        }
                    }
                }
            }
        };

        this.generateCSS = function() {
            var finalCSS = "";

            var printConsole = (console && console.groupCollapsed);
            var consoleCSS;
            var cssRule;
            var title;

            var fileReferences = [];

            if (console.clear) {
                console.clear();
            }

            if (printConsole) {
                console.log("%cSimple Critical CSS Extraction", "font-size:24px;font-weight:bold");
                console.log("For professional Critical CSS generators, see https://github.com/addyosmani/critical-path-css-tools");
            }

            for (var file in css) {

                if (printConsole) {
                    title = (file === 'inline') ? 'Inline' : 'File: ' + file;
                    console.groupCollapsed(title);
                    consoleCSS = '';
                }

                // line number
                var lineNo = finalCSS.split(/\r\n|\r|\n/).length;
                fileReferences.push([file, lineNo]);

                finalCSS += "/**\n * @file " + file;
                if (css[file].media && (css[file].media.length > 1 || css[file].media[0] !== 'all')) {
                    var media = [];
                    for (var i = 0; i < css[file].media.length; i++) {
                        if (!css[file].media[i]) {
                            continue;
                        }
                        media.push(css[file].media[i]);
                    }
                    if (media.length > 0) {
                        media = media.join(' ');
                        finalCSS += "\n * @media " + media;
                    }
                }
                finalCSS += "\n */\n";
                for (k in css[file].css) {

                    cssRule = k + " { ";
                    for (var j in css[file].css[k]) {
                        cssRule += j + ": " + css[file].css[k][j] + "; ";
                    }
                    cssRule += "}" + "\n";

                    finalCSS += cssRule;

                    if (printConsole) {
                        consoleCSS += cssRule;
                    }
                }
                finalCSS += "\n";

                if (printConsole) {
                    console.log(consoleCSS);
                    console.groupEnd();
                }
            }

            if (printConsole) {
                console.groupCollapsed('All Extracted Critical CSS (' + humanFileSize(finalCSS.length) + ')');
            } else {
                console.log('%cAll:', "font-weight:bold");
            }
            console.log(finalCSS);

            if (printConsole) {
                console.groupEnd();
            }

            return [finalCSS, fileReferences];
        };

        parseTree();
    };

    /**
     * Full CSS extraction
     *
     * Based on CSSSteal (chrome plugin)
     * @link https://github.com/krasimir/css-steal
     */
    var CSSSteal = function() {
        var elements = [document.body],
            html = null,
            styles = [],
            indent = '  ';

        var getHTMLAsString = function() {
            return elements.outerHTML;
        };
        var toArray = function(obj, ignoreFalsy) {
            var arr = [],
                i;

            for (i = 0; i < obj.length; i++) {
                if (!ignoreFalsy || obj[i]) {
                    arr[i] = obj[i];
                }
            }
            return arr;
        }
        var getRules = function(a) {
            var sheets = document.styleSheets,
                result = [],
                selectorText;

            a.matches = a.matches || a.webkitMatchesSelector || a.mozMatchesSelector || a.msMatchesSelector || a.oMatchesSelector;
            for (var i in sheets) {
                var rules = sheets[i].rules || sheets[i].cssRules;
                for (var r in rules) {
                    selectorText = rules[r].selectorText ? rules[r].selectorText.split(' ').map(function(piece) {
                        return piece ? piece.split(/(:|::)/)[0] : false;
                    }).join(' ') : false;
                    try {
                        if (a.matches(selectorText)) {
                            result.push(rules[r]);
                        }
                    } catch (e) {
                        // can not run matches on this selector
                    }
                }
            }
            return result;
        }
        var readStyles = function(els) {
            return els.reduce(function(s, el) {
                s.push(getRules(el));
                s = s.concat(readStyles(toArray(el.children)));
                return s;
            }, []);
        };
        var flattenRules = function(s) {
            var filterBySelector = function(selector, result) {
                return result.filter(function(item) {
                    return item.selector === selector;
                });
            }
            var getItem = function(selector, result) {
                var arr = filterBySelector(selector, result);
                return arr.length > 0 ? arr[0] : {
                    selector: selector,
                    styles: {}
                };
            }
            var pushItem = function(item, result) {
                var arr = filterBySelector(item.selector, result);
                if (arr.length === 0) result.push(item);
            }
            var all = [];
            s.forEach(function(rules) {
                rules.forEach(function(rule) {
                    var item = getItem(rule.selectorText, all);
                    for (var i = 0; i < rule.style.length; i++) {
                        var property = rule.style[i];
                        item.styles[property] = rule.style.getPropertyValue(property);
                    }
                    pushItem(item, all);
                });
            });
            return all;
        };

        html = getHTMLAsString();
        styles = flattenRules(readStyles(elements));

        return styles.reduce(function(text, item) {
            text += item.selector + ' {\n';
            text += Object.keys(item.styles).reduce(function(lines, prop) {
                lines.push(indent + prop + ': ' + item.styles[prop] + ';');
                return lines;
            }, []).join('\n');
            text += '\n}\n';
            return text;
        }, '');

    };

    /**
     * Cross Browser getMatchedCSSRules
     * @link https://github.com/ovaldi/getMatchedCSSRules
     */
    (function(factory, global) {
        global.getMatchedCSSRules = factory();
    })((function(win) {

        function matchMedia(mediaRule) {
            return window.matchMedia(mediaRule.media.mediaText).matches;
        }

        function matchesSelector(el, selector) {
            var matchesSelector = el.matchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

            if (matchesSelector) {
                try {
                    return matchesSelector.call(el, selector);
                } catch (e) {
                    return false;
                }
            } else {
                var matches = el.ownerDocument.querySelectorAll(selector),
                    len = matches.length;

                while (len && len--) {
                    if (matches[len] === el) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getMatchedCSSRules(el) {
            var matchedRules = [],
                sheets = el.ownerDocument.styleSheets,
                slen = sheets.length,
                rlen, rules, mrules, mrlen, rule, mediaMatched;

            if (el.nodeType === 1) {
                while (slen && slen--) {
                    rules = sheets[slen].cssRules || sheets[slen].rules;
                    rlen = rules.length;

                    while (rlen && rlen--) {
                        rule = rules[rlen];
                        if (rule instanceof CSSStyleRule && matchesSelector(el, rule.selectorText)) {
                            matchedRules.push(rule);
                        } else if (rule instanceof CSSMediaRule) {
                            if (matchMedia(rule)) {
                                mrules = rule.cssRules || rule.rules;
                                mrlen = mrules.length;
                                while (mrlen && mrlen--) {
                                    rule = mrules[mrlen];
                                    if (rule instanceof CSSStyleRule && matchesSelector(el, rule.selectorText)) {
                                        matchedRules.push(rule);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return matchedRules;
        }

        return function() {
            return window.getMatchedCSSRules ? window.getMatchedCSSRules : getMatchedCSSRules;
        };
    })(window), this);

    /* FileSaver.js
     * A saveAs() FileSaver implementation.
     * 1.3.4
     * 2018-01-12 13:14:0
     *
     * By Eli Grey, http://eligrey.com
     * License: MIT
     *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */

    /*global self */
    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

    var saveAs = saveAs || (function(view) {
        "use strict";
        // IE <10 is explicitly unsupported
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var
            doc = view.document
            // only get URL when necessary in case Blob.js hasn't overridden it yet
            ,
            get_URL = function() {
                return view.URL || view.webkitURL || view;
            },
            save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
            can_use_save_link = "download" in save_link,
            click = function(node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            },
            is_safari = /constructor/i.test(view.HTMLElement) || view.safari,
            is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
            throw_outside = function(ex) {
                (view.setImmediate || view.setTimeout)(function() {
                    throw ex;
                }, 0);
            },
            force_saveable_type = "application/octet-stream"
            // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            ,
            arbitrary_revoke_timeout = 1000 * 40 // in ms
            ,
            revoke = function(file) {
                var revoker = function() {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                setTimeout(revoker, arbitrary_revoke_timeout);
            },
            dispatch = function(filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            },
            auto_bom = function(blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob([String.fromCharCode(0xFEFF), blob], {
                        type: blob.type
                    });
                }
                return blob;
            },
            FileSaver = function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                // First try a.download, then web filesystem, then object URLs
                var
                    filesaver = this,
                    type = blob.type,
                    force = type === force_saveable_type,
                    object_url, dispatch_all = function() {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                    // on any filesys errors revert to saving with object URLs
                    ,
                    fs_error = function() {
                        if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                            // Safari doesn't allow downloading of blob urls
                            var reader = new FileReader();
                            reader.onloadend = function() {
                                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                                var popup = view.open(url, '_blank');
                                if (!popup) view.location.href = url;
                                url = undefined; // release reference before dispatching
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        // don't create more object URLs than needed
                        if (!object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (force) {
                            view.location.href = object_url;
                        } else {
                            var opened = view.open(object_url, "_blank");
                            if (!opened) {
                                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    };
                filesaver.readyState = filesaver.INIT;

                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setTimeout(function() {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    });
                    return;
                }

                fs_error();
            },
            FS_proto = FileSaver.prototype,
            saveAs = function(blob, name, no_auto_bom) {
                return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
            };
        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function(blob, name, no_auto_bom) {
                name = name || blob.name || "download";

                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name);
            };
        }

        FS_proto.abort = function() {};
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
            FS_proto.onwritestart =
            FS_proto.onprogress =
            FS_proto.onwrite =
            FS_proto.onabort =
            FS_proto.onerror =
            FS_proto.onwriteend =
            null;

        return saveAs;
    }(
        window
    ));

    // public extract Critical CSS method
    window.extractCriticalCSS = function(callback) {

        var cp = new CSSCriticalPath(window, document);
        var result = cp.generateCSS();
        var css = result[0];
        var files = result[1];

        try {
            var isFileSaverSupported = (callback) ? true : !!new Blob;
        } catch (e) {}

        if (!isFileSaverSupported) {
            alert('Your browser does not support javascript based file download. The critical CSS is printed in the console.')
        } else {

            var criticalCSS = "/**\n * Simple Critical CSS\n *\n * @url " + document.location.href + "\n * @title " + document.title + "\n * @viewport " + window.innerWidth + "x" + window.innerHeight + "\n * @size " + humanFileSize(css.length) + "\n *\n * Extracted using the Page Speed Optimization CSS extract widget.\n * @link https://wordpress.org/plugins/above-the-fold-optimization/\n * @source https://github.com/optimalisatie/above-the-fold-optimization/blob/master/admin/js/css-extract-widget.js (.min.js)\n *\n * For professional Critical CSS generators see https://github.com/addyosmani/critical-path-css-tools\n *\n * @sources";

            var hlines = criticalCSS.split(/\r\n|\r|\n/).length;
            hlines += files.length + 3;
            for (var i = 0; i < files.length; i++) {
                criticalCSS += "\n * @line " + (files[i][1] + hlines) + "\t @file " + files[i][0];
            }
            criticalCSS += "\n */\n\n";
            criticalCSS += css;

            if (callback) {
                return callback(criticalCSS);
            }

            var blob = new Blob([criticalCSS], {
                type: "text/css;charset=utf-8"
            });
            var path = window.location.pathname;
            if (path && path !== '/' && path.indexOf('/') !== -1) {
                path = '-' + path.replace(/\/$/, '').split('/').pop();
            } else {
                path = '-front-page';
            }
            var filename = 'critical-css' + path + '.css';
            saveAs(blob, filename);
        }
    };

    // public extract Full CSS method
    window.extractFullCSS = function(callback) {
        var css = CSSSteal();

        try {
            var isFileSaverSupported = (callback) ? true : !!new Blob;
        } catch (e) {}

        if (console.clear) {
            console.clear();
        }

        console.log("%cFull CSS Extraction", "font-size:24px;font-weight:bold");

        if (console.groupCollapsed) {
            console.groupCollapsed('Extracted Full CSS (' + humanFileSize(css.length) + ')');
        }
        console.log(css);
        if (console.groupCollapsed) {
            console.groupEnd();
        }

        if (!isFileSaverSupported) {
            alert('Your browser does not support javascript based file download. The full CSS is printed in the console.')
        } else {

            var fullcss = "/**\n * Full CSS\n *\n * @url " + document.location.href + "\n * @title " + document.title + "\n * @size " + humanFileSize(css.length) + "\n *\n * Extracted using the Page Speed Optimization CSS extract widget.\n * @link https://wordpress.org/plugins/above-the-fold-optimization/\n * @source https://github.com/optimalisatie/above-the-fold-optimization/blob/master/admin/js/css-extract-widget.js (.min.js)\n */\n\n" +
                css;

            if (callback) {
                return callback(fullcss);
            }

            var blob = new Blob([fullcss], {
                type: "text/css;charset=utf-8"
            });
            var path = window.location.pathname;
            if (path && path !== '/' && path.indexOf('/') !== -1) {
                path = '-' + path.replace(/\/$/, '').split('/').pop();
            } else {
                path = '-front-page';
            }
            var filename = 'full-css' + path + '.css';
            saveAs(blob, filename);
        }
    };

    function humanFileSize(size) {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB'][i];
    };
})(window);
