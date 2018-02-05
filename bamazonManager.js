var password = require('./password.js');

var inquirer = require('inquirer');
var mysql = require('mysql');
var Product = require('./Product.js');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: password,
	database: "bamazon"
});

connection.connect(function(err){
	if(err) throw err;
	console.log('connected');
	initialInquire();
});

function initialInquire(){
	process.stdout.write('\x1B[2J\x1B[0f');
	inquirer.prompt([
		{
			type: 'list',
			choices: ['View All Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Leave'],
			name: 'choice',
			message: 'Welcome Mr/Ms/Mrs Manager! What would you like to do?'
		}
	]).then((response)=>{
		switch(response.choice){
			case 'View All Products for Sale':
				seeAllItems();
				break;
			case 'View Low Inventory':
				viewLowInventory();
				break;
			case 'Add to Inventory':
				addToInventory();
				break;
			case 'Add New Product':
				addNewProduct();
				break;
			case 'Leave':
				end();
				break;
		}
	})
}

function followUpInquire(){
	// process.stdout.write('\x1B[2J\x1B[0f');
	inquirer.prompt([
		{
			type: 'list',
			choices: ['View All Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Leave'],
			name: 'choice',
			message: 'Hello Mr/Ms/Mrs Manager! What would you like to do?'
		}
	]).then((response)=>{
		switch(response.choice){
			case 'View All Products for Sale':
				seeAllItems();
				break;
			case 'View Low Inventory':
				viewLowInventory();
				break;
			case 'Add to Inventory':
				addToInventory();
				break;
			case 'Add New Product':
				addNewProduct();
				break;
			case 'Leave':
				end();
				break;
		}
	})
}

var end = ()=>{
	console.log('Bye.');
	connection.end();
}

var seeAllItems = ()=>{
	var query = 'SELECT * FROM products';
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		products = results;
		inquireItemToView(products);
	})
}

var makeProductList = (products)=>{
	productList = [];
	products.forEach((data)=>{
		productList.push(data.product_name);
	})
	return productList;
}

var inquireItemToView = (products)=>{
	process.stdout.write('\x1B[2J\x1B[0f');
	inquirer.prompt([
		{
			type: 'list',
			choices: makeProductList(products),
			message: 'Which Product Would You Like to View?',
			name: 'choice'
		}
	]).then((response)=>{
		// setProduct(response.choice);
		viewProduct(setProduct(response.choice));
	})
}

var setProduct = (choice)=>{
	// console.log(products);
	products.forEach((data)=>{
		for(var key in data){
			if(key === 'product_name' && data[key] === choice){
				product = new Product(data.item_id, data.product_name, data.department_name, data.price, data.cost, data.stock_quantity, data.product_sales, data.description);
			}
		}
	})
	// console.log(product);
	return product;
}

var viewProduct = (product)=>{
	product.view();
	followUpInquire();
}

function viewLowInventory(){
	var query = 'SELECT * FROM products WHERE stock_quantity < 10';
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		products = results;
		inquireItemToView(products);
	})
}

var addToInventory = (product)=>{
	var query = 'SELECT * FROM products';
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		products = results;
		inquireItemToAdd(products);
	})
}

var inquireItemToAdd = (products)=>{
	process.stdout.write('\x1B[2J\x1B[0f');
	inquirer.prompt([
		{
			type: 'list',
			choices: makeProductList(products),
			message: 'Which Product Would You Add Inventory To?',
			name: 'choice'
		},
		{
			type: 'number',
			message: 'How many would you like to add?',
			name: 'number'
		}
	]).then((response)=>{
		// setProduct(response.choice);
		addToProduct(setProduct(response.choice), response.number);
	})
}

var addToProduct = (product, number)=>{
	var query = 'UPDATE products SET stock_quantity= ? WHERE item_id = ?';
	var newQuantity = parseInt(product.stock_quantity)+parseInt(number);
	connection.query(query, [newQuantity, product.item_id], (error, results, fields)=>{
		if(error) throw error;
		console.log('');
		console.log('You added '+number+' to '+product.product_name+'!');
		console.log('You now have '+newQuantity+' '+product.product_name+'s!');
		console.log('');
		followUpInquire();
	})
}

var addNewProduct = ()=>{
	process.stdout.write('\x1B[2J\x1B[0f');
	inquirer.prompt([
		{
			type: 'input',
			message: 'Name of product?',
			name: 'name'
		},
		{
			type: 'list',
			choices: makeDepartmentList(),
			message: 'Select Department',
			name: 'department'
		},
		{
			type: 'number',
			message: 'Retail Price?',
			name: 'price'
		},
		{
			type: 'number',
			message: 'Cost?',
			name: 'cost'
		},
		{
			type: 'number',
			message: 'What is the Stock Quantity?',
			name: 'stock'
		},
		{
			type: 'input',
			message: 'Type in a description for the product',
			name: 'description'
		}
	]).then((response)=>{
		var query = 'INSERT INTO products(product_name, department_name, price, cost, stock_quantity, description) VALUES(?, ?, ?, ?, ?, ?)'
		connection.query(query, [response.name, response.department, response.price, response.cost, response.stock, response.description],(error, results, fields)=>{
			if(error) throw error;
			console.log('Good job! You added '+response.name+' to the database!');
			followUpInquire();
		});
	})
}

function getDepartments(){
	var query = 'SELECT department_name FROM products GROUP BY department_name;'
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		departments = results;
		makeDepartmentList(departments);
	});
}

var makeDepartmentList = ()=>{
	departmentList = [];
	var query = 'SELECT department_name FROM products GROUP BY department_name;'
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		departments = results;
		departments.forEach((data)=>{
			for(var key in data){
				if(key === 'department_name'){
					departmentList.push(data[key]);
				}
			}
		})		
	});
	// console.log(departmentList);
	return departmentList;
}