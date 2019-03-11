const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const browsersync = require("browser-sync").create();
const fs = require('fs-extra');

let distDir = 'dist';
const webRoot = 'dist';

const AUTOPREFIXER_BROWSERS = [
    'ie >= 11',
    'ie_mob >= 11',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

const browserSync = (done) => {
    browsersync.init({
        server: {
            baseDir: distDir
        },
        port: 3030
    });
    done();
};

const browserSyncReload = (done) => {
    browsersync.reload();
    done();
};

const minifyHTML = () => {
    return gulp.src(['./src/index.html','src/**/*.html'], ['!lib'])
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true,
            removeComments: true,
            ignoreCustomFragments: [/{{[{]?(.*?)[}]?}}/]
        }))
        .pipe(gulp.dest(distDir));
};

const minifyCSS = () => {
    return gulp.src('./src/**/*.css')
        .pipe(plumber())
        .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(csso())
        .pipe(gulp.dest(distDir));
};

const minifyJS = () => {
    return gulp.src('./src/**/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(distDir));
};

const copyImages = () => {
    return gulp.src('./src/img/**')
        .pipe(plumber())
        .pipe(gulp.dest(distDir+'/img'));
};

const copyLib = () => {
    return gulp.src('./src/lib/**')
        .pipe(plumber())
        .pipe(gulp.dest(distDir+'/lib'));
};

const build = (done) => {
    return gulp.series(copyLib, copyImages, minifyHTML, minifyCSS, minifyJS)(done);
};

const clean = (done) => {
    if (fs.existsSync(distDir))
        fs.removeSync(distDir);
    fs.mkdirSync(distDir);
    return done();
};

const install = (done) => {
    distDir = webRoot;
    return gulp.series(clean, build)(done);
};

const watchFiles = () => {
    gulp.watch(["./src/**/*.html"], gulp.series(copyLib, copyImages, minifyHTML, browserSyncReload));
    gulp.watch(["./src/**/*.css"], gulp.series(minifyCSS, browserSyncReload));
    gulp.watch(["./src/**/*.js"], gulp.series(minifyJS, browserSyncReload));
};

const watchLocal = gulp.parallel(watchFiles, browserSync);


const defaultTask = (done) => {
    return gulp.series(clean, build)(done);
};

exports.clean = clean;
exports.build = build;
exports.install = install;
exports.watch_local = watchLocal;

exports.default = defaultTask;
