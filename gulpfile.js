'use strict';

let gulp         = require('gulp'),
    rigger       = require('gulp-rigger'),
    sass       	 = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename       = require('gulp-rename'), 
    sourcemaps   = require ('gulp-sourcemaps'),
    uglify       = require('gulp-uglify-es').default,
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    zopfli       = require('imagemin-zopfli'),
    mozjpeg      = require('imagemin-mozjpeg'),
    giflossy     = require('imagemin-giflossy'),
    jpegtran     = require('imagemin-jpegtran'),
    clean        = require('gulp-clean'),
    browserSync  = require('browser-sync').create();



gulp.task('html', gulp.series(function() {
    return gulp.src('src/*.html')
    .pipe(rigger())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}))


gulp.task('sass', function() {
    return gulp.src("src/scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "compressed"}).on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(rename( {
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function(){
    return gulp.src(['src/js/main.js', 'src/js/libs/jquery.js'])
           .pipe(sourcemaps.init())
           .pipe(rigger())
           .pipe(uglify())
           .pipe(rename( {
                   suffix: '.min'
            }))
           .pipe(sourcemaps.write('.'))
           .pipe(gulp.dest('dist/js'))
           .pipe(browserSync.stream())
})

gulp.task('fonts', function(){
    return gulp.src('src/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(browserSync.stream())
})

gulp.task('favicon', function(){
    return gulp.src('src/favicon.*')
        .pipe(gulp.dest('dist'))
})

gulp.task('img', gulp.series(function() {
    return gulp.src('src/img/**/*.*')
        .pipe(imagemin([
            pngquant({
                speed: 1,
                quality: [0.95, 1]
            }),
            zopfli({more: true}),
            giflossy({
                optimizationLevel: 3,
                optimize: 3,
                lossy: 2
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            jpegtran({
                progressive: true
            }),
            mozjpeg({
                quality: 90
            })
        ]))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
}));


// Static Server + watching scss/html files
gulp.task('serve', gulp.series('html', 'sass', 'img', 'fonts', 'favicon', 'js', function() {

    browserSync.init({
        server: './dist'
    });

    gulp.watch('src/**/*.html', gulp.parallel('html'));
    gulp.watch('src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('src/js/**/*.js', gulp.parallel('js'));
    gulp.watch('src/fonts/**/*.*', gulp.parallel('fonts'));
    gulp.watch('src/img/**/*.*', gulp.parallel('img'));
}));

gulp.task('clean', function() {
    return gulp.src('dist', {allowEmpty: true}).pipe(clean())
})

gulp.task('default', gulp.series('clean', 'serve'));