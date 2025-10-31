const doanhNghiep= require('../models/DoanhNghiep');
const { mutipleMongooseToObject} = require('../../utill/monggose')
// --- Thêm vào đầu file nếu cần ---
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

class trangchuController {
   async searchAjax(req, res, next) {
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
          doanhNghiep.find({ hot: true })
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


      res.render('trangchu', {layout: "main", showHeader: true, showFooter: true ,
        doanhNghiepDN: mutipleMongooseToObject(DN),
        doanhNghiepHCM: mutipleMongooseToObject(HCM),
        doanhNghiepHN: mutipleMongooseToObject(HN),
        doanhNghiep: mutipleMongooseToObject(doanhNghieps),
        tinhList,
        hotByTinhHomestay: groupByTinh(hotListHomestay),
        hotByTinhRestaurant: groupByTinh(hotListRestaurant),
        hotByTinhBar: groupByTinh(hotListBar),
       doanhNghiepHot: mutipleMongooseToObject(hotListAll),

      });
    } catch (err) {
      next(err);
    }
  }

  async homestay(req,res,next){
    try {
      const data = await loadData({ loaiDoanhNghiep: "Homestay", trangThai: /Hoạt động/i });
      res.render('listtrangchus/homestay', {layout: "main", showHeader: true, showFooter: true , ...data});//...data dùng để trải dài object ra mới lấy dữ liệu được 
    } catch (err) {
      next(err);
    }
  }

  async restaurant(req,res,next){
    try {
      const data = await loadData({ loaiDoanhNghiep: "Restaurant", trangThai: /Hoạt động/i });
      res.render('listtrangchus/restaurant',{layout: "main", showHeader: true, showFooter: true , ...data});
    } catch (err) {
      next(err);
    }
  }

  async bar(req,res,next){
    try {
      const data = await loadData({ loaiDoanhNghiep: "Bar", trangThai: /Hoạt động/i });
      res.render('listtrangchus/bar', {layout: "main", showHeader: true, showFooter: true , ...data});
    } catch (err) {
      next(err);
    }
}
}



//--------------------Cách bình thường--------------
    // home(req,res,next){
    //   Promise.all([
    //         slider.find({}),
    //         doanhNghiep.find({ tinh: /Đà Nẵng/i, hot: true }),
    //         doanhNghiep.find({ tinh: /TP.Hồ Chí Minh/i, hot: true }),
    //         doanhNghiep.find({ tinh: /Hà Nội/i, hot: true }),
    //         doanhNghiep.find({}),
    //         // Vì để không trùng lặp nên cần lấy ra tỉnh duy nhất vì nếu kh lấy ra thì có bao nhiêu bảng có mục tỉnh sẽ lặp bấy nhiêu lần
    //          doanhNghiep.distinct("tinh") , // lấy danh sách tỉnh duy nhất
    //          doanhNghiep.find({hot: true, loaiDoanhNghiep:/Homestay/i}),
    //          doanhNghiep.find({hot: true, loaiDoanhNghiep:/Restaurant/i}),
    //          doanhNghiep.find({hot: true, loaiDoanhNghiep:/Bar/i})
    //     ])
    //     .then(([sliders, DN,HCM,HN,doanhNghieps,tinhList,hotListHomestay,hotListRestaurant,hotListBar]) => {
    //        // Gom doanh nghiệp hot theo tỉnh
    //          const hotByTinhHomestay = {};
    //          const hotByTinhRestaurant ={};
    //          const hotByTinhBar ={};
    //            function groupByTinh(list, target) {
    //             list.forEach(dn => {
    //                 if (!target[dn.tinh]) target[dn.tinh] = [];
    //                 target[dn.tinh].push({
    //                     tenDoanhNghiep: dn.tenDoanhNghiep,
    //                     image: dn.image.startsWith('/img/') ? dn.image : '/img/' + dn.image
    //                 });
    //             });
    //         }

    //         groupByTinh(hotListHomestay, hotByTinhHomestay);
    //         groupByTinh(hotListRestaurant, hotByTinhRestaurant);
    //         groupByTinh(hotListBar, hotByTinhBar);

    //         res.render('trangchu', {
    //             slider: mutipleMongooseToObject(sliders),
    //             doanhNghiepDN: mutipleMongooseToObject(DN),
    //             doanhNghiepHCM: mutipleMongooseToObject(HCM),
    //             doanhNghiepHN: mutipleMongooseToObject(HN),
    //             doanhNghiep: mutipleMongooseToObject(doanhNghieps),
    //             tinhList: tinhList,// danh sách tỉnh duy nhất
    //            hotByTinhHomestay,
    //             hotByTinhRestaurant,
    //             hotByTinhBar
    //         });
    //     })
    // .catch(next);
    // }
    //  homestay(req,res,next){
    //      Promise.all([
    //         slider.find({}),
    //         doanhNghiep.find({loaiDoanhNghiep:"Homestay"}),
    //         // Vì để không trùng lặp nên cần lấy ra tỉnh duy nhất vì nếu kh lấy ra thì có bao nhiêu bảng có mục tỉnh sẽ lặp bấy nhiêu lần
    //         doanhNghiep.distinct("tinh") , // lấy danh sách tỉnh duy nhất
    //         doanhNghiep.find({hot: true, loaiDoanhNghiep:/Homestay/i}),
    //         doanhNghiep.find({hot: true, loaiDoanhNghiep:/Restaurant/i}),
    //         doanhNghiep.find({hot: true, loaiDoanhNghiep:/Bar/i})
    //      ])
    //      .then(([sliders,doanhNghieps,tinhList,hotListHomestay,hotListRestaurant,hotListBar])=>{
    //          const hotByTinhHomestay = {};
    //          const hotByTinhRestaurant ={};
    //          const hotByTinhBar ={};
    //            function groupByTinh(list, target) {
    //             list.forEach(dn => {
    //                 if (!target[dn.tinh]) target[dn.tinh] = [];
    //                 target[dn.tinh].push({
    //                     tenDoanhNghiep: dn.tenDoanhNghiep,
    //                     image: dn.image.startsWith('/img/') ? dn.image : '/img/' + dn.image
    //                 });
    //             });
    //         }
    //          groupByTinh(hotListHomestay, hotByTinhHomestay);
    //         groupByTinh(hotListRestaurant, hotByTinhRestaurant);
    //         groupByTinh(hotListBar, hotByTinhBar);

    //         res.render('listtrangchus/homestay',{
    //             slider: mutipleMongooseToObject(sliders),
    //             doanhNghiep: mutipleMongooseToObject(doanhNghieps),
    //             tinhList: tinhList,// danh sách tỉnh duy nhất
    //             hotByTinhHomestay,
    //             hotByTinhRestaurant,
    //             hotByTinhBar
    //         });
    //      })
    //      .catch(next);
    //  }


    //  restaurant(req,res,next){
    //           Promise.all([
    //              slider.find({}),
    //              doanhNghiep.find({loaiDoanhNghiep:"Restaurant"}),
    //              // Vì để không trùng lặp nên cần lấy ra tỉnh duy nhất vì nếu kh lấy ra thì có bao nhiêu bảng có mục tỉnh sẽ lặp bấy nhiêu lần
    //              doanhNghiep.distinct("tinh") , // lấy danh sách tỉnh duy nhất
    //              doanhNghiep.find({hot: true, loaiDoanhNghiep:/Homestay/i}),
    //              doanhNghiep.find({hot: true, loaiDoanhNghiep:/Restaurant/i}),
    //              doanhNghiep.find({hot: true, loaiDoanhNghiep:/Bar/i})
    //           ])
    //           .then(([sliders,doanhNghieps,tinhList,hotListHomestay,hotListRestaurant,hotListBar])=>{
    //               const hotByTinhHomestay = {};
    //               const hotByTinhRestaurant ={};
    //               const hotByTinhBar ={};
    //                 function groupByTinh(list, target) {
    //                  list.forEach(dn => {
    //                      if (!target[dn.tinh]) target[dn.tinh] = [];
    //                      target[dn.tinh].push({
    //                          tenDoanhNghiep: dn.tenDoanhNghiep,
    //                          image: dn.image.startsWith('/img/') ? dn.image : '/img/' + dn.image
    //                      });
    //                  });
    //              }
    //               groupByTinh(hotListHomestay, hotByTinhHomestay);
    //              groupByTinh(hotListRestaurant, hotByTinhRestaurant);
    //              groupByTinh(hotListBar, hotByTinhBar);
     
    //              res.render('listtrangchus/restaurant',{
    //                  slider: mutipleMongooseToObject(sliders),
    //                  doanhNghiep: mutipleMongooseToObject(doanhNghieps),
    //                  tinhList: tinhList,// danh sách tỉnh duy nhất
    //                  hotByTinhHomestay,
    //                  hotByTinhRestaurant,
    //                  hotByTinhBar
    //              });
    //           })
    //           .catch(next);
    //       }

    //        bar(req,res,next){
    //                Promise.all([
    //                   slider.find({}),
    //                   doanhNghiep.find({loaiDoanhNghiep:"Bar"}),
    //                   // Vì để không trùng lặp nên cần lấy ra tỉnh duy nhất vì nếu kh lấy ra thì có bao nhiêu bảng có mục tỉnh sẽ lặp bấy nhiêu lần
    //                   doanhNghiep.distinct("tinh") , // lấy danh sách tỉnh duy nhất
    //                   doanhNghiep.find({hot: true, loaiDoanhNghiep:/Homestay/i}),
    //                   doanhNghiep.find({hot: true, loaiDoanhNghiep:/Restaurant/i}),
    //                   doanhNghiep.find({hot: true, loaiDoanhNghiep:/Bar/i})
    //                ])
    //                .then(([sliders,doanhNghieps,tinhList,hotListHomestay,hotListRestaurant,hotListBar])=>{
    //                    const hotByTinhHomestay = {};
    //                    const hotByTinhRestaurant ={};
    //                    const hotByTinhBar ={};
    //                      function groupByTinh(list, target) {
    //                       list.forEach(dn => {
    //                           if (!target[dn.tinh]) target[dn.tinh] = [];
    //                           target[dn.tinh].push({
    //                               tenDoanhNghiep: dn.tenDoanhNghiep,
    //                               image: dn.image.startsWith('/img/') ? dn.image : '/img/' + dn.image
    //                           });
    //                       });
    //                   }
    //                    groupByTinh(hotListHomestay, hotByTinhHomestay);
    //                   groupByTinh(hotListRestaurant, hotByTinhRestaurant);
    //                   groupByTinh(hotListBar, hotByTinhBar);
          
    //                   res.render('listtrangchus/bar',{
    //                       slider: mutipleMongooseToObject(sliders),
    //                       doanhNghiep: mutipleMongooseToObject(doanhNghieps),
    //                       tinhList: tinhList,// danh sách tỉnh duy nhất
    //                       hotByTinhHomestay,
    //                       hotByTinhRestaurant,
    //                       hotByTinhBar
    //                   });
    //                })
    //                .catch(next);
    //            }

module.exports = new trangchuController;
