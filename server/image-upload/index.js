'use strict';
const express = require('express');
const config = require('config');
const path = require('path');

const cors = require('cors');
const fs = require('fs');
const fsX = require('fs-extra');
const formidable = require('formidable');
let ResponseJSON = require('../response');
let errorCodes = require('../../error-codes');
let hashDir = require('../utils/data-tool').hashDir; // hashDir.createPath();
let Finder = require('fs-finder');
let asyncEach = require('async/each');
let bodyParser = require('body-parser');
let router = express.Router();
// let saveDir = path.join(__dirname, '../..', config.imageBasePath);
let saveDir = process.env.BACKEND_IMAGE_BASE_PATH || config.imageBasePath;
const multer = require('multer');

router.use(cors());
router.use(bodyParser.json());

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// let idImage = req.body.idImage || 0;
		// console.log(req.body);
		let savePath = saveDir + "/" + req.decoded.username;
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath);
		}
		// let fileHashDir = hashDir.createPath(savePath, idImage + '', '');
		cb(null, savePath);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	}
});

let upload = multer({storage: storage});
router.post('/image-upload', upload.single('file'), (req, res) => {
	if (!req.body.idImage) return res.send(ResponseJSON(512, "Need idImage", "Need idImage"));
	let savePath = saveDir + "/" + req.decoded.username;
	let idImage = req.body.idImage || 0;
	let fileHashDir = hashDir.createPath(savePath, idImage + '', idImage + req.file.originalname.substring(req.file.originalname.lastIndexOf('.')));
	fsX.copy(req.file.path, fileHashDir, (err, succ) => {
		if (!err) fs.unlinkSync(req.file.path);
	});
	let fileDir = fileHashDir.replace(/\\/g, '/').replace(saveDir, '');
	res.send(ResponseJSON(200, "Done", fileDir));
});
// router.post('/image-upload', imageUpload);

router.post('/image-list', function (req, res) {
	let savePath = path.join(saveDir, req.decoded.username);
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
		res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", []));
	} else {
		Finder.from(savePath).findFiles('*', function (files) {
			let rs = [];
			asyncEach(files, function (file, next) {
				file = file.replace(saveDir, ' ').trim();
				rs.push(file);
				next();
			}, function () {
				res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", rs));
			});
		});
	}
});

function deleteFolderRecursive(path) {
	let files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function (file, index) {
			let curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

router.post('/image-delete', (req, res) => {
	let url = req.body.imageUrl;
	if (!url) return res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, "Need imageUrl"));
	console.log("Delete images ", path.join(saveDir, req.decoded.username, url.split('/')[2]));
	deleteFolderRecursive(path.join(saveDir, req.decoded.username, url.split('/')[2]));
	res.send(ResponseJSON(200, "Done", req.body.imageUrl));
});


function imageUpload(req, res) {
	//console.log("DIR NAME : " + saveDir);
	console.log(req.body);
	let idImage = req.body.idImage || 0;
	let savePath = saveDir + "/" + req.decoded.username;
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	let form = new formidable.IncomingForm();
	form.multiples = false;
	form.uploadDir = process.env.BACKEND_IMAGE_BASE_PATH || config.imageBasePath;

	form.on('end', function () {

	});

	form.on('field', function (name, value) {

	});
	form.on('file', function (name, file) {
		let fileHashDir = hashDir.createPath(savePath, idImage + '', idImage + file.name.substring(file.name.lastIndexOf('.')));
		fs.rename(file.path, fileHashDir, function (err) {
			if (err) {
				console.log(err);
				res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Upload image failed!', '/NaN')));
			} else {
				let fileDir = "/" + req.decoded.username + fileHashDir.replace(savePath, '');
				res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, "Upload success", fileDir)));
			}
		});
	});
	form.on('error', function (err) {

	});

	form.parse(req);

}

module.exports = router;