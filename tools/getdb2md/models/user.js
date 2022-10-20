const mongoose = require('mongoose');

var UserSchema = new Schema({
	type: {type: String, enum: ['administrator', 'editor', 'user'], default: 'user'}, 
	email: {type: String, required: true, index: {unique: true}}, 
	hash: String
});

module.exports = User = mongoose.model('user', UserSchema);