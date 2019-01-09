/* global module:false */
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {},

        'closure-compiler': {
            "build": {
                closurePath: '../closure-compiler/',
                js: 'critical-css-widget.js',
                jsOutputFile: './critical-css-widget.min.js',
                noreport: true,
                maxBuffer: 500,
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: ['externs.js']
                }
            }
        }
    });

    // Load Dependencies
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('build', ['closure-compiler']);

    grunt.registerTask('default', ['build']);
};