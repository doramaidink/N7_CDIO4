const doanhNghiep= require('../models/DoanhNghiep');
const { mutipleMongooseToObject} = require('../../utill/monggose')
const nguoiDung = require('../models/NguoiDung')

class quantrivienController {
   async home(req,res,next){
        try{
            const [ user, doanhnghiep] =
                await Promise.all([
                    nguoiDung.find({}),
                    doanhNghiep.find({}),
                ]);
            res.render('quantrivien/quanlytaikhoan',{
            layout :'mainquantrivien',
            user: mutipleMongooseToObject(user),
            doanhnghiep: mutipleMongooseToObject(doanhnghiep)
         })

        }
       catch(err){
            next(err);
       }
    }
    qldm(req,res,next){
        res.render('quantrivien/quanlydanhmuc',{
            layout: 'mainquantrivien'
        })
    }
     qlld(req,res,next){
        res.render('quantrivien/quanlylichdat',{
            layout: 'mainquantrivien'
        })
    }
}

module.exports = new quantrivienController