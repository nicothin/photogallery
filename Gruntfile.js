// -----------------------------------------------------------------------------
// Получим список файлов фотографий
// -----------------------------------------------------------------------------
var fs = require('fs'),
    dir = 'app/photo/';

var filesList = fs.readdirSync(dir),
    photoHTML = '',
    re = /\.md$/;

// Сформируем массив файлов, самые новые сверху
filesList.sort(function(a, b) {
  return fs.statSync(dir + a).mtime.getTime() -
         fs.statSync(dir + b).mtime.getTime();
}).reverse();
// console.log(filesList);

// Обойдём массив и сделаем из него разметку для фоторамы
filesList.forEach(function(item) {
  if (!re.test( item ) ) {
    photoHTML += '<a href="/photo/'+item+'"><img src="/photo_thubms/'+item+'"></a>';
  }
});

photoHTML = '<div class="fotorama" data-width="100%" data-maxwidth="1000" data-nav="thumbs" data-thumbwidth="100" data-thumbheight="100" data-allowfullscreen="true" data-fit="scaledown" data-hash="true" data-loop="true" data-keyboard="true">'+photoHTML+'</div>';
// console.log(photoHTML);



module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    bower_concat: {
      all: {
        dest: 'app/assets/js/bower.js',
        // exclude: [
        //   'jquery',
        // ]
      }
    },

    concat: {
      start: {
        src: [
          'app/assets/js/bower.js',
          'app/assets/js/script.js'
        ],
        dest: 'build/js/script.js'
      }
    },

    uglify: {
      start: {
        files: {
          'build/js/script.min.js': ['build/js/script.js']
        }
      }
    },



    less: {
      style: {
        options: {
          compress: false,
          yuicompress: false,
          optimization: 2,
        },
        files: {
          'build/css/style.css': ['app/assets/less/style.less']
        },
      }
    },

    postcss: {
      options: {
        processors: [
          require("autoprefixer")({browsers: "last 2 versions"})
        ]
      },
      style: {
        src: "build/css/style.css"
      }
    },

    cmq: {
      style: {
        files: {
          'build/css/style.css': ['build/css/style.css']
        }
      }
    },

    cssmin: {
      style: {
        options: {
          keepSpecialComments: 0
        },
        files: [{
          expand: true,
          cwd: 'build/css',
          src: ['*.css', '!*.min.css'],
          dest: 'build/css',
          ext: '.min.css'
        }]
      }
    },

    replace: {
      css_urls: {
        options: {
          patterns: [
            {
              match: /url\(fotorama/g,
              replacement: 'url(\../img/fotorama'
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ['build/css/style.css']
          }
        ]
      },
      html_clean: {
        options: {
          patterns: [
            {
              match: /\sid=\"-\"/g,
              replacement: ''
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ['build/*.html']
          }
        ]
      },
      insert_gallery: {
        options: {
          patterns: [
            {
              match: /@gallery@/g,
              replacement: photoHTML
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ['build/*.html']
          }
        ]
      },
    },



    clean: {
      build: [
        'build/css',
        'build/img',
        'build/js',
        'build/*.html',
        'build/*.ico',
      ]
    },



    copy: {
      img: {
        expand: true,
        cwd: 'app/assets/img/',
        src: ['**/*.{png,jpg,gif,svg,ico}'],
        dest: 'build/img/',
      },
      fotorama: {
        expand: true,
        cwd: 'bower_components/fotorama/',
        src: ['*.{png,jpg,gif,svg}'],
        dest: 'build/img/',
      },
      photo: {
        expand: true,
        cwd: 'app/photo/',
        src: ['*.{png,jpg,gif}'],
        dest: 'build/photo/',
      },
    },

    imagemin: {
      build: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          src: ['build/img/**/*.{png,jpg,gif,svg}']
        }]
      }
    },



    markdown: {
      all: {
        files: [{
          expand: true,
          cwd: 'app/pages/',
          src: '*.md',
          dest: 'build/',
          ext: '.html'
        }],
        options: {
          template: 'app/template/template.jst',
          contextBinder: true,
          contextBinderMark: '@@@',
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          src: ['build/*.html']
        }]
      },
    },



    responsive_images: {
      resize: {
        options: {
          sizes: [{
            width: 100,
            height: 100,
            quality: 80,
          }],
        },
        files: [{
          expand: true,
          src: ['*.{png,jpg,jpeg,JPG,JPEG,gif}'],
          cwd: 'app/photo/',
          custom_dest: 'build/photo_thumbs/'
        }]
      }
    },



    watch: {
      livereload: {
        options: { livereload: true },
        files: ['build/**/*'],
      },
      scripts: {
        files: ['app/assets/js/script.js'],
        tasks: ['js'],
        options: {
          spawn: false
        },
      },
      style: {
        files: ['app/assets/less/**/*.less'],
        tasks: ['style'],
        options: {
          spawn: false,
        },
      },
      images: {
        files: ['app/assets/img/**/*.{png,jpg,gif,svg,ico}'],
        tasks: ['img'],
        options: {
          spawn: false
        },
      },
      html: {
        files: ['app/pages/*.md', 'app/template/template.jst'],
        tasks: ['html'],
        options: {
          spawn: false
        },
      },
    },

    browserSync: {
      dev: {
        bsFiles: {
          src : [
            'build/css/*.css',
            'build/js/*.js',
            'build/img/*.{png,jpg,gif,svg,ico}',
            'build/*.html',
          ]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "build/",
          },
          // startPath: "/index.html",
          ghostMode: {
            clicks: true,
            forms: true,
            scroll: false
          }
        }
      }
    }

  });




  grunt.registerTask('default', [
    'style',
    'js',
    'img',
    'html',
    'photo',
    'browserSync',
    'watch'
  ]);

  grunt.registerTask('html', [
    'markdown',
    'htmlmin',
    'replace:html_clean',
    'replace:insert_gallery',
  ]);

  grunt.registerTask('js', [
    'bower_concat',
    'concat',
    'uglify',
  ]);

  grunt.registerTask('style', [
    'less',
    'replace:css_urls',
    'postcss',
    'cmq',
    'cssmin',
  ]);

  grunt.registerTask('img', [
    'copy:img',
    'copy:fotorama',
    'imagemin',
  ]);

  grunt.registerTask('photo', [
    'copy:photo',
    'responsive_images',
  ]);

};
