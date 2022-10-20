const mongoose = require('mongoose');
const User = require('./user');

var CommentSchema = new Schema({
	author: {type: Schema.Types.ObjectId, ref:'User'}, 
	title: String, 
	content: String, 
	date: {type: Date, default: Date.now}, 
	flag: [{type: Schema.Types.ObjectId, ref:'User'}], 
	sub: [{type: Schema.Types.ObjectId, ref:'Comment'}]
});

module.exports = Comment = mongoose.model('comment', CommentSchema);