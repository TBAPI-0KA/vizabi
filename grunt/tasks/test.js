//testing
module.exports = function(grunt) {
    grunt.registerTask('test', function() {
        grunt.task.run([
            'build',
            'jasmine'
        ]);
    });

    grunt.registerTask('test:browser', function() {
        grunt.option('force', true);
        grunt.task.run([
            'build',
            'jasmine',
            'connect:test', //run locally
            'watch:test' //watch for spec
        ]);
    });
};