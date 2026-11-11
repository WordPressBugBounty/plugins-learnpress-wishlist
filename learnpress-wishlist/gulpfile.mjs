import gulp from 'gulp';
import zip from 'gulp-zip';
import readFile from 'read-file';
import {deleteSync} from 'del';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import rtlCss from 'gulp-rtlcss';
import fs from 'fs';

const name = 'learnpress-wishlist';
const sass = gulpSass(dartSass);

export const clearAll = (done) => {
	if (!fs.existsSync('release')) {
		fs.mkdirSync('release', { recursive: true });
	}
	deleteSync(['./release/**', 'assets/dist/css']);
	return gulp.src(['./release/**'])
		.on('end', done);
}

export const styles = (done) => {
	// Compile SASS
	gulp.src(['assets/src/scss/**/*.scss'])
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest('assets/dist/css'))
		.on('end', done);
}

// Watch task
export const watch = () => {
	gulp.watch('assets/src/scss/**/*.scss', styles);
};

export const createRTLCss = (done) => {
	// Create RTL CSS
	gulp.src(['assets/dist/css/**'])
		.pipe(rtlCss())
		.pipe(rename({suffix: '-rtl'}))
		.pipe(gulp.dest('assets/dist/css'))
		.on('end', done);
}

export const minCss = (done) => {
	// Create RTL CSS
	gulp.src(['assets/dist/css/**'])
		.pipe(cleanCSS())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('assets/dist/css'))
		.on('end', done);
}

export const copyFilesToRelease = (done) => {
	// Not exclude folder assets/src, src has block.json for gutenberg block, code get from that.
	// Copy source release to release folder
	const releasesFiles = ['./**', '!node_modules/**', '!webpack.config.js', '!tsconfig.json', '!phpcs.xml', '!.eslintrc.js', '!.eslintignore', '!composer.json', '!composer.lock', '!gulpfile.mjs', '!package-lock.json', '!package.json', '!release/**','!build-release.js',];
	gulp.src(releasesFiles, { encoding: false })
		.pipe(gulp.dest('release/' + name))
		.on('end', done);
}

export const zipRelease = ( done ) => {
	// Get current version of addon
	const getCurrentVer = function () {
		const current = readFile.sync(`${name}.php`, {encoding: 'utf8'}).match(/Version:\s*(.*)/);
		return current ? current[1] : null;
	};

	// Create zip file
	const releasesFiles = ['./release/**'];

	const zipFileName = `${name}_${getCurrentVer()}.zip`;

	return gulp.src(releasesFiles, { encoding: false })
		.pipe(zip(`${zipFileName}`))
		.pipe(gulp.dest('release'))
		.on( 'end', done );
};

export const runInSeries = gulp.series(clearAll, styles, createRTLCss, minCss, copyFilesToRelease, zipRelease);

// Default task runs all tasks in series
gulp.task('default', runInSeries);
