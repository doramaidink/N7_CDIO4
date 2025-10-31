// app/models/HoaDon.js
const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');


const Schema = mongoose.Schema;

const HoaDon = new Schema({
  maHoaDon: { type: String, required: true, unique: true },   // ví dụ: HD221039281833
  tenNguoiDung: { type: String, required: true },
  tenDoanhNghiep: { type: String, required: true },
  khu: { type: String, enum: ['thuong', 'vip'], required: true }, // thường/vip
  soChoHoacPhong: { type: String, default: '' },                 // "1,2,3" hoặc "2-1,3-2"
  soLuong: { type: Number, default: 0 },                         // tổng số bàn/phòng
  ngay: { type: String, required: true },                        // yyyy-mm-dd
  gio: { type: String, required: true },                         // "11:00"
  trangThai: { type: String, default: 'Chưa thanh toán' },
  tongTien: { type: Number, default: 0 },                        // số VND
}, { 
    timestamps: true 
});
mongoose.plugin(slug);

module.exports = mongoose.model('HoaDon', HoaDon, 'HoaDon');
