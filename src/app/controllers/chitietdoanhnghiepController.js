const doanhNghiep = require('../models/DoanhNghiep');
const { mongooseToObject } = require('../../utill/monggose');
const { mutipleMongooseToObject} = require('../../utill/monggose')
const nguoiDung = require('../models/NguoiDung')
const hoaDon = require('../models/HoaDon')

async function getUserFromSession(req) {
  const s = req.session?.user;
  if (s?.tenNguoiDung) return s;

  const userId = s?.id || s?._id || req.session?.userId || req.user?._id || null;
  if (!userId) return null;

  const doc = await nguoiDung.findById(userId).lean();
  if (!doc) return null;

  return {
    id: String(doc._id),
    tenDangNhap: doc.tenDangNhap,
    tenNguoiDung: doc.tenNguoiDung,
    image: doc.image,
    vaiTro: doc.vaiTro,
  };
}

//------------Cách ngắn gọn gọp các thành phần ra ngoài class và chỉ gọi lại ---------------------------
  async function loadData(loaiFilter) {
  const [ doanhNghieps, tinhList, hotListHomestay, hotListRestaurant, hotListBar,hotListAll] =
    await Promise.all([
      loaiFilter ? doanhNghiep.find(loaiFilter) : doanhNghiep.find({}),
      doanhNghiep.distinct("tinh"),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Homestay/i, trangThai: /Hoạt động/i }),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Restaurant/i, trangThai: /Hoạt động/i }),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Bar/i, trangThai: /Hoạt động/i }),
      doanhNghiep.find({ hot: true })
    ]);

    function groupByTinh(list) {
    return list.reduce((acc, dn) => {
      if (!acc[dn.tinh]) acc[dn.tinh] = [];
      acc[dn.tinh].push({
        tenDoanhNghiep: dn.tenDoanhNghiep,
        image: dn.image?.startsWith('/img/') ? dn.image : '/img/' + dn.image,
        slug: dn.slug || dn.tenTaiKhoan || '' // thêm slug để header.hbs dùng
      });
      return acc;
    }, {});
  }
  return {
    doanhNghiep: mutipleMongooseToObject(doanhNghieps),
    tinhList,
    hotByTinhHomestay: groupByTinh(hotListHomestay),
    hotByTinhRestaurant: groupByTinh(hotListRestaurant),
    hotByTinhBar: groupByTinh(hotListBar),
    doanhNghiepHot: mutipleMongooseToObject(hotListAll)
  };
}

class doanhnghiepController {
  // [GET] /doanhnghiep/:slug
  async chitiet(req, res, next) {
    try {
      const { slug } = req.params;

      // Lấy doanh nghiệp theo slug
      const dnDoc = await doanhNghiep.findOne({ slug: req.params.slug });
        const [ DN, HCM, HN, doanhNghieps, tinhList, hotListHomestay, hotListRestaurant, hotListBar,hotListAll] =
              await Promise.all([
                doanhNghiep.find({ tinh: /Đà Nẵng/i, hot: true, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ tinh: /TP.Hồ Chí Minh/i, hot: true, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ tinh: /Hà Nội/i, hot: true, trangThai: /Hoạt động/i }),
                doanhNghiep.find({trangThai: /Hoạt động/i}),
                doanhNghiep.distinct("tinh"),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Homestay/i,trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Restaurant/i,trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Bar/i,trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true,trangThai: /Hoạt động/i })
              ]);
      
            function groupByTinh(list) {
            return list.reduce((acc, dn) => {
              if (!acc[dn.tinh]) acc[dn.tinh] = [];
              acc[dn.tinh].push({
                tenDoanhNghiep: dn.tenDoanhNghiep,
                image: dn.image?.startsWith('/img/') ? dn.image : '/img/' + dn.image,
                slug: dn.slug || dn.tenTaiKhoan || ''
              });
              return acc;
            }, {});
          }

      if (!dnDoc) {
        // Nếu không tìm thấy doanh nghiệp
        return res.status(404).render('404', { message: 'Không tìm thấy doanh nghiệp.' });
      }

      // Convert về Object để dùng trong HBS
      const doanhNghiepDetail = mongooseToObject(dnDoc);

      // Nếu image chính chưa có /img/, thêm prefix
      if (doanhNghiepDetail.image && !doanhNghiepDetail.image.startsWith('/img/')) {
      doanhNghiepDetail.image = '/img/' + doanhNghiepDetail.image;
      }

      // Nếu images là mảng => thêm prefix /img/ nếu cần
      if (Array.isArray(doanhNghiepDetail.images)) {
      doanhNghiepDetail.images = doanhNghiepDetail.images.map(img =>
      img.startsWith('/img/') ? img : '/img/' + img
      );
      }

      // Render view chi tiết doanh nghiệp
      return res.render('doanhnghiep/chitietdoanhnghiep', { layout: "main", showHeader: true, showFooter: true ,
              doanhNghiep: doanhNghiepDetail,
              doanhNghiepDN: mutipleMongooseToObject(DN),
              doanhNghiepHCM: mutipleMongooseToObject(HCM),
              doanhNghiepHN: mutipleMongooseToObject(HN),
             doanhNghiepList: mutipleMongooseToObject(doanhNghieps),
              tinhList,
              hotByTinhHomestay: groupByTinh(hotListHomestay),
              hotByTinhRestaurant: groupByTinh(hotListRestaurant),
              hotByTinhBar: groupByTinh(hotListBar),
             doanhNghiepHot: mutipleMongooseToObject(hotListAll),
             });
    } catch (err) {
      return next(err);
    }
  }
   async chitiet_nguoidung(req, res, next) {
    try {
      const { slug } = req.params;
      const userSession = req.session.user;
      const user = userSession ? await nguoiDung.findById(userSession.id) : null;

      // Lấy doanh nghiệp theo slug
      const dnDoc = await doanhNghiep.findOne({ slug: req.params.slug });
        const [ DN, HCM, HN, doanhNghieps, tinhList, hotListHomestay, hotListRestaurant, hotListBar,hotListAll] =
              await Promise.all([
                doanhNghiep.find({ tinh: /Đà Nẵng/i, hot: true,trangThai: /Hoạt động/i }),
                doanhNghiep.find({ tinh: /TP.Hồ Chí Minh/i, hot: true, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ tinh: /Hà Nội/i, hot: true, trangThai: /Hoạt động/i }),
                doanhNghiep.find({trangThai: /Hoạt động/i}),
                doanhNghiep.distinct("tinh"),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Homestay/i, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Restaurant/i, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Bar/i, trangThai: /Hoạt động/i }),
                doanhNghiep.find({ hot: true, trangThai: /Hoạt động/i })
              ]);
      
            function groupByTinh(list) {
            return list.reduce((acc, dn) => {
              if (!acc[dn.tinh]) acc[dn.tinh] = [];
              acc[dn.tinh].push({
                tenDoanhNghiep: dn.tenDoanhNghiep,
                image: dn.image?.startsWith('/img/') ? dn.image : '/img/' + dn.image,
                slug: dn.slug || dn.tenTaiKhoan || ''
              });
              return acc;
            }, {});
          }

      if (!dnDoc) {
        // Nếu không tìm thấy doanh nghiệp
        return res.status(404).render('404', { message: 'Không tìm thấy doanh nghiệp.' });
      }

      // Convert về Object để dùng trong HBS
      const doanhNghiepDetail = mongooseToObject(dnDoc);

      // Nếu image chính chưa có /img/, thêm prefix
      if (doanhNghiepDetail.image && !doanhNghiepDetail.image.startsWith('/img/')) {
      doanhNghiepDetail.image = '/img/' + doanhNghiepDetail.image;
      }

      // Nếu images là mảng => thêm prefix /img/ nếu cần
      if (Array.isArray(doanhNghiepDetail.images)) {
      doanhNghiepDetail.images = doanhNghiepDetail.images.map(img =>
      img.startsWith('/img/') ? img : '/img/' + img
      );
      }

      // Render view chi tiết doanh nghiệp
      return res.render('nguoidung/doanhnghiep/chitietdoanhnghiep', { layout: "mainnguoidung", showHeader: true, showFooter: true ,
              doanhNghiep: doanhNghiepDetail,
              doanhNghiepDN: mutipleMongooseToObject(DN),
              doanhNghiepHCM: mutipleMongooseToObject(HCM),
              doanhNghiepHN: mutipleMongooseToObject(HN),
             doanhNghiepList: mutipleMongooseToObject(doanhNghieps),
              tinhList,
              hotByTinhHomestay: groupByTinh(hotListHomestay),
              hotByTinhRestaurant: groupByTinh(hotListRestaurant),
              hotByTinhBar: groupByTinh(hotListBar),
             doanhNghiepHot: mutipleMongooseToObject(hotListAll),
             user: user?.toObject() || {}
             });
    } catch (err) {
      return next(err);
    }
  }

  async datchothuong(req,res,next){
   try {
    const user = req.session?.user || null;  // đồng nhất với trang chủ
    return res.render('nguoidung/doanhnghiep/datcho/khuthuong', {
      layout: 'maindatcho',
      showHeader: false,
      showFooter: false,
      user,  // view cứ {{user.tenNguoiDung}}
    });
  } catch (err) { next(err); }
  }
  async datchovip(req,res,next){
   try {
    const user = req.session?.user || null;
    return res.render('nguoidung/doanhnghiep/datcho/khuvip', {
      layout: 'maindatcho',
      showHeader: true,
      showFooter: true,
      user,
    });
  } catch (err) { next(err); }
  }
  async hoadon(req,res,next){
   try {
    const q = req.query || {};
    const area = (q.area || 'thuong').toLowerCase();

    // Ưu tiên session như trang chủ, thiếu mới lấy query
    const user = req.session?.user || null;
    const tenNguoiDung = (user && user.tenDangNhap) || (q.usr || 'Khách');

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const code = `HD${String(now.getFullYear()).slice(2)}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${Math.floor(Math.random()*900+100)}`;

    const payload = {
      maHoaDon: code,
      tenDangNhap: user.tenDangNhap,           // thêm để lọc theo tài khoản
      tenNguoiDung,
      tenDoanhNghiep: q.dn || '',
      khu: area === 'vip' ? 'vip' : 'thuong',
      soChoHoacPhong: q.selected || '',
      soLuong: Number(q.tables || q.rooms || 0),
      ngay: q.date || '',
      gio: q.time || '',
      tongTien: Number(q.amount || 0),
      trangThai: 'Chưa thanh toán',
    };

    let doc = null;
    if (payload.tenDoanhNghiep && payload.ngay && payload.gio && payload.soLuong > 0) {
      doc = await hoaDon.create(payload);
    }

    return res.render('nguoidung/doanhnghiep/datcho/hoadon', {
      layout: 'mainnguoidung',
      invoice: doc ? doc.toObject() : payload,
      user, // nếu view cần
    });
  } catch (err) { next(err); }
  }
  
}

module.exports = new doanhnghiepController();
