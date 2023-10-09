import gulp from 'gulp';
import babel from 'gulp-babel';
import pug from 'gulp-pug';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import gulpSass from 'gulp-sass';
import nodeSass from 'node-sass';
const sass = gulpSass(nodeSass);

import replace from 'gulp-replace';
import replaceTask from 'gulp-replace-task';
function clean() {
  return del(['dist']);
}

function scripts() {
  return gulp
    .src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest('dist/js'));
}

function styles() {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
}

function templates() {
  return gulp
    .src('src/views/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('dist/html'));
}

function copyAssets() {
  return gulp
    .src('src/assets/**/*')
    .pipe(gulp.dest('dist/assets'));
}

function replaceStyles() {
  return gulp
    .src('dist/html/**/*.html')
    .pipe(replace(/<link href="..\/scss\/main.scss"/g, '<link href="../css/main.css"'))
    .pipe(gulp.dest('dist/html'));
}

function processTemplates() {
  return gulp
    .src('dist/html/**/*.html')
    .pipe(replaceTask({
      patterns: [
        {
          match: /<link href="..\/scss\/main.scss"/g,
          replacement: '<link href="../css/main.css"'
        }
      ]
    }))
    .pipe(gulp.dest('dist/html'));
}


function watch() {
  gulp.watch('src/js/**/*.js', scripts);
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/views/**/*.pug', templates);
  gulp.watch('src/assets/**/*', copyAssets);
}

const build = gulp.series(clean, gulp.parallel(scripts, styles, templates, copyAssets), replaceStyles, processTemplates);
const dev = gulp.series(build, watch);

export { clean, scripts, styles, templates, copyAssets, build, dev };
export default dev;
