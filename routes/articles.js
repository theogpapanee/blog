const express = require('express');
const Article = require('./../models/article');
const router = express.Router();

// Protect routes with middleware to check authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// Show "New Article" page
router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('articles/new', { article: new Article() });
});

// Edit article
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { article: article });
});

// Show individual article
router.get('/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (article == null) res.redirect('/');
    res.render('articles/show', { article: article });
});

// Save new article
router.post('/', ensureAuthenticated, async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));

// Update existing article
router.put('/:id', ensureAuthenticated, async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));

// Delete article
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

// Function to save article
function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        try {
            await article.save();
            res.redirect(`/articles/${article.id}`);
        } catch (e) {
            res.render(`articles/${path}`, { article: article });
        }
    };
}

module.exports = router;
