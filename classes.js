const DEFAULT_TAXRATE = 18

class Category {
	constructor(name, parent_category, tax_rate){
		this.name = name
		this.children_category_ids = []
		
		Category.count = Category.count ? Category.count+1 : 1
		this.cid = Category.count
		
		if (parent_category) {
			parent_category.children_category_ids.push(this.cid)
			this.parent_category_id = parent_category.id
		} else {
			this.parent_category_id = 0
		}
		
		// if tax_rate is given store the tax_rate
		// if tax_rate is null category will have tax_rate of parent
		// if the object doesn't have a tax_rate and also not a parent then default tax_rate is stored
		this.tax_rate = tax_rate ? tax_rate : (this.parent_category ? this.parent_category.tax_rate : DEFAULT_TAXRATE)
// 
		this.products = []
	}
	
	addProduct(p){
		this.products.push(p.pid)
	}

	getPackagedOutput() {
		let output = {
			"cid": this.cid,
			"name": this.name,
			"parent_category_id": this.parent_category_id,
			"child_category_ids": this.children_category_ids,
			"tax_rate": this.tax_rate,
			"products": this.products,
			"links": []
		}
		output.links.push({
			"rel": "Parent Category",
			"href": `categories/findByID/${this.parent_category_id}`,
			"method": "GET"
		})
		
		this.products.forEach(element => {
			output.links.push({
				"rel": "Product of the Category",
				"href": `products/findByID/${element}`,
				"method": "GET"
			})
		});
		return output
	}
}

class Product {
	constructor(name, category, brand, price, addn_data){
		this.name = name
		this.brand = brand
		this.addn_data = addn_data
		this.price = price
		this.instances = 0
		
		Product.count = Product.count ? Product.count+1 : 1
		this.pid = Product.count
		
		this.category = category
		this.category_id = category.cid
		category.addProduct(this)
	}
	
	addProductInstance(){
		this.instances++
		return this.pid.toString().padStart(5, '0') + "-" + this.instances.toString().padStart(5, '0')
	}

	getPrice(){
		return {
			prod_id: this.pid,
			base_price: this.price,
			taxed_price: this.price * (1 + this.category.tax_rate / 100)
		}
	}

	getPackagedOutput(){
		return {
			"pid": this.pid,
			"name": this.name,
			"brand": this.brand,
			"addn_data": this.addn_data,
			"category_id": this.category_id,
			"links": [
				{
					"rel": "category",
					"href": `/categories/findByID/${this.category_id}`,
					"method": "GET"
				}
			]
		}
	}
}

exports.Product = Product
exports.Category = Category

/*
addn_data = {
	metadata,
	image_links,
	family(optional),
}
*/