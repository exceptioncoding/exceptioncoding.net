module.exports = function(grunt) {
  'use strict';

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Clean dist directory before building
    clean: {
      dist: ['dist/']
    },

    // Copy files from src to dist
    copy: {
      html: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.html'],
          dest: 'dist/'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'src/fonts/',
          src: ['**/*.{ttf,woff,woff2,eot}'],
          dest: 'dist/fonts/'
        }]
      },
      manifest: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['manifest.json'],
          dest: 'dist/'
        }]
      },
      favicons: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.ico', 'browserconfig.xml'],
          dest: 'dist/'
        }, {
          expand: true,
          cwd: 'src/images/favicons/',
          src: ['*.png'],
          dest: 'dist/images/favicons/'
        }]
      }
    },

    // Minify CSS files
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/styles/',
          src: ['*.css'],
          dest: 'dist/styles/',
          ext: '.css'
        }, {
          expand: true,
          cwd: 'src/fonts/',
          src: ['*.css'],
          dest: 'dist/fonts/',
          ext: '.css'
        }]
      }
    },

    // Minify JavaScript files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n',
        mangle: true,
        compress: {
          drop_console: true
        }
      },
      target: {
        files: [{
          expand: true,
          cwd: 'src/scripts/',
          src: ['*.js'],
          dest: 'dist/scripts/',
          ext: '.js'
        }]
      }
    },

    // Optimize images
    imagemin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/images/',
          src: ['**/*.{png,jpg,jpeg,gif,svg}'],
          dest: 'dist/images/'
        }]
      }
    },

    // Minify HTML files
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          ignoreCustomFragments: [/\s*<pre[^>]*>[\s\S]*?<\/pre>\s*/gi]
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['*.html'],
          dest: 'dist/'
        }]
      }
    },

    // Minify JSON files including GitHub data
    jsonmin: {
      manifest: {
        options: {
          stripWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['manifest.json'],
          dest: 'dist/'
        }]
      },
      githubData: {
        options: {
          stripWhitespace: true
        },
        files: {
          'dist/data/github-data.json': 'data/github-data.json'
        }
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-jsonmin');

  // Register tasks
  grunt.registerTask('build', [
    'clean:dist',
    'copy:html',
    'copy:fonts', 
    'copy:manifest',
    'copy:favicons',
    'cssmin',
    'uglify',
    'imagemin',
    'htmlmin',
    'jsonmin'
  ]);

  grunt.registerTask('default', ['build']);
};