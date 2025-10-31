const hoaDon = require('../models/HoaDon');
const nguoiDung = require('../models/NguoiDung'); // nếu không dùng có thể bỏ

class chodadatController {
  // [GET] /nguoidung/chodadatnguoidung
  async home(req, res, next) {
    try {
      // ĐÃ login rồi => lấy thẳng từ session
      const user = req.session.user;
      const username = String(user?.tenDangNhap || '').trim();

      // Nếu vì lý do gì đó không có username, vẫn render rỗng cho an toàn
      if (!username) {
        return res.render('nguoidung/chodadatnguoidung', {
          layout: 'mainnguoidung',
          showHeader: true,
          showFooter: true,
          HoaDon: [],
          user
        });
      }

      // Lọc đúng yêu cầu: tenDangNhap trên Hóa đơn = username đang login
      // (kèm fallback dữ liệu cũ theo tenNguoiDung để không mất bản ghi)
      const HoaDonList = await hoaDon
        .find({ $or: [{ tenDangNhap: username }, { tenNguoiDung: username }] })
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      return res.render('nguoidung/chodadatnguoidung', {
        layout: 'mainnguoidung',
        showHeader: true,
        showFooter: true,
        HoaDon: HoaDonList, // {{#each HoaDon}} ... {{/each}} trong HBS
        user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new chodadatController();
