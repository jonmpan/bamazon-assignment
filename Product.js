var mysql = require("mysql");

function Product(item_id, product_name, department_name, price, cost, stock_quantity, product_sales, description){
	this.item_id = item_id;
	this.product_name = product_name;
	this.department_name = department_name;
	this.price = price;
	this.cost = cost;
	this.stock_quantity = stock_quantity;
	this.product_sales = product_sales;
	this.description = description;
	this.sell = ()=>{
		// console.log('You are now the PROUD owner of '+this.product_name+'!');
	}
	this.view = ()=>{
		process.stdout.write('\x1B[2J\x1B[0f');
		console.log('Product Name: '+this.product_name);
		console.log('Department: '+this.department_name);
		console.log('Item Id: '+this.item_id);
		console.log('Price: 99% off of $'+Math.round(100*this.price)+'! ONLY $'+this.price+'!!!');
		console.log('Stock: '+this.stock_quantity);
		if(this.stock_quantity<10 && this.stock_quantity>0){
			console.log('Almost Out of Stock! Buy ASAP!');
		}
		else if(this.stock_quantity === 0){
			console.log('Out of stock! Too bad!');
		}
		else{
			console.log('Plenty in Stock! Buy Now!');
		}
		console.log('Description: '+this.description);
		console.log('');
	}
}

module.exports = Product;