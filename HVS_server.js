var express = require('express'); // 경량 http 웹 프레임워크 요청과 응답, 미들웨어 사용, 템플릿 엔진을 제공한다
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');

// 데이터베이스 연결
var client = mysql.createConnection({
    user: 'root',
    password: '1234',
    database: 'HVS_db'
    
});

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(52273, function () { // 로컬말고 
    console.log('Server Running at http://127.0.0.1:52273');
});


//------------------------- 사용자 DB 접근 -------------------------- 

app.post('/login', function (request, response) {
    // 데이터베이스 요청을 수행합니다.

    id = request.body.id;
    pw = request.body.pw;

    console.log("사용자 아이디 : " + request.body.id);
    console.log("사용자 비밀번호 : " + request.body.pw);

    client.query('SELECT * FROM HVS_MEMBER WHERE ID=? and PASSWORD=?;',[id,pw]
        , function (error, data) {
            if(error)
            {
                console.log("에러 발생" + error);
            }
            else
            {
                
            }

        console.log(data);
        response.send(data);
        
    });
  });

  app.post('/signup', function (request, response) {
    // 데이터베이스 요청을 수행합니다.

    id = request.body.id;
    pw = request.body.pw;
    name = request.body.name;
    phone = request.body.phone;
    
    console.log("사용자 아이디 : " + request.body.id);
    console.log("사용자 비밀번호 : " + request.body.pw);
    console.log("사용자 이름 : " + request.body.name);
    console.log("사용자 휴대전화 : " + request.body.phone);

    client.query('INSERT INTO HVS_MEMBER(ID,PASSWORD,NAME,PHONE) VALUES(?,?,?,?);',[id,pw,name,phone]
        , function (error, data) {
            if(error)
            {
                console.log("에러 발생" + error);
                
            }
            else
            {
                console.log(data);
                response.send(data);
            }     
        
    });
  });

//------------------------- 상품 DB 접근 ----------------------------

app.get('/products', function (request, response) {
  // 데이터베이스 요청을 수행합니다.
  client.query('SELECT * FROM HVS_products', function (error, data) {
      response.send(data);
  });
});

app.get('/products/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = Number(request.params.id);

    // 데이터베이스 요청을 수행합니다.
    client.query('SELECT * FROM hvs_products WHERE product_number=?', [
        id
    ], function (error, data) {
        response.send(data);
    })
});

app.post('/products', function (request, response) {
    // 변수를 선언합니다.
    var NAME = request.body.PRODUCT_NAME;
    var CATEGORY = request.body.PRODUCT_CATEGORY;
    var IMG =  request.body.PRODUCT_IMG;
    var PRICE = request.body.PRODUCT_PRICE;
    var INFO = request.body.PRODUCT_INFO;

    // 데이터베이스 요청을 수행합니다.
    client.query('INSERT INTO hvs_products(PRODUCT_NAME,PRODUCT_IMG,PRODUCT_PRICE,PRODUCT_INFO,PRODUCT_CATEGORY) VALUES(?,?,?,?,?)', 
       [NAME, IMG, PRICE, INFO, CATEGORY], function (error, data) {
           if(error)
           {
               response.send(error);
               console.log("상품 등록에 실패 했습니다.");
           }
           else
           {
            response.send(data);
            console.log("DB에 데이터 삽입 성공");
           }
           
    });
});

app.get('/addtocart/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = request.params.id;
    console.log(id);
    // 데이터베이스 요청을 수행합니다.
    client.query('SELECT * FROM hvs_cart WHERE order_id=?', [
        id
    ], function (error, data) {
        response.send(data);
    })
});

app.get('/order/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = request.params.id;
    console.log(id);
    // 데이터베이스 요청을 수행합니다.
    client.query('SELECT * FROM hvs_order WHERE order_id=?', [
        id
    ], function (error, data) {
        response.send(data);
    })
});

app.post('/addtocart', function (request, response) {
    // 변수를 선언합니다.
    
    var ID = request.body.ORDER_ID;
    var NUMBER = request.body.PRODUCT_NUMBER;
    var NAME =  request.body.PRODUCT_NAME;
    var PRICE = request.body.PRODUCT_PRICE;
    var COUNT = request.body.PRODUCT_COUNT;
    var IMG = request.body.PRODUCT_IMG;

    // 데이터베이스 요청을 수행합니다.
    client.query('INSERT INTO hvs_cart(ORDER_ID,PRODUCT_NUMBER,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_COUNT,PRODUCT_IMG) VALUES(?,?,?,?,?,?)', 
       [ID, NUMBER, NAME, PRICE, COUNT,IMG], function (error, data) {
           if(error)
           {
               response.send(error);
               console.log("상품 등록에 실패 했습니다.");
           }
           else
           {
            response.send(data);
            console.log("장바구니에 아이템 추가" + data);
           }
           
    });
});

app.get('/update/:id', function (request, response) {
    fs.readFile('update.html', 'utf8', function (error, data) {
        var id = Number(request.params.id);
        
      client.query('SELECT * FROM hvs_products WHERE PRODUCT_NUMBER = ?', [
          id
      ], function (error, result) {
        response.send(ejs.render(data, {
          data: result[0]
          
        }));
        console.log(result);
      });
    }); 
  });

app.post('/update/:id', function (request, response) {
    // 변수를 선언합니다.
    var NUMBER = Number(request.params.id);
    var NAME = request.body.PRODUCT_NAME;
    var IMG = request.body.PRODUCT_IMG;
    var PRICE = request.body.PRODUCT_PRICE;
    var INFO = request.body.PRODUCT_INFO;
    var CATEGORY = request.body.PRODUCT_CATEGORY;


    var query = 'UPDATE hvs_products SET ';
    // 쿼리를 생성합니다./
     
    query += 'product_name="' + NAME + '", ';
    //if (IMG) query += 'product_img="' + IMG + '" ';
    query += 'product_price="' + PRICE + '", ';
    query += 'product_info="' + INFO + '", ';
    query += 'product_category="' + CATEGORY + '" ';
    query += 'WHERE PRODUCT_NUMBER=' + NUMBER;
    // 데이터베이스 요청을 수행합니다.
    client.query(query, function (error, data) {
        response.send("<h2>상품정보가 수정 되었습니다!</h2><a href='../index.html'>메인페이지로 이동</a> ");
        if(error)
            console.log(error);
    });
});

app.get('/delete/:id', function (request, response) {
   
    client.query('DELETE FROM hvs_products WHERE PRODUCT_NUMBER=?', [request.params.id], function () {
        console.log(request.params.id + "번째 상품이 삭제되었습니다.");
        response.redirect('/');
   });
});
