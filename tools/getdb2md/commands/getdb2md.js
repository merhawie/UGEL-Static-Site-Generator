const process = require('process')
const util = require('util')
const path = require('path')
const os = require('os')
const {mkdirSync, existsSync, writeFileSync, readFileSync} = require('fs')
const mustache = require('mustache')
const yaml = require('js-yaml')
const mongoose = require('mongoose');
const chalk = require('chalk')

const bodyTemplate = readFileSync(os.homedir() + "/TestCuttleBelle/tools/getdb2md/templates/body.template")
	const partialTemplate = readFileSync(os.homedir() + "/TestCuttleBelle/tools/getdb2md/templates/list.partial")

const {Element, CategoriesArray} = require('../models/element');

async function getdb2md ({user, pass, cluster, dbName}) {
	await connectDB(user, pass, cluster, dbName);
	
	Element.aggregate([
		{ $match: {
				type: {$in: CategoriesArray}
			}
		},
		{ $graphLookup: {
				from: "elements",
				startWith: "$sub",
				connectFromField: "sub",
				connectToField: "_id",
				as: "children"
			}
		},
		{ $addFields: {
				children: {
					$filter: {
						input: "$children",
						cond: { $and: [
							//{$eq: ["$$this.type", "article"]},
							//{$ne: ["$$this.type", "sub-article"]},
							//{$eq: ["$$this.number", "1"]}
						]	}
					}
				}
			}
		}
	], async (error, result) => {
		let final = []
		if(error) {
			console.log(chalk.red(error))
		}
		else {
			builtArray = {}
			for(const [categoryIndex, category] of CategoriesArray.entries()){
				builtArray[category] = []
				const filtered = result.filter((element) => element.type == category)

				for(const [index, element] of filtered.entries()){
					test = await altRecurse(element, element.children)
					delete test.children
					builtArray[category].push(test);
				}
			}

			for(const group in builtArray){
				for(const element of builtArray[group]){
					console.log(chalk.green(capitalizeFirstLetter(element.type) + " " + element.number))
					if(element.type !== undefined) await writeStructure(os.homedir() + "/TestCuttleBelle/test" + "/" + element.type + "/" + element.number.replace("/", "-"), element);
					console.log(chalk.green("Complete " + capitalizeFirstLetter(element.type) + " " + element.number) + ".")
				}
			}
		}
		process.exit(1);
	});
}

const altRecurse =  (top, children) => {
	const nodemap = new Map(children.map(n => [n._id.toString(), n]));

	const subTree =  (node) => {
		element = nodemap.get(node.toString())
	  //nodemap.delete( node.toString() ); // removed because it cause an error when processes ran in parallel with items being deleted
		if (element==undefined) {
			console.log(`This element is undefined ${node}`)
			return;
		}
	  return element.sub.length ? {
			...element,
			sub: element.sub.map( (c) => {
				returnedTree =  subTree( c )
				return returnedTree
			})
		}
		: {...element, sub: false}
	}

	for(const [i, node] of top.sub.entries()){
	  if (nodemap.has(node.toString())){ 
			returnedTree =  subTree(node)
			top.sub[i] = returnedTree
		} else {
			console.error(chalk.red(`Node ${node} not found in nodemap`))
		}
	}
	top.sub = Array.from(top.sub.values())
	return top;
}

const writeStructure = async (path, data) => {
	//if there is no directory pre-existing, go create it
	if(!existsSync(path)){
		//make directory
		try {
	    await mkdirSync(path, { recursive: true });
	  } 
		catch (error) {
	    console.error(chalk.red(`Got an error trying to create the directory: ${error.message}`));
	  }
	}
	//create yml
		//https://github.com/nodeca/js-yaml
	writeFileSync(path + "/index.yml", yaml.dump({
		title: "TODO", //TODO
		header: ["/_shared/header.md"],
		main: ["body.md"],
		footer: ["/_shared/footer.md"]
	}))

	//proceed to next element
	let mdSub = [] // create an array for mdSub if necessary

	const noDeeperElement = ["sub-article"];
	if(!data.type) console.log(chalk.red(`Error: ${data}`))
	if(data.type && noDeeperElement.indexOf(data.type) >= 0) { 
		// when we have sub-articles we have to create the sub
		console.log(chalk.red("I should not have gotten here: ", data))
	} 
	if(data.sub){
		for(const [i, subElement] of data.sub.entries()){
			//if the subElement is a sub-article we need to write-it out and not go deeper
			if(subElement.type && noDeeperElement.indexOf(subElement.type) >= 0){
				mdSub[i] = subElement
			} 
			//if the subElement is not a sub-article we need to go down a level and only write the top-level of the sub
			else {
				try {
					switch(subElement.type){
						case "sub-article":
							console.log(chalk.red("We should have not needed to get to a sub-article."))
							break;
						case "preamble":
							newPath = path + "/" + subElement.type
							await writeStructure (newPath, subElement)
							break;
						default:
							newPath = path + "/" + subElement.type + "/" + (subElement.number.length>0 ? subElement.number : subElement.title.replace(" ", "-"))
							await writeStructure (newPath, subElement)
							break;
						}
				} catch (error) {
					console.log(error)
					console.log(subElement)
				}

				//delete subElement.sub
				subElement.sub = false
				mdSub[i] = subElement
			}
				
			
			/*
			if(typeof subElement === 'object' && typeof subElement.then === 'function'){
				subElement.then( async (subElement) => {
					if(subElement.type == undefined) console.error(chalk.red(util.inspect(subElement,true)))
					if(subElement.type !== "sub-article"){
						let newPath = path
						if(subElement.type == "preamble") {
							newPath = path + "/" + subElement.type
						}
						else {
							newPath = path + "/" + subElement.type + "/" + (subElement.number.length>0 ? subElement.number : subElement.title.replace(" ", "-"))
						}
						let result = await writeStructure (newPath, subElement)
					}
					else {
						mdSub[i] = subElement
					}
				})	
			} 
			else {
				if(subElement.type == undefined) console.error(chalk.red(util.inspect(subElement,true)))
				if(subElement.type !== "sub-article"){
					let newPath = path
					if(subElement.type == "preamble") {
						newPath = path + "/" + subElement.type
					}
					else {
						newPath = path + "/" + subElement.type + "/" + (subElement.number.length>0 ? subElement.number : subElement.title.replace(" ", "-"))
					}
					let result = await writeStructure (newPath, subElement)
				}
				else {
					mdSub[i] = subElement
				}
			}	
		*/
		}
	}
	//create md
		//https://github.com/johnlindquist/node-lessons/blob/master/index.js
	

	writeFileSync(path + "/body.md", 
		mustache.render(bodyTemplate.toString(), {
			title: data.title ? data.title : "",
			content: data.content ? data.content : "",
			type: data.type ? data.type : "",
			number: data.number ? data.number : "",
			sub: mdSub
		}, {list: partialTemplate.toString() })
	)
	
}
const connectDB = async (username, password, cluster, dbName) => {
	const dbURI = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
	try	{
		await mongoose.connect(
			dbURI, { 
				useNewUrlParser: true, 
				useUnifiedTopology: true 
			}
		);
		const db = mongoose.connection;
		db.on("error", console.error.bind(console, "connection error: "));
		db.once("open", function () {
			console.log("Mongo Atlas connected successfully!");
		});
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
module.exports = getdb2md