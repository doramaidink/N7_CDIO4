const express = require('express');
const router = express.Router();

const doanhnghiepController = require('../app/controllers/chitietdoanhnghiepController');

// Chi tiết doanh nghiệp theo tenTaiKhoan (phù hợp href ở trang chủ)
router.get('/nguoidung/datcho/hoadon', doanhnghiepController.hoadon);
router.get('/nguoidung/datcho/khuthuong', doanhnghiepController.datchothuong);
router.get('/nguoidung/datcho/khuvip', doanhnghiepController.datchovip);
router.get('/nguoidung/:slug', doanhnghiepController.chitiet_nguoidung);
router.get('/:slug', doanhnghiepController.chitiet);


router.get('/', doanhnghiepController.chitiet);

module.exports = router;
