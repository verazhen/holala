const router = require('express').Router();
const { wrapAsync, authentication } = require('../../util/util');

const { getReport } = require('../controllers/report_controller');

// For load testing (Not in API Docs)
router.route('/report/payments').get(wrapAsync(getReport));

module.exports = router;
