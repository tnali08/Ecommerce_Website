//require modules
const express=require('express');
const morgan=require('morgan');
const path=require('path');
var methodOverride = require('method-override');
const pageRoutes=require('./routes/pageRoutes');
const userRoutes=require('./routes/userRoutes');

const {mongoose}=require('mongoose');
const flash=require('connect-flash'); 
const MongoStore=require('connect-mongo');
const session=require('express-session');
const user=require('./models/user');

//create app
const app=express();

//configure app
let port=3000;
let host='localhost';
let url='mongodb+srv://aradhika:demo123@cluster0.tot6k.mongodb.net/nbad-project5?retryWrites=true&w=majority&appName=Cluster0';
app.set('view engine','ejs');

//connect to database
mongoose.connect(url).then(()=>
{
    app.listen(port,host,()=>{
        console.log('server is running',port);
    });
}).catch(err=>console.log(err));

//mount middleware

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//session middleware
app.use(session({
    secret:'vdndjvdsvjnvdsjnsvdnkjsfds',
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:60*60*1000},
    store:new MongoStore({mongoUrl:url})
}));

//flash middleware
app.use(flash());
app.use((req, res, next)=>{
    console.log(req.session);
    res.locals.user=req.session.user || null;
    res.locals.successMessages=req.flash('success');
    res.locals.errorMessages=req.flash('error');
    next();
});
app.use((req, res, next)=>{
    const id=req.session.user;
    if(id)
    {
        Promise.all([user.findById(id)])
        .then(result=>{
            const [user]=result;
            res.locals.userName=user;
            next();
        }).catch(err=>next(err));
    }
    else
    {
        res.locals.userName={firstName:" "};
        next();
    }
});



//set up routes

app.use('/',pageRoutes);
app.use('/users',userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});
});


