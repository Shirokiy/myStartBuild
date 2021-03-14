//!=============плагины=========
//gulp-sass         работа с sass(scss)
//gulp-concat 		  конкатинация файлов(+переименование)
//gulp-autoprefixer	вставка вендорных префексов для стилей
//gulp-uglify		    сжатие js-файлов
//browser-sync		  автообновление странцы в браузере
//gulp-imagemin		  сжатие картинок
//del			          удаление
//gulp-ttf2woff     конвертация ttf-шрифтов в woff
//gulp-ttf2woff2    конвертация ttf-шрифтов в woff2
//

//*=============Константы==========
const { src, dest, watch, parallel, series} = require('gulp');

const scss          = require('gulp-sass');
const concat 				= require('gulp-concat');
const autoprefixer 	= require('gulp-autoprefixer');
const uglify				= require('gulp-uglify');
const imagemin			= require('gulp-imagemin');
const del				    = require('del');
const browserSync		= require('browser-sync').create();
const ttf2woff      = require('gulp-ttf2woff');
const ttf2woff2     = require('gulp-ttf2woff2');

//*=============Функции============
//*----------Browser-sync----------
function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  });
}

//*-------------Стили--------------
function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserlist:['last 10 version'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
  }

//*-------------Скрипты------------
function scripts() {
  return src([
  'node_modules/jquery/dist/jquery.js',
  'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

//*--------Сжатие картинок----------
function images(){
  return src('app/img/**/*.*')
  .pipe(imagemin([
    imagemin.gifsicle({ interlaced: true }),
    imagemin.mozjpeg({ quality: 75, progressive: true }),
    imagemin.optipng({ optimizeationLevel: 5 }),
    imagemin.svgo({
    plugins: [
      { removeViewBox: true },
      { cleanupIDs: false }
    ] 
  })
  ]))
  .pipe(dest('dist/img'))
}

//*-----Конвертация шрифтов---------
function woff(){
  return src('app/fonts/*.ttf')
  .pipe(ttf2woff())
  .pipe(dest('app/fonts'))
}

function woff2(){
  return src('app/fonts/*.ttf')
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}

function cleanFonts() {
  return src('app/fonts/'), // необходимо для корректного выполнения серии fonts
  del('app/fonts/*.ttf')
}


//*========Функция сборки===========
function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/fonts/*.*'
  ], {base: 'app'})
  .pipe(dest('dist'))

}

function cleanDist(){
  return del('dist')
}


//*=Функция слежения за изменениями=
function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}


//*===Подключение функций к gulp===
exports.styles      = styles;
exports.scripts     = scripts;
exports.browsersync = browsersync;
exports.imagemin    = imagemin;
exports.cleanDist   = cleanDist;
exports.woff        = woff;
exports.woff2       = woff2;
exports.cleanFonts  = cleanFonts;

exports.watching = watching;

exports.fonts       = series(woff, woff2, cleanFonts);
exports.build       = series(cleanDist, images, build);
exports.default     = parallel(styles, scripts, browsersync, watching);
