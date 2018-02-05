DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

Use bamazon;

CREATE TABLE products(
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(500) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price DECIMAL(20,2) NOT NULL,
cost DECIMAL(20,2) NOT NULL,
stock_quantity INT NOT NULL DEFAULT 10,
product_sales DECIMAL(20,2) DEFAULT 0,
description VARCHAR(5000) DEFAULT "Description Pending",
PRIMARY KEY (item_id)
);