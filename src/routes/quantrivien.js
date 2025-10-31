const express = require('express')
const router = express.Router();

const quantrivienController= require('../app/controllers/quantriviencontroller')

router.get('/quanlytaikhoan', quantrivienController.home);
router.get('/quanlydanhmuc', quantrivienController.qldm);
router.get('/quanlylichdat', quantrivienController.qlld);
router.get('/',quantrivienController.home)



module.exports = router;