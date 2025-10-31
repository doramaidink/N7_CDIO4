const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');


const Schema = mongoose.Schema;

const DoanhNghiep = new Schema({
     tenTaiKhoan:{type: String},
     password:{type:String},
     tenDoanhNghiep:{type:String},
     moTa:{type:String},
     diaChi:{type:String},
     sale:{type:Number},
     soDienThoai:{type:String},
     image:{type:String},
     loaiDoanhNghiep:{type:String},
     tinh:{type:String},
     hot: { type: Boolean, default: false },
     images:{type: Array},
     slug: { type: String, slug: "tenDoanhNghiep", unique: true },
     vaiTro:{type: String},
     trangThai: { type: String } 
}, {
  timestamps: true,
});


//add plugin
mongoose.plugin(slug);


module.exports = mongoose.model('DoanhNghiep', DoanhNghiep,'DoanhNghiep');