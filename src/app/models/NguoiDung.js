const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');


const Schema = mongoose.Schema;

const NguoiDung = new Schema({
     tenDangNhap:{type: String},
     matKhau:{type:String},
     soDienThoai:{type:String},
     image:{type:String},
     tenNguoiDung:{type:String},
     vaiTro: { type: String, default: 'nguoiDung' }, // ✅ Thêm mặc định là "nguoiDung"
    trangThai: { type: String, default: 'Hoạt động' } 
}, {
  timestamps: true,
});


//add plugin
mongoose.plugin(slug);


module.exports = mongoose.model('NguoiDung', NguoiDung,'NguoiDung');