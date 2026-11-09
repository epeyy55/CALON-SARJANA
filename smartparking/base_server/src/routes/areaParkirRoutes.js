const express = require('express');
const router = express.Router();
const areaParkirController = require('../controllers/areaParkirController');

router.get('/',        areaParkirController.getAllAreaParkir);
router.get('/:id',     areaParkirController.getAreaParkirById);
router.post('/',       areaParkirController.createAreaParkir);
router.put('/:id',     areaParkirController.updateAreaParkir);
router.delete('/:id',  areaParkirController.deleteAreaParkir);

module.exports = router;