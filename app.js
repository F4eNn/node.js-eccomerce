/** @format */

const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')


const MONGODB_URI = 'mongodb+srv://mati:Seconds1!@cluster0.bnjw8mh.mongodb.net/shop'

const app = express()
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
})

app.set('view engine', 'ejs')
app.set('views', 'views')

const csrfProtection = csrf()


const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

const error = require('./controllers/error')
const User = require('./models/user')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }))

app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
	try {
		if (!req.session.user) {
			return next()
		}
		const user = await User.findById(req.session.user._id)
		req.user = user
		next()
	} catch (error) {
		console.log(error)
	}
})

app.use((req,res,next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn
	res.locals.csrfToken = req.csrfToken()
	next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(error.get404)

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		app.listen(3000)
	})
	.catch(err => console.log(err))
