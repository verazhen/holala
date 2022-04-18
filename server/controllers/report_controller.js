require('dotenv').config();
const validator = require('validator');
const Report = require('../models/report_model');
const Cache = require('../../util/cache');

const getReport = async (req, res) => {
    const orders = await Report.getReport();
    let total = 0;
    let detailsExpand = [];
    let colors = [];
    let prices = [];
    let sizes = [];
    for (let i = 0; i < orders.length; i++) {
        total += orders[i].total;

        for (let j = 0; j < orders[i].details.length; j++) {
            const colorName = orders[i].details[j].color.name;
            const colorCode = orders[i].details[j].color.code;
            let { qty, price, size, id } = orders[i].details[j];
            id = id.toString(10);
            const obj = { colorName, colorCode, qty, price, size, id };
            detailsExpand.push(obj);
        }
    }

    //colors
    const colorsRaw = detailsExpand.reduce((obj, detail) => {
        let { colorName } = detail;
        if (!(colorName in obj)) {
            obj[colorName] = 0;
        }
        obj[colorName] += detail.qty;
        return obj;
    }, {});

    for (let i = 0; i < Object.keys(colorsRaw).length; i++) {
        let colorObj = {};
        colorObj.colorName = Object.keys(colorsRaw)[i];
        colorObj.colorCode = await Report.getCode(Object.keys(colorsRaw)[i]);
        colorObj.qty = colorsRaw[colorObj.colorName];
        colors.push(colorObj);
    }

    //price
    for (let i = 0; i < detailsExpand.length; i++) {
        for (let j = 0; j < detailsExpand[i].qty; j++) {
            prices.push(detailsExpand[i].price);
        }
    }

    //size
    //find top 5 products sold qty
    const pidRaw = detailsExpand.reduce((obj, detail) => {
        let { id } = detail;
        if (!(id in obj)) {
            obj[id] = 0;
        }
        obj[id] += detail.qty;
        return obj;
    }, {});

    const pickHighest = (obj, num = 1) => {
        if (num > Object.keys(obj).length) {
            return false;
        }
        const arr = Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
        return arr.slice(0, num);
    };

    const top = pickHighest(pidRaw, 5);

    for (let i = 0; i < top.length; i++) {
        const id = top[i];
        const filter = detailsExpand.filter((obj) => {
            return obj.id === id;
        });

        const sizesRaw = filter.reduce((obj, detail) => {
            let { size } = detail;
            if (!(size in obj)) {
                obj[size] = 0;
            }
            obj[size] += detail.qty;
            return obj;
        }, {});
        sizesRaw.id = id;

        sizes.push(sizesRaw);
    }

    res.status(200).send({ total, sizes, colors, prices });
};

module.exports = {
    getReport,
};
