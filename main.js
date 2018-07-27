var express = require('express'),
    path = require('path'),
    nodeMailer = require('nodemailer'),
    bodyParser = require('body-parser');
var session = require("express-session");
var fileUpload= require("express-fileupload");
var mysql = require("mysql");

var app = express();

app.set('view engine', 'ejs');
app.set("views", "templates");

app.use(express.static("static"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

var port = process.env.PORT || 8080;
app.get('/', function (req, res) {
    res.render('index');
});

app.use(session({
    secret: "itsasecret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

var con = mysql.createConnection
(
    {
        host: "ofcmikjy9x4lroa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "xb9gtfw0tp4nvt5e",
        password: "zbjzk10fa9tedmiy",
        database: "a5fu6x975j4r0i3o"
    }
);

con.connect( function(err)
{
    if (err)
    {
        console.log("DATABASE NOT CONNECTED");
    }
    else
    {
        console.log("DATABASE CONNECTED");
    }
});

app.get("/login", function(request, response)
{
    response.render("login.ejs", {"error_check" : null});
});

app.post("/loggedin", function(request, response)
{
    var admin_id = request.body.admin_name;
    var password = request.body.password;
    var sql = "SELECT admin_password FROM `administrator` WHERE `admin_id` = '"+admin_id+"'";

    con.query(sql, function(err, results)
    {
        if (err)
        {
            console.log(results);
            console.log(admin_id);
            console.log(admin_password);
            response.send("Database Connection Error");
        }
        else if (results.length > 0 && results[0].admin_password === password)
        {
            request.session.username=admin_id;
            flag=0;
            response.redirect("/profile")
        }
        else
        {
            response.render("login.ejs", {"error_check" : "Username and Password doesn't Match"})
        }
    });
});
var flag;
app.get("/profile", function(request, response)
{
    var user_name = request.session.username;
    if (request.session.username == user_name)
    {
        if(flag==0)
        {
            response.render("profile.ejs", {"username": request.session.username, "success": null});
        }
        else if(flag==1)
        {
            var sql = "SELECT image_id,image,brand,description FROM `summer_collection`";
            con.query(sql, function (err, results)
            {
                if (err)
                {
                    throw err;
                }
                else
                {
                    response.render("profile.ejs", {"username": request.session.username, "success": "Image Uploaded"});
                }
            });
        }
    }
    else
    {
        response.redirect("/");
    }
});

app.get("/summercollection", function(request, response)
{
    var sql = "SELECT image_id,image,brand,description FROM `summer_collection`";
    con.query(sql, function (err, results)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            console.log(results);
            var stringifiedJson=JSON.stringify(results);

            console.log(stringifiedJson);
            response.render("summer.ejs", {"img": results});
        }
    });
});

app.get("/wintercollection", function(request, response)
{
    var sql = "SELECT image_id,image,brand,description FROM `winter_collection`";
    con.query(sql, function (err, results)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            console.log(results);
            var stringifiedJson=JSON.stringify(results);

            console.log(stringifiedJson);
            response.render("winter.ejs", {"img": results});
        }
    });
});

app.get("/category3", function(request, response)
{
    var sql = "SELECT image_id,image,brand,description FROM `summer_collection`";
    con.query(sql, function (err, results)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            console.log(results);
            var stringifiedJson=JSON.stringify(results);

            console.log(stringifiedJson);
            response.render("summer.ejs", {"img": results});
        }
    });
});

app.get("/scategory4", function(request, response)
{
    var sql = "SELECT image_id,image,brand,description FROM `summer_collection`";
    con.query(sql, function (err, results)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            console.log(results);
            var stringifiedJson=JSON.stringify(results);

            console.log(stringifiedJson);
            response.render("summer.ejs", {"img": results});
        }
    });
});


app.post('/send-email', function (req, res) {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'info.cloudcloset@gmail.com',
            pass: 'Roland@123'
        }
    });
    var name = req.body.senderr;
    console.log(name);
    let mailOptions = {
        from: 'info.cloudcloset@gmail.com', // sender address
        to: name, // list of receivers
        subject: 'test email', // Subject line
        text: 'YOU ARE SUBSCRIBED', // plain text body
    };
    let mailOptions2 = {
        from: 'info.cloudcloset@gmail.com', // sender address
        to: 'info.cloudcloset@gmail.com', // list of receivers
        subject: 'User Subscried', // Subject line
        text: name + ' IS SUBSCRIBED', // plain text body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
    transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.render('index');
    });
});

app.post("/summer_upload", function(request, response)
{
    var user =  request.session.username;
    var file = request.files.uploads;
    var imagename= file.name;
    file.mv("/cloudcloset/static/summer/"+file.name);
    var brand = request.body.brand_name;
    var description = request.body.dress_description;
    var id;
    var sql;
    var sql2 ="SELECT image_id FROM `summer_collection` WHERE `image_id` = (SELECT MAX(image_id) FROM `summer_collection`)";
    con.query(sql2, function (err, results)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            id =results[0].image_id;
            id=id+1;
            sql = "INSERT INTO `summer_collection` (`image_id`,`image`,`brand`, `description`) VALUES ('" + id + "', '" + imagename + "','" + brand + "', '" + description + "')";
            con.query(sql, function (err)
            {
                if (err)
                {
                    throw err;
                }
                else
                {
                    console.log("IMAGE UPLOADED");
                    flag=1;
                    response.redirect("/profile");
                }
            });
        }
    });
});

app.listen(port, function(){
    console.log('Server is running at port: ',port);
});