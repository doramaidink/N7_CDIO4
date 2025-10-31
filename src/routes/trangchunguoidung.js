const express = require('express')
const router = express.Router();

const trangchunguoidungController = require('../app/controllers/trangchunguoidungcontroller')
const doanhnghiepController = require('../app/controllers/chitietdoanhnghiepController')

router.get('/listtrangchu/homestay',trangchunguoidungController.homestay)
router.get('/listtrangchu/restaurant',trangchunguoidungController.restaurant)
router.get('/listtrangchu/bar',trangchunguoidungController.bar)
router.get('/trangchunguoidung', trangchunguoidungController.home);
router.get('/doanhnghiep/:slug', doanhnghiepController.chitiet_nguoidung);
router.get('/',trangchunguoidungController.home)
router.get('/api/search', (req, res, next) => trangchunguoidungController.searchAjaxnguoidung(req, res, next));




module.exports = router;