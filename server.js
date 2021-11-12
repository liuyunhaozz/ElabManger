//自定义参数
const
    PORT=3000,
    mongodbUrl = 'mongodb://localhost:27017/ElabDatabase',
    database = 'ElabDatabase',
    accountCollection = 'account'

//初始化变量
var http = require('http'),
    express = require('express'),
    fs = require('fs'),
    app = express(),
    handlebars = require('express3-handlebars').create({defaultLayout:'main'}),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb').MongoClient;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

function searchMongoDbUser(username,password,accountCollection){
    mongodb.connect(mongodbUrl,function (err,db){
        if(err){throw err;}
        var msg = {
            'username':username,
            'password':password
        };
        db.db(database)
          .collection(accountCollection)
          .find(msg)
          .toArray(function (error,result){
            if(err){throw err;}
            if(result.length){
                console.log('登陆成功');
                db.close();
                return 1;
            }else{
                console.log('账户名或密码错误');
                db.close();
                return 0;
            }
        });
    });
}


//配置handlebars作为视图引擎
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//配置公开目录
app.use(express.static(__dirname+'/public'));

//配置路由
app.get('/',function (req,res){
   res.render('login');
});
app.post('/',function (req,res){
    if(searchMongoDbUser(req.body.username,req.body.password,accountCollection)){
        console.log("登录成功");
    }else{
        console.log("用户名或密码错误");
    }
});
app.use(function (req,res){
    res.type('text/plain');
    res.status(404);
    res.send('not found!');
});

function serveStaticFile(response, path, contentType, responseCode) {
    fs.readFile(
        __dirname + path,
        function (err,data){
            if (!responseCode){
                responseCode=200;
            }
            if(err){
                console.log(err);
                response.writeHead(500,{'Content-Type':'text/plain'});
                response.end('internal error');
            }else{
                response.writeHead(responseCode,{'Content-Type':contentType});
                response.end(data);
            }
        }
    )
}

app.listen(
    PORT,
    function (){
        console.log('server is running on port '+PORT);
    }
)