require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const db = require(__dirname + '/modules/db_connect2');
const sessionStore = new MysqlStore({}, db);
const cors = require('cors');
const axios = require('axios');

express.miee = '一切乖乖';
// const multer = require('multer');
// const upload = multer({ dest: 'tmp_uploads/' });
const upload = require(__dirname + '/modules/upload-img');
const fs = require('fs').promises;

const app = express();

app.set('view engine', 'ejs');
//top-level middleware
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        // console.log({origin});
        callback(null, true);
    }
};
app.use(cors(corsOptions));

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "dkjd16546KJHJK4668",
    store: sessionStore,
    cookie: {
        maxAge: 1_200_000
    }
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    //自己定義的template helper function
    res.locals.toDateString = (d) => moment(d).format('YYYY-MM-DD');
    res.locals.toDatetimeString = (d) => moment(d).format('YYYY-MM-DD HH:mm:ss');
    res.locals.title = '今天要來點乖乖嗎';
    res.locals.session = req.session;
    next();
})
/*app.get('/a.html', (req, res) => {
    res.send(`<h2>假的html</h2>`);
})*/
//routes
app.get('/', (req, res) => {
    // res.send(`<h2>Hello!</h2>`);
    res.render('main', { name: 'miee' })
})

app.get('/sales-json', (req, res) => {
    const sales = require(__dirname + '/data/sales')
    console.log(sales);
    res.render(`sales-json`, { sales });
})

app.get('/json-test', (req, res) => {
    // res.send({ name: 'hoho', age: 22 });
    res.json({ name: 'hoho', age: 20 });
})

app.get('/try-qs', (req, res) => {
    res.json(req.query);
})

app.post('/try-post', (req, res) => {
    res.json(req.body);
})

app.get('/try-post-form', (req, res) => {
    // res.render('try-post-form', { email: '', password: '' });
    res.render('try-post-form', { email: '', password: '' });
})

app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
})

app.post('/try-upload', upload.single('avatar'), async (req, res) => {
    res.json(req.file);
    /*
    if (req.file && req.file.originalname) {
        await fs.rename(req.file.path, `public/imgs/${req.file.originalname}`);
        res.json(req.file);
    } else {
        res.json({ msg: '沒有上傳檔案' });
    }
    */
})

app.post('/try-upload2', upload.array('photos'), async (req, res) => {
    res.json(req.files);
})

app.get('/my-params1/:action?/:id?', async (req, res) => {
    res.json(req.params);
})

app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/i, (req, res) => {
    let u = req.url.slice(3);
    u = u.split('?')[0];
    u = u.split('-').join('');
    res.json({ mobile: u });
})

app.use('/admin2', require(__dirname + '/routes/admin2'));

const myMiddle = (req, res, next) => {
    res.locals = { ...res.locals, miee: '哈囉' };
    res.locals.lalaaa = 123;
    // res.myPersonal = { ...res.locals, miee: '哈囉' };  不建議
    next();
}

app.get('/try-middle', [myMiddle], (req, res) => {
    res.json(res.locals);
});

app.get('/try-session', (req, res) => {
    req.session.aaa ||= 0;
    req.session.aaa++;
    res.json(req.session);
});

app.get('/try-date', (req, res) => {
    const now = new Date;
    const m = moment();
    res.send({
        t1: now,
        t2: now.toString(),
        t3: now.toDateString(),
        t4: now.toLocaleString(),
        m: m.format('YYYY-MM-DD HH:mm:ss'),
    });
});

app.get('/try-moment', (req, res) => {
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const m = moment('06/10/22', 'DD/MM/YY');
    res.json({
        m,
        m1: m.format(fm),
        m2: m.tz('Asia/Taipei').format(fm),
        m3: m.tz('Europe/London').format(fm),
    });
});

app.get('/try-db', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM address_book LIMIT 5");
    res.json(rows);
});

app.get('/try-db-add', async (req, res) => {
    const name = 'HOHO';
    const email = 'hoho@ggg.com';
    const mobile = '0988123456';
    const birthday = '2022-10-15';
    const address = '宜蘭縣';
    const sql = "INSERT INTO `address_book`(`name`,`email`,`mobile`,`birthday`,`address`,`created_at`) VALUES (?,?,?,?,?,NOW())";

    const [result] = await db.query(sql, [name, email, mobile, birthday, address]);
    res.json(result);

    /*
       const [{insertId, affectedRows}] = await db.query(sql, [name, email, mobile, birthday, address]);
   res.json({insertId, affectedRows});
   */
});

app.get('/try-db-add2', async (req, res) => {
    const name = 'HOHO';
    const email = 'hoho@ggg.com';
    const mobile = '0988123456';
    const birthday = '2022-10-15';
    const address = '宜蘭縣';
    const sql = "INSERT INTO `address_book` SET ?";

    const [result] = await db.query(sql, [{ name, email, mobile, birthday, address, created_at: new Date() }]);
    res.json(result);

});

app.use('/ab', require(__dirname + '/routes/address_book'));

// app.get('/fake-login', (req, res) => {
//     req.session.admin = {
//         id: 12,
//         account: 'kiki',
//         nickname: 'ki'
//     };
//     res.redirect('/');
// });

// app.get('/logout', (req, res) => {
//     delete req.session.admin;
//     res.redirect('/');
// });

app.get('/yahoo', async (req, res) => {
    const response = await axios.get('http://tw.yahoo.com/');
    res.send(response.data);
});
//二層分類
app.get('/cate', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM categories");
    // res.json(rows);
    const firsts = [];
    for (let i of rows) {
        if (i.parent_sid === 0) {
            firsts.push(i);
        }
    }
    for (let f of firsts) {
        for (let i of rows) {
            if (f.sid === i.parent_sid) {
                f.children ||= [];
                f.children.push(i);
            }
        }
    }
    res.json(firsts);
});
//三層分類
app.get('/cate2', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM categories");
    const dict = {};
    //編輯字典
    for(let i of rows){
        dict[i.sid] = i;
    }

    for(let i of rows){
        if(i.parent_sid!=0){
            const p = dict[i.parent_sid];
            p.children ||= [];
            p.children.push(i);
            // res.json(p);
        }
    }
    //把第一層拿出來
    const firsts = [];
    for(let i of rows){
        if(i.parent_sid===0){
            firsts.push(i);
        }
    }
    res.json(firsts);
});

//------------------------------------------------------------------------
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap/dist'));

//----------------------------------------------------------------------------
app.use((req, res) => {
    // res.type('text/plain');
    res.status(404).render('404');
})

const port = process.env.SERVER_PORT || 3002;
app.listen(port, () => {
    console.log(`server started,port:${port}`);
});