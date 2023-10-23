/** @format */

const express = require('express')
const { check, body } = require('express-validator')
const router = express.Router()

const authController = require('../controllers/auth')
const User = require('../models/user')

router.get('/login', authController.getLogin)

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.').normalizeEmail(),
        body('password', 'Provide a valid password.')
            .isLength({ min: 5 })
            .isAlphanumeric().trim(),
    ],
    authController.postLogin
)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please entera a valid email.')
            .custom(async (value, { req }) => {
                const userDoc = await User.findOne({ email: value })
                if (userDoc) {
                    return Promise.reject('Email exist already, please pick a different one.')
                }
            }).normalizeEmail(),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .isLength({ min: 5 })
            .isAlphanumeric().trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value === req.body.password) {
                return true
            }
            throw new Error('Passwords have to match!')
        }).trim(),
    ],
    authController.postSignup
)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router
