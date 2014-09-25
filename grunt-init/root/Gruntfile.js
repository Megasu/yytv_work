module.exports = function(grunt) {

    'use strict';
    require('load-grunt-tasks')(grunt);
    var path = require('path');
    var fs = require('fs');
    var pkg = require('./package');
    var proj_namespace = path.join(pkg.description, pkg.name, pkg.version, '/');
    var ASSETS_URL = 'http://assets.dwstatic.com/'+ proj_namespace;
    var ipAddress = require('network-address')();

    grunt.initConfig({
        // 全局变量
        banner: '/*! Project: '+pkg.name+'\n *  Version: '+pkg.version+'\n *  Date: <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT") %>\n *  Author: '+pkg.author.name+'\n */',

        assets_path : 'assets/',

        src_path : 'statics/',

        connect: {
            site_src: {
                options: {
                    hostname: ipAddress,
                    port: 9000,
                    base: [''],
                    livereload: true,
                    open: true //打开默认浏览器
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= assets_path %>js',
                    src: '**/*.js',
                    dest: '<%= assets_path %>js'
                }]
            },
            release: {
                files: [{
                    expand: true,
                    cwd: '<%= src_path %>js',
                    src: '**/*.js',
                    dest: '<%= assets_path %>js'
                }]  
            }
        },
        clean: {
            build: ["dest"],
            release: ["<%= assets_path %>slice", "<%= assets_path %>data", "<%= assets_path %>partial"],
            zip: ["assets"]
        },
        copy: {
            release: {
                expand: true,
                cwd: '<%= src_path %>',
                src: ['**', '!sass', '!sass/{,*/}*', '!css/*.map', '!img/psd','!img/psd/{,*/}*'],
                dest: '<%= assets_path %>'
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'ff 17', 'opera 12.1', 'ie 8']
            },
            dist: {
                expand: true,
                flatten: true,
                src: '<%= src_path %>css/*.css',
                dest: '<%= src_path %>css/'
            }
        },
        watch: {
            css: {
                files: ['<%= src_path %>sass/{,*/}*.scss'],
                tasks:['sass','autoprefixer']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['<%= src_path %>*.html', '<%= src_path %>css/*.css', '<%= src_path %>js/*.js']
            }
        },
        imagemin: {
            options: {
                pngquant: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= assets_path %>img/',
                    src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: '<%= assets_path %>img/' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }]
            },
            release: {
                files: [{
                    expand: true,
                    cwd: '<%= src_path %>img/',
                    src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: '<%= assets_path %>img/' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }]
            }
        },
        sass: {
            dist: {
                options: {
                    outputStyle: 'expanded',
                    //nested, compact, compressed, expanded
                    sourceComments: 'map',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= src_path %>sass',
                    src: ['*.scss','!_*.scss','!*/_*.scss'],
                    dest: '<%= src_path %>css',
                    ext: '.css'
                }]
            }
        },
        concat: {
            trans_html: {
                options: {
                    process: function(src, filepath) {
                        var regex = /((href|src)=['"][\s]*)(?!http[s]?\:|\#|\/)([\?\#\=\/\w._-]*)([\s]*['"])/g;
                        return src.replace(regex, '$1'+ASSETS_URL+'$3$4');
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= assets_path %>',
                    src: '*.html',
                    dest: '<%= assets_path %>'
                }]
            }
        }
    });
    
    // 默认任务
    grunt.registerTask('default', ['connect:site_src', 'watch']);

    // 编译sass
    // grunt.registerTask('release-sass', ['sass:release']);

    // 压缩图片
    grunt.registerTask('release-img', ['imagemin:release']);

    // 压缩js
    grunt.registerTask('release-js', ['uglify:release']);

    // 发布任务
    grunt.registerTask('release', ['sass', 'autoprefixer', 'clean:build', 'copy:release', 'uglify', 'imagemin', 'clean:release']);

    // 自定义端口
    grunt.task.registerTask('port', 'multi port', function(arg) {
        if(arguments.length === 0){
            console.log('端口号不能为空！')
        }else{
            grunt.config.set('connect.port'+arg,{
                options: {
                    hostname: ipAddress,
                    port: arg,
                    base: [''],
                    livereload: +arg+1,
                    open: true                }
            });

            grunt.config.set('watch.livereload',{
                options: {
                    livereload: +arg+1
                },
                files: ['<%= src_path %>*.html', '<%= src_path %>css/*.css', '<%= src_path %>js/*.js']
            })

            grunt.task.run(['connect:port'+arg, 'watch']);
        }
    });
};