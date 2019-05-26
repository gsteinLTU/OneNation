
/**
 * Get the page showing the overview of the game
 */
exports.getGameIndex = (req, res, next) => {
    res.render('game/index.ejs', { pageTitle: 'OneNation' });
};