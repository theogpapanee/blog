const mongoose = require('mongoose');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const createDomPurify = require('dompurify');

const window = new JSDOM('').window;
const domPurify = createDomPurify(window);

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    markdown: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    },
    sanitizedHTML: {
        type: String,
        required: true,
    },
});

articleSchema.pre('validate', function (next) {
    if (this.markdown) {
        this.sanitizedHTML = domPurify.sanitize(marked(this.markdown));
    }
    next(); 
});

module.exports = mongoose.model('Article', articleSchema);
