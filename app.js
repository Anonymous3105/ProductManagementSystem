const express = require("express")
const cors = require("cors")
const classes = require("./classes.js")

var app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// Defining Sample categories
clothing = new classes.Category("clothing", 0, 10)
shirt = new classes.Category("shirt", clothing)
electronics = new classes.Category("electronics", 0, 18)
laptop = new classes.Category("laptop", electronics, 18)

// Defining Sample Products
asus_laptop = new classes.Product("ASUS Notebook 8BG RAM 1TB ROM", laptop, "ASUS", 50000,
    {live_status:false, ram:"8GB", color: "black"}
)
linen_shirt = new classes.Product("Raymond Mens Formal Shirt White Small", shirt, "Raymond", 1800,
    {live_status:true, size:'S', color:"white", material:"linen", image_url: "/images/linen_shirt_1.jpg"}
)

// Adding all the sample products, categories and product instances in the locals directory
app.locals.store_categories = [
    clothing, shirt, electronics, laptop
]
app.locals.store_products = [
    asus_laptop, linen_shirt
]
app.locals.store_product_instances = {}

// Home Page
app.get("/", (req, res) => {
    res.send({
        "message": "Welcome to the product management system",
        "categories": app.locals.store_categories,
        "products": app.locals.store_products
    })
})

/* APIs on Products */

// Get product by ID
app.get("/products/findByID/:prod_id", (req, res) => {
    query_prod_id = req.params.prod_id
    temp = app.locals.store_products.find((value) => (value.pid == query_prod_id))

    if (temp)
        res.status(200).send(temp.getPackagedOutput())
    else
        res.status(404).send({ "message": "The specified product ID is not found"})
})


// Get all products that have the name
app.get("/products/findByName", (req, res) => {
    name_keyword = req.query.name
    results = app.locals.store_products.filter((value) => {
        return RegExp(name_keyword, 'i').test(value.name)
    })

    if (results) {
        res.status(200).send(results.map((value) => value.getPackagedOutput()))
    } else {
        res.status(404).send("The specified keywords match no products")
    }
})

// Create a new product of existing category
app.post("/products/post", (req, res) => {
    product = req.body
    category_of_product = app.locals.store_categories.find((value) => (value.cid == product.category_id))

    if (category_of_product && product.name && product.brand && product.price) {
        temp = new classes.Product(
            product.name,
            category_of_product,
            product.brand,
            product.addn_data || {},
            product.price
        )
        app.locals.store_products.push(temp)

        res.status(200).send({
            success: true,
            id: temp.pid,
            url: `/products/findByID/${temp.pid}` 
        })
    } else {
        res.status(400).send({
            success: false,
            message: "The given product specifications cannot be added."
        })
    }
})

// Update an existing product
app.put("/products/change/:prod_id", (req, res) => {
    original_product = app.locals.store_products.find((value) => (value.pid) == req.params.prod_id)
    new_product = req.body
    // console.log(new_product)
    if (original_product) {
        //original_product.id = new_product.id || original_product.id
        original_product.brand = new_product.brand || original_product.brand
        original_product.price = new_product.price || original_product.price
        category_of_product = app.locals.store_categories.find((value) => (value.cid == original_product.category_id)) 
        if(category_of_product){
            original_product.category_id = new_product.category_id || original_product.category_id
            original_product.category = new_product.category || category_of_product
        }
        if (new_product.addn_data) {
            Object.keys(original_product.addn_data).forEach(elem => {
                if (elem in Object.keys(new_product.addn_data))
                    original_product.addn_data[elem] = new_product.addn_data[elem]
            })            
        }
        res.status(200).send({
            success: true,
            id: original_product.pid,
            url: `/products/findByID/${original_product.pid}`
        })
    } else {
        res.status(404).send("Product not found")
    }
})

// Delete an existing product
app.delete("/products/delete/:prod_id", (req, res) => {
    prod_index = app.locals.store_products.findIndex((value) => value.pid == req.params.prod_id)
    if (prod_index == -1) {
        res.status(404).send("Product not found.")        
    } else {
        app.locals.store_products.splice(prod_index, 1)
        res.status(200).send("Product deleted successfully")
    }
})

// Get the base and Taxed price of a product
app.get("/products/getPrice/:prod_id", (req, res) => {
    product = app.locals.store_products.find((value) => (value.pid == req.params.prod_id))
    if (product) {
        res.status(200).send(product.getPrice())
    } else {
        res.status(404).send("Product Not Found.")
    }
})

// Create an instance of a product and get the SKU (Stock keeping Unit) of the instance
app.get("/products/createInstance/:prod_id", (req, res) => {
    product = app.locals.store_products.find((value) => (value.pid == req.params.prod_id))
    if (product) {
        instance_id = product.addProductInstance()

        res.status(200).send({
            prod_id: product.pid,
            instance_id: instance_id
        })
    } else {
        res.status(404).send("Product not found")
    }
})


/*  APIs on Categories  */

// Get category by ID
app.get("/categories/findByID/:cat_id", (req, res) => {
    query_cat_id = req.params.cat_id
    temp = app.locals.store_categories.find((value) => (value.cid == query_cat_id))

    if (temp)
        res.status(200).send(temp.getPackagedOutput())
    else
        res.status(404).send({ "message": "The specified category ID is not found"})
})

// Get all categories that have the following names
app.get("/categories/findByName", (req, res) => {
    name_keyword = req.query.name
    results = app.locals.store_categories.filter((value) => {
        return RegExp(name_keyword, 'i').test(value.name)
    })

    if (results) {
        res.status(200).send(results.map((value) => value.getPackagedOutput()))
    } else {
        res.status(404).send("The specified keywords match no categories")
    }
})

// Add a new Category
app.post("/categories/post/", (req, res) => {
    category = req.body
    console.log(category)
    if (!category) {
        res.status(400).send({
            status: false,
            message: "Request was incorrectly formed. Part 1"        
        })
        return;
    }
    parent_category = app.locals.store_categories.find((value) => (value.cid == category.parent_category_id))

    if (parent_category && category.name && category.parent_category_id && category.tax_rate) {
        temp = new classes.Category(
            category.name,
            category.parent_category,
            category.tax_rate
        )
        app.locals.store_categories.push(temp)

        res.status(200).send({
            success: true,
            id: temp.cid,
            url: `/categories/findByID/${temp.cid}`
        })
    } else {
        res.status(400).send({
            status: false,
            message: "Request was incorrectly formed. Part 2"
        })
    }


})

// Update an existing category
app.put("/categories/change/:cat_id", (req, res) => {
    original_category = app.locals.store_categories.find((value) => (value.cid == req.params.cat_id))
    new_category = req.body

    if (original_category) {
        original_category.name = new_category.name || original_category.name
        original_category.tax_rate = new_category.tax_rate || original_category.tax_rate
        
        if (original_category.parent_category_id){
            orig_parent_category = app.locals.store_categories.find((value) => (value.cid == original_category.parent_category_id))
            if(orig_parent_category)
                orig_parent_category.children_category_ids.filter((value) => (value != original_category.cid))
        }
        original_category.parent_category_id = new_category.parent_category_id || original_category.parent_category_id
        
        orig_parent_category = app.locals.store_categories.find((value) => (value.cid == original_category.parent_category_id))
        if (orig_parent_category) {
            orig_parent_category.children_category_ids.push(orignal_category.id)
        }

        res.status(200).send({
            success: true,
            id: original_category.cid,
            url: `/categories/findByID/${original_category.cid}`
        })
    } else {
        res.status(400).send({
            success: false,
            message: "Invalid request format"
        })
    }
})

// Delete an existing category and delete all associated products
app.delete("/categories/delete/:cat_id", (req, res) => {
    cat_index = app.locals.store_categories.findIndex((value) => value.cid == req.params.cat_id)
    if (cat_index == -1) {
        res.status(404).send("Category not found.")       
    } else {
        remove_products = app.locals.store_categories[cat_index].products
        app.locals.store_categories[cat_index].products.forEach((value) => {
            temp_index = app.locals.store_products.findIndex((v) => (v.pid == v))
            if (temp_index) {
                app.locals.store_products.splice(temp_index, 1)
            }
        })
        app.locals.store_products.splice(cat_index, 1)
        res.status(200).send({
            message: "Category and associated products successfully deleted",
            prods_arr: remove_products
        })
    }
})


app.listen(3000, () => {
    console.log(`Server is running on port 3000.`);
});