const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');


const Schema = mongoose.Schema;

const QuanTriVien = new Schema({
     tenDangNhap:{type: String},
     matKhau:{type:String}
}, {
  timestamps: true,
});


//add plugin
mongoose.plugin(slug);


module.exports = mongoose.model('QuanTriVien',QuanTriVien,'QuanTriVien');