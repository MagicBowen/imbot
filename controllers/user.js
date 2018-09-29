const logger = require('../utils/logger').logger('user')
const Users = require('../models/user-repo')

async function getUser(ctx) {
    const id = ctx.query.id
    try {
        const user = await Users.getUserBy(id)
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {user : user}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get user error: ' + err)
    }
}

async function getUsers(ctx) {
    try {
        const users = await Users.getAllUsers()
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {users : users}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get users error: ' + err)
    }
}

async function addUser(ctx) {
    const user = ctx.request.body
    try {
        await Users.addUser(user)
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = {result : 'success'};        
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('send msg error: ' + err) 
        logger.error(err.stack)  
    }
}

module.exports = {
    'GET /user'   : getUser,
    'POST /user'   : addUser,
    'GET /users'   : getUsers
};