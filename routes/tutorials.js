var client = require('../redis.js');
var express = require('express');
var router = express.Router();
var TutorialService = require("../services/TutorialService")
var db = require("../models");
var tutorialService = new TutorialService(db);
const { Op } = require("sequelize");


const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? (page-1) * limit : 0;
  return { limit, offset };
};

async function cache(req, res, next) {
  const data = await client.get(req.originalUrl);
  if (data !== null) {
    res.render('tutorials', {tutorials: JSON.parse(data)});
  } else {
    next();
  }
}


router.get('/', cache, async function(req, res, next) {
  console.log('------ASKING THE DATABASE---------');
  const { sort, title, description, published, page, size} = req.query;
  const order = sort ? sort.split(',').map(pair => pair.split(':')) : [];
  const titleCondition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  const descCondition = description ? { description: { [Op.like]: `%${description}%` } } : null;
  const publishedCondition = published ? { published: { [Op.like]: `%${published}%` } } : null;
  const condition = {[Op.and]: [titleCondition, descCondition, publishedCondition]};
  const pagination = getPagination(page, size);
  const tutorials = await tutorialService.getAll(condition, order, pagination);
  await client.set(req.originalUrl, JSON.stringify(tutorials));
  res.render('tutorials', {tutorials: tutorials});
});

module.exports = router;