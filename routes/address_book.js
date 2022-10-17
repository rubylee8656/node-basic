const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect2');

router.use((req, res, next) => {

    next();
})


async function getListData(req,res){
    const perPage = 10;
    let page = +req.query.page || 1;
    if (page < 1) {
        return res.redirect(req.baseUrl);
    }
    let search = req.query.search ? req.query.search : '';
    let where = ` WHERE 1 `;
    if (search) {
        where += ` AND 
        (
            \`name\` LIKE ${db.escape('%' + search + '%')}
            OR
            \`address\` LIKE ${db.escape('%' + search + '%')}
        )`;
    }
    const t_sql = `SELECT COUNT(1) totalRows FROM address_book  ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = [];
    if (totalRows > 0) {
        totalPages = Math.ceil(totalRows / perPage);
        if (page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }
        const sql = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${(page - 1) * perPage},${perPage}`;
        [rows] = await db.query(sql);
    }

    return { totalRows, totalPages, perPage, page, rows, search, query: req.query };
}

//CRUD
router.get(['/', '/list'], async (req, res) => {
    const data = await getListData(req,res);
    res.render('address_book/list', data);
});

router.get(['/api', '/api/list'], async (req, res) => {
    res.json(await getListData(req,res));
});

module.exports = router;