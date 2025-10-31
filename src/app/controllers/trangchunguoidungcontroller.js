const doanhNghiep= require('../models/DoanhNghiep');
const nguoiDung = require('../models/NguoiDung')
const { mutipleMongooseToObject} = require('../../utill/monggose')

const express = require('express');

// --- Thêm các hàm tiện ích & method mới ngay trong file controller ---
function escapeRegex(str = '') {
  // escape các ký tự đặc biệt để đưa vào RegExp an toàn
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Chuyển "hanoi" => /h.*a.*n.*o.*i/i để match subsequence
function buildSubsequenceRegex(str = '') {
  const pieces = [...str].map(ch => escapeRegex(ch));
  return new RegExp(pieces.join('.*'), 'i');
}



 async function loadData(loaiFilter) {
  const [ doanhNghieps, tinhList, hotListHomestay, hotListRestaurant, hotListBar,hotListAll] =
    await Promise.all([
      loaiFilter ? doanhNghiep.find(loaiFilter) : doanhNghiep.find({}),
      doanhNghiep.distinct("tinh"),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Homestay/i, trangThai: /Hoạt động/i }),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Restaurant/i, trangThai: /Hoạt động/i }),
      doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Bar/i , trangThai: /Hoạt động/i }),
       doanhNghiep.find({ hot: true, trangThai: /Hoạt động/i })
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

class trangchunguoidungController {


     async searchAjaxnguoidung(req, res, next) {
        try {
          const qRaw = (req.query.q || '').trim();
          const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    
          if (!qRaw) return res.json({ results: [] });
    
          // 1) match chứa nguyên cụm
          const containsRe = new RegExp(escapeRegex(qRaw), 'i');
          // 2) match subsequence theo thứ tự ký tự
          const subseqRe = buildSubsequenceRegex(qRaw);
    
          // Lọc chỉ doanh nghiệp đang hoạt động
          const query = {
            trangThai: /Hoạt động/i,
            $or: [
              { tenDoanhNghiep: containsRe },
              { tenDoanhNghiep: subseqRe },
            ],
          };
    
          // Lấy các field cần thiết cho dropdown
          const rows = await doanhNghiep
            .find(query, { tenDoanhNghiep: 1, slug: 1, image: 1, loaiDoanhNghiep: 1, tinh: 1 })
            .limit(limit)
            .lean();
    
          const results = rows.map(r => ({
            tenDoanhNghiep: r.tenDoanhNghiep,
            slug: r.slug || r.tenTaiKhoan || '',
            image: r.image?.startsWith('/img/') ? r.image : ('/img/' + (r.image || 'placeholder.png')),
            loaiDoanhNghiep: r.loaiDoanhNghiep,
            tinh: r.tinh,
          }));
    
          res.json({ results });
        } catch (err) {
          next(err);
        }
      }


   async home(req,res,next){
      try {
            const userSession = req.session.user;

            if (!userSession) {
            return res.redirect('/login/dangnhap');
            }

            const user = await nguoiDung.findById(userSession.id);

          const [ DN, HCM, HN, doanhNghieps, tinhList, hotListHomestay, hotListRestaurant, hotListBar,hotListAll] =
            await Promise.all([
              doanhNghiep.find({ tinh: /Đà Nẵng/i, hot: true, trangThai: /Hoạt động/i }),
              doanhNghiep.find({ tinh: /TP.Hồ Chí Minh/i, hot: true, trangThai: /Hoạt động/i }),
              doanhNghiep.find({ tinh: /Hà Nội/i, hot: true, trangThai: /Hoạt động/i }),
              doanhNghiep.find({trangThai: /Hoạt động/i}),
              doanhNghiep.distinct("tinh"),
              doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Homestay/i, trangThai: /Hoạt động/i }),
              doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Restaurant/i, trangThai: /Hoạt động/i }),
              doanhNghiep.find({ hot: true, loaiDoanhNghiep: /Bar/i, trangThai: /Hoạt động/i }),
              doanhNghiep.find({ hot: true , trangThai: /Hoạt động/i }),
             
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
    
   res.render('nguoidung/trangchunguoidung',{
    layout:'mainnguoidung', showHeader: true, showFooter: true,
      doanhNghiepDN: mutipleMongooseToObject(DN),
            doanhNghiepHCM: mutipleMongooseToObject(HCM),
            doanhNghiepHN: mutipleMongooseToObject(HN),
            doanhNghiep: mutipleMongooseToObject(doanhNghieps),
            tinhList,
            hotByTinhHomestay: groupByTinh(hotListHomestay),
            hotByTinhRestaurant: groupByTinh(hotListRestaurant),
            hotByTinhBar: groupByTinh(hotListBar),
           doanhNghiepHot: mutipleMongooseToObject(hotListAll),
           user: user.toObject()
   });
   } catch (err) {
      next(err);
    }
  }
   async homestay(req,res,next){
    try {
        const userSession = req.session.user;

            if (!userSession) {
            return res.redirect('/login/dangnhap');
            }

            const user = await nguoiDung.findById(userSession.id);

      const data = await loadData({ loaiDoanhNghiep: "Homestay", trangThai: /Hoạt động/i });
      res.render('nguoidung/listtrangchu/homestay', {layout: "mainnguoidung",  showHeader: true, showFooter: true,
        ...data,
          user: user.toObject()
      });//...data dùng để trải dài object ra mới lấy dữ liệu được 
    } catch (err) {
      next(err);
    }
  }

  async restaurant(req,res,next){
    try {
        const userSession = req.session.user;

            if (!userSession) {
            return res.redirect('/login/dangnhap');
            }

            const user = await nguoiDung.findById(userSession.id);
      const data = await loadData({ loaiDoanhNghiep: "Restaurant", trangThai: /Hoạt động/i });
      res.render('nguoidung/listtrangchu/restaurant',{layout: "mainnguoidung", showHeader: true, showFooter: true,
        ...data,
        user: user.toObject()
      });
    } catch (err) {
      next(err);
    }
  }

  async bar(req,res,next){
    try {
        const userSession = req.session.user;

            if (!userSession) {
            return res.redirect('/login/dangnhap');
            }

            const user = await nguoiDung.findById(userSession.id);
      const data = await loadData({ loaiDoanhNghiep: "Bar", trangThai: /Hoạt động/i });
      res.render('nguoidung/listtrangchu/bar', {layout: "mainnguoidung", showHeader: true, showFooter: true,
        ...data,
        user: user.toObject()
      });
    } catch (err) {
      next(err);
    }
}
}
module.exports = new trangchunguoidungController