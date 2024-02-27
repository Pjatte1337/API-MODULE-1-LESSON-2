class TutorialService {
    constructor(db) {
        this.client = db.sequelize;
        this.tutorial = db.tutorial;
    }

    async getAll(condition, order, pagination) {
        return this.tutorial.findAll({
            limit: pagination.limit,
            offset: pagination.offset,
            where: condition,
            order: order
        }).catch(function (err) {
            console.log(err);
        });
    }
}
module.exports = TutorialService;