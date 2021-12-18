const joi =  require('joi');

const registerSchema = joi.object({
    firstname: joi.string().min(3).required(),
    lastname: joi.string().min(1).required(),
    email: joi.string().required(),
    password : joi.string().min(6).required(),
})

const activationschema = joi.object({
    id: joi.required()
})

const loginSchema = joi.object({
    email: joi.string().required(),
    password : joi.string().required(),
})

const forgetPasswordSchema = joi.object({
    email: joi.string().required(),
    time: joi.required()
})

const Newpasswordschema = joi.object({
    id : joi.required(),
    password : joi.string().min(6).required(),
})

const linkvalid = joi.object({
    id:joi.string().required(),
    time : joi.required(),
    code: joi.string().min(6).max(6).required(),
})

module.exports = {
    registerSchema,
    loginSchema,
    forgetPasswordSchema,
    Newpasswordschema,
    activationschema,
    linkvalid
}