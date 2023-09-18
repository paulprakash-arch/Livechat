module.exports = func => (req, res, next)=>
    Promise.resolve(func(req, res, next)).catch(next)   //its just catch the asynchronous error from the create products
 // here the func argument is the newProduct function in productController.js it catches the asynchronous error

//func means the async function