/// <reference path="typings/main.d.ts" />
'use strict';

const gulp = require('gulp');
const webpack = require('webpack-stream');
const ts = require('gulp-typescript');
const merge = require('merge2');
const gls = require('gulp-live-server');
const runSequence = require('run-sequence');
const uglify = require('gulp-uglify');

gulp.task('webpack', () => {
	return gulp.src('src/ts/browser/main.ts')
		.pipe(webpack(require('./webpack.config.js')).on('error', console.error))
		.pipe(gulp.dest('./'));
});

gulp.task('webpack-prod', () => {
	return gulp.src('src/ts/browser/main.ts')
		.pipe(webpack(require('./webpack.prod.config.js')))
		.pipe(gulp.dest('./'));
});

gulp.task('uglify-prod', () => {
	return gulp.src('pub/bundle.js').pipe(uglify({
		mangle: true,
		compress: true
	})).pipe(gulp.dest('pub'));
});

gulp.task('build-prod', (done) => {
	runSequence('webpack-prod', 'uglify-prod', done);
});

const server = gls('server/js/app.js', {
	env: {
		NODE_ENV: 'development'
	}
}, 5000);

gulp.task('ts', () => {
	const tsProject = ts.createProject('src/ts/server/tsconfig.json');
	const tsResult = tsProject.src().pipe(ts(tsProject));
	return merge([
		tsResult.dts.pipe(gulp.dest('server/definitions')),
		tsResult.js.pipe(gulp.dest('server/js'))
	]);
});

gulp.task('serve', ['ts'], () => {
	server.start();
});

gulp.task('watch-serve', ['serve'], () => {
	gulp.watch('src/ts/server/**/*.ts', ['serve']);
	gulp.watch('pub/**/*', (file) => {
		server.notify.bind(server)(file);
	});
});

gulp.task('watch', ['watch-serve', 'webpack']);

gulp.task('default', ['watch']);