# ProductManagementSystem
A server application to manage inverntory of products using node and swagger documentation

The server is created using express and has two classes of Objects: Products and Categories
Categories are linked to each other in a tree like structure and Products are instantiated of a specific category.
Products can have multiple predefined and addtionally unique properties that can be defined by the user at the time of creation or at the time of updating the product.
Products can be segregated further into different instances of them with each instance of the product having its own SKU (Stock Keeping Unit). 

A corresponding Swagger 2.0 REST API documentation has been written to maintain the formats of the request and response objects. 
