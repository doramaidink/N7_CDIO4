const express = require('express');
const router = express.Router();

const chodadatController = require('../app/controllers/chodadatController');


router.get('/chodadatnguoidung', chodadatController.home);

module.exports = router;
