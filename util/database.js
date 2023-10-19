/** @format */

const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-complete', 'root', 'Seconds1!', { dialect: 'mysql', host: 'localhost' })

module.exports = sequelize