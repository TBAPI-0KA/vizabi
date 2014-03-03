// i18n js 0.1.0
// (c) 2014 Gapminder Foundation

// Encapsulating i18n
(function(root, factory) {
    'use strict';
    // Support for AMD modules
    if (typeof define === 'function' && define.amd) {
        define(['jed', 'zepto', 'sprintf'], function(Jed, Zepto, sprintf) {
            //if using AMD module, do not export as global
            root.i18n = factory(root, Jed, Zepto, sprintf);
        });
    } else {
        //if there's no support, export as global
        root.i18n = factory(root, root.Jed, (root.Zepto || root.$), root.sprintf);
    }
}(this, function(root, Jed, Zepto, sprintf) {
    'use strict';

    // Checks if the i18n object is globally available
    // If so, returns such object
    var i18n;
    var global_i18n = root.i18n;
    
    if (typeof global_i18n !== 'undefined') {
        i18n = global_i18n;
        return i18n;
    }

    // Array that describes the paths that will be used for fetching the
    // translation data
    var paths = [
        {
            id: 'local',
            desc: 'Local storage',
            url: 'data/i18n/%(lang)s/%(filename)s'
        },
        {
            id: 'cms',
            desc: 'Gapminder CMS',
            url: 'http://stage.cms.gapminder.org/api/poFile/%(filename)s?lang=%(lang)s'
        }
    ];

    // Loads a JSON translation file. Follows the order of locations made
    // available in the paths array
    function loadFile(o, p, callback) {
        Zepto.ajax({
            type: 'GET',

            // url comes from path
            url: sprintf(p[0].url, o),

            dataType: 'json',

            // Executes when a JSON file is loaded
            success: function(json) {
                // Raise event (i18n loaded)
                // $(document.body).trigger('i18n:success');
                
                // Execute callback
                if (typeof callback === 'function') {
                    callback(json);
                }
            },

            // If it fails, recursively call loadFile with the next element in
            // the paths array. When all paths fail, nothing is returned; If
            // you're doing things right, it should fallback to the previously
            // loaded language, which should be 'dev' if no language was
            // previously loaded
            error: function() {
                if (p.length > 1) {
                    loadFile(o, p.slice(1, p.length), callback);
                }
            }
        });
    }

    // Prepares arguments for loading the language file
    function loadStep(lc, file, callback) {
        var properties = {
            lang: lc,
            filename: file
        };

        loadFile(properties, paths, callback);
    }

    // i18n object
    i18n = {};

    // Jed locale_data initializer. Since `dev` is not a real language and Jed
    // needs an initial data to work, we put the data in the correct format so
    // it doesn't crash at start up
    i18n.data = {
        'dev': {
            "" : {}
        }
    };

    // Sets initial domain 
    i18n.language = 'dev';

    // Initializes Jed
    i18n.translator = new Jed({
        language: i18n.language,
        locale_data: i18n.data,
        missing_key_callback: function(key) {
            return key;
        }
    });

    // The translation function. Wherever the i18n is expected to translate
    // text, this function needs to be called
    i18n.translate = function() {
        var args = Array.prototype.slice.call(arguments);

        // Singular form
        if (args.length === 2) {
            return i18n.translator.translate(args[1])
                .onDomain(i18n.language)
                .withContext(args[0])
                .fetch();
        }
        // Plural forms, with arguments
        else if (args.length >= 4) {
            return i18n.translator.translate(args[1])
                .onDomain(i18n.language)
                .withContext(args[0])
                .ifPlural(args[3], args[2])
                .fetch(args.slice(4, args.length));
        }
    };

    // Sets the language to be used for translation
    i18n.setLanguage = function(lang) {
        i18n.language = lang;
    };

    // Loads a translation data set
    i18n.load = function(lang, id, callback) {
        var _this = this;

        loadStep(lang, id, function(d) {
            // Extends the current translation data. Why extend? Because we
            // will probably load several JSON translation files of the same
            // language; since we index the translations per language, we must
            // extend the current object with the new translation
            Zepto.extend(true, _this.data, d);

            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    // Clears the paths array
    i18n.clearPath = function() {
        paths = [];
    };

    // Adds a path to the paths array
    i18n.addPath = function(url, id, desc) {
        paths.push({
            id: id,
            desc: desc,
            url: url
        });
    };

    // Returns the current path array
    i18n.getPath = function() {
        return paths;
    };

    // Sets the paths array to `array`
    i18n.setPath = function(array) {
        paths = array;
    };

    // Returns an instance of the i18n. This is useful when we have different
    // uses of the i18n that requires different languages to be loaded.
    i18n.instance = function(lang) {
        var newInstance = {};
        
        newInstance.language = lang || 'dev';

        newInstance.translate = function() {
            var args = Array.prototype.slice.call(arguments);

            // Singular form
            if (args.length === 2) {
                return i18n.translator.translate(args[1])
                    .onDomain(this.language)
                    .withContext(args[0])
                    .fetch();
            }
            // Plural forms, with arguments
            else if (args.length >= 4) {
                return i18n.translator.translate(args[1])
                    .onDomain(this.language)
                    .withContext(args[0])
                    .ifPlural(args[3], args[2])
                    .fetch(args.slice(4, args.length));
            }
        };

        // `id` should be known on top level, not here
        newInstance.setLanguage = function(lc, id, callback) {
            var _this = this;
            i18n.load(lc, id, function() {
                _this.language = lc;
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }

        return newInstance;
    };

    return i18n;
}));