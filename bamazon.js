// var password = require('./password.js');

var mysql = require("mysql");
var inquirer = require("inquirer");
var Product = require('./Product.js')

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: '',
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
			choices: ['See all items', 'See items by department', 'Search for item','Leave'],
			name: 'choice',
			message: 'Welcome to Bamazon, where you can pretend-to-buy-stuff! What would you like to do?'
		}
	]).then((response)=>{
		switch(response.choice){
			case 'See all items':
				seeAllItems();
				break;
			case 'See items by department':
				seeDepartments();
				break;
			case 'Search for item':
				searchForItem();
				break;
			case 'Leave':
				end();
				break;
		}
	})
}

var returnHome = ()=>{
	var timer = setTimeout(()=>{
	console.log('Returning you to home in:');
	console.log('3');
	var timeout0 = setTimeout(()=>{
		initialInquire();
	},3000);
	var timeout1 = setTimeout(()=>{
		console.log('1');
	},2000);
	var timeout2 = setTimeout(()=>{
		console.log('2');
	},1000);
	},1000);
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

var seeDepartments = ()=>{
	var query = 'SELECT department_name FROM products GROUP BY department_name;'
	connection.query(query, (error, results, fields)=>{
		if(error) throw error;
		departments = results;
		seeItemsByDepartment(departments);
	})
}

var makeDepartmentList = (departments)=>{
	departmentList = [];
	departments.forEach((data)=>{
		for(var key in data){
			if(key === 'department_name'){
				departmentList.push(data[key]);
			}
		}
	})
	return departmentList;
}

var seeItemsByDepartment = (departments)=>{
	inquirer.prompt([
		{
			type: 'list',
			choices: makeDepartmentList(departments),
			name: 'department',
			message: 'Select Department to View Their Items'
		}
	]).then((response)=>{
		var query = 'SELECT * FROM products WHERE department_name = ?;'
		connection.query(query, [response.department], (error, response, fields)=>{
			if(error) throw error;
			products = response;
			inquireItemToView(products);
		})
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
	if(product.stock_quantity > 0){
		buyItem(product);
	}
	else{
		console.log('Out of Stock!');
		returnHome();
	}
}

var buyItem = (product)=>{
	inquirer.prompt([
		{
			type: 'list',
			choices: ['Yes', 'No'],
			message: 'Would you like to buy this item?',
			name: 'choice'
		}
	]).then((response)=>{
		switch(response.choice){
			case 'Yes':
				howMany(product);
				break;
			case 'No':
				console.log('');
				returnHome();
				break;
		}
	})
}

var howMany = (product)=>{
	inquirer.prompt([
		{
			type: 'input',
			message: 'How Many Would You Like to Buy?',
			name: 'quantity'
		}
	]).then((response)=>{
		if(parseInt(response.quantity)){
			sellItem(product, response.quantity);
		}
		else{
			console.log('Not a number.');
			returnHome();
		}
	})
}

var sellItem = (product, num)=>{
	var query = 'SELECT stock_quantity FROM products WHERE item_id = ?';
	connection.query(query, [product.item_id], (error, results,field)=>{
		console.log(results);
		if(results[0].stock_quantity > num){
			var query = 'UPDATE products SET stock_quantity=?, product_sales=? WHERE item_id = ?';
			var product_sales = product.product_sales+num*product.price;
			var stock_quantity = results[0].stock_quantity-num;
			// var query = 'UPDATE products SET stock_quantity = ? WHERE item_id =?';
			connection.query(query, [stock_quantity, product_sales, product.item_id],(error, response, field)=>{
				console.log('');
				console.log('You are now the PROUD owner of '+num+' '+product.product_name+'s!');
				console.log('');
				returnHome();
			})
		}
		else{
			console.log('Not Enough Inventory! Buy Less Please!');
			returnHome();
		}
	})
}