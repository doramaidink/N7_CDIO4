const nguoiDung= require('../models/NguoiDung');
const quanTriVien = require('../models/QuanTriVien');
const { mutipleMongooseToObject} = require('../../utill/monggose')

class loginController{
    dangky(req,res){
      res.render('login/dangky')
    }
    dangnhap(req,res){
      res.render('login/dangnhap')
    }
    savenguoidung(req,res,next){
          try {
              // Tạo ảnh mặc định cho người dùng mới
              const imageDefault = '/img/imageuser/user.png'; // đường dẫn ảnh mặc định (trong thư mục public/img)

              // Gộp dữ liệu từ form đăng ký + ảnh mặc định
              const nguoidung = new nguoiDung({
              tenDangNhap: req.body.tenDangNhap,
              matKhau: req.body.matKhau,
              soDienThoai: req.body.soDienThoai,
              tenNguoiDung: req.body.tenNguoiDung,
              image: imageDefault, // ✅ tự gán ảnh mặc định
              vaiTro: 'nguoiDung',
               trangThai: 'Hoạt động'
          });

          // Lưu vào database
          nguoidung.save()
            .then(() => res.redirect('/login/dangnhap'))
            .catch(error => {
            console.error(error);
            res.render('login/dangky', { error: 'Đăng ký thất bại, vui lòng thử lại!' });
            });

          } catch (error) {
            console.error(error);
            res.render('login/dangky', { error: 'Có lỗi xảy ra, vui lòng thử lại!' });
            }
          } 
     async xulydangnhap(req, res, next) {
          try {
          const { username, password } = req.body;

          // Check Admin
          const admin = await quanTriVien.findOne({ tenDangNhap: username, matKhau: password });
          if (admin) {
          req.session.admin = admin.tenDangNhap; // lưu admin vào session
          return res.redirect('/quantrivien/quanlytaikhoan');
          }

          // Check User
          const user = await nguoiDung.findOne({ tenDangNhap: username, matKhau: password });
          if (!user) {
          return res.render('login/dangnhap', { error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
          }
          if (user.trangThai === 'Khóa') {
          return res.render('login/dangnhap', { error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!' });
          }

          // 🔒 regenerate để chắc chắn có session mới rồi mới gán
          req.session.regenerate(err => {
          if (err) return res.render('login/dangnhap', { error: 'Lỗi phiên làm việc, thử lại!' });

          req.session.user = {
          id: String(user._id),
          tenDangNhap: user.tenDangNhap,
          tenNguoiDung: user.tenNguoiDung,
          image: user.image,
          vaiTro: user.vaiTro
          };

          // (tùy chọn) cookie hiển thị tên cho client
          res.cookie('u_display_raw', user.tenNguoiDung, { maxAge: 30*24*3600*1000, sameSite: 'lax', path: '/' });

          req.session.save(err2 => {
          if (err2) return res.render('login/dangnhap', { error: 'Lỗi phiên làm việc, thử lại!' });
          return res.redirect('/nguoidung/trangchunguoidung');
          });
          });

          } catch (err) {
          console.error(err);
          next(err);
          }
    }

}


module.exports = new loginController();