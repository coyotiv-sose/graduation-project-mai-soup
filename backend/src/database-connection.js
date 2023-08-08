const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI).then(() => console.log('connected to mongo'))

// const Cat = mongoose.model('Cat', { name: String })

// const kitty = new Cat({ name: 'Zildjian' })
// kitty.save().then(() => console.log('meow'))
