const express = require('express')
const router = express.Router();

const trangchuController = require('../app/controllers/trangchucontroller')
const doanhnghiepController = require('../app/controllers/chitietdoanhnghiepController')



router.get('/listtrangchus/homestay',trangchuController.homestay)
router.get('/listtrangchus/restaurant',trangchuController.restaurant)
router.get('/listtrangchus/bar',trangchuController.bar)
router.get('/:slug', doanhnghiepController.chitiet);
router.get('/api/search', (req, res, next) => trangchuController.searchAjax(req, res, next));
router.get('/',trangchuController.home)



module.exports = router;