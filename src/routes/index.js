const trangchuRouter = require('./trangchu');
const chitietdoanhnghiepRouter= require('./chitietdoanhnghiep');
const loginRouter= require('./login');
const trangchunguoidungRouter = require('./trangchunguoidung');
const quantrivienRouter = require('./quantrivien')
const chodadatRouter = require('./chodadat')
function route(app){



app.use('/doanhnghiep',chitietdoanhnghiepRouter);
app.use('/login',loginRouter);
app.use('/nguoidung',trangchunguoidungRouter);
app.use('/quantrivien',quantrivienRouter);
app.use('/nguoidung',chodadatRouter)
app.use('/',trangchuRouter);

}
module.exports = route;