const express = require('express')
const router = express.Router();

const loginController = require('../app/controllers/logincontroller')


router.get('/dangnhap',loginController.dangnhap);
router.post('/xulydangnhap', loginController.xulydangnhap); // thêm route xử lý đăng nhập
router.post('/savenguoidung',loginController.savenguoidung);
router.get('/dangky',loginController.dangky);
router.get('/',loginController.dangnhap);


module.exports = router;