const path = require('path')
const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 3000
const handlebars = require('express-handlebars');
const methodOverride = require('method-override')
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const route = require('./routes');
const db =require('./config/db');

db.connect();
app.use(cookieParser('justKey'));
//HTTP logger
app.use(session({
  name: 'sid_just',
  secret: 'justKey', // Chuỗi bí mật — bạn có thể thay bằng bất kỳ chuỗi nào
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24,
     sameSite: 'lax'
   } // session tồn tại 1 ngày
}));
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null; // HBS dùng {{user.*}} ở mọi view
  next();
});
app.use(morgan('combined'))
app.use(methodOverride('_method'))

app.use(express.urlencoded({
  extended:true
}));
app.use(express.json());


//template engine
app.engine('hbs', handlebars.engine({
  extname: ".hbs",
  helpers:{
    sum: (a,b) => a+b,
    eq: (a, b) => a === b
    
  }
}
));


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources\\views'));

app.use(express.static(path.join(__dirname, 'public')));

//route init => khởi tạo tuyến đường
route(app);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})