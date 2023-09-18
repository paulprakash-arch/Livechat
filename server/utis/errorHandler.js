class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message)    //we send the constructor message to the parent class
        this.statusCode = statusCode;
        Error.captureStackTrace(this,ErrorHandler)     //in this->this mentions ErrorHandler it is object|| Error gets object and sets its property as stack so we can handle errors

}
}

module.exports = ErrorHandler;