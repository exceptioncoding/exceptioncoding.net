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
      },
      githubData: {
        files: [{
          expand: true,
          cwd: 'data/',
          src: ['github-data.json'],
          dest: 'dist/data/'
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
    }
  });

  // Custom task for JSON minification
  grunt.registerTask('minify-json', 'Minify JSON files', function() {
    const done = this.async();
    const spawn = require('child_process').spawn;
    
    const child = spawn('node', ['bin/minify-json.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', function(code) {
      if (code === 0) {
        grunt.log.ok('JSON minification completed successfully');
        done();
      } else {
        grunt.fail.warn('JSON minification failed');
        done(false);
      }
    });
  });

  // Custom task for image optimization
  grunt.registerTask('optimize-images', 'Optimize images with Sharp', function() {
    const done = this.async();
    const spawn = require('child_process').spawn;
    
    const child = spawn('node', ['bin/optimize-images.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', function(code) {
      if (code === 0) {
        grunt.log.ok('Image optimization completed successfully');
        done();
      } else {
        grunt.fail.warn('Image optimization failed');
        done(false);
      }
    });
  });

  // Custom task for HTML minification
  grunt.registerTask('minify-html', 'Minify HTML files with html-minifier-terser', function() {
    const done = this.async();
    const spawn = require('child_process').spawn;
    
    const child = spawn('node', ['bin/minify-html.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', function(code) {
      if (code === 0) {
        grunt.log.ok('HTML minification completed successfully');
        done();
      } else {
        grunt.fail.warn('HTML minification failed');
        done(false);
      }
    });
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Register tasks
  grunt.registerTask('build', [
    'clean:dist',
    'copy:html',
    'copy:fonts', 
    'copy:manifest',
    'copy:favicons',
    'copy:githubData',
    'cssmin',
    'uglify',
    'optimize-images',
    'minify-html',
    'minify-json'
  ]);

  grunt.registerTask('default', ['build']);
};