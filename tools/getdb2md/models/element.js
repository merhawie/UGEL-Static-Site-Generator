const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const CommentSchema = require("./comment");
//const UserSchema = require("./user");
const fieldsForUI = {
	title: 1,
	number: 1,
	content: 1,
	sub: 1,
	type: 1
}
function autoPopulateChildren(next) {
	this.populate("sub", fieldsForUI);
	next();
}

const CategoriesArray = ["constitution", "proclamation", "legal-notice", "directive", "corrigendum"];
const SectionsArray = ["preamble", "code", "book", "title", "sub-title", "part", "chapter", "section", "paragraph", "article", "sub-article"]

const ElementSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: CategoriesArray.concat(SectionsArray), 
		default: "article"
	},
	number: String,
	title: String,
	content: String,
	sub: [{type: Schema.Types.ObjectId, ref: "Element"}]
});

ElementSchema
	.pre("findOne", autoPopulateChildren)
	.pre("find", autoPopulateChildren)


module.exports = {
	Element: mongoose.model("Element", ElementSchema),
	CategoriesArray,
	SectionsArray
} 