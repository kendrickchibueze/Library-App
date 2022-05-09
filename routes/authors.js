const express = require('express');
const router = express.Router();
const Author = require('../models/author')


// All Authors route
router.get('/', async (req, res) => {
let searchOptions = {}

//a get request send information through the query string while post send through the body
if (req.query.name != null && req.query.name !== ''){

    // the i flag means that it would be case insensitive
  searchOptions.name = new RegExp(req.query.name, 'i')
}
    try {
        const authors = await Author.find(searchOptions)

       // The searchOptions we pass here is to send back the
       //request to the user so that it will repopulate the input search field for them
        res.render('authors/index', {
            authors: authors,
            searchOptions : req.query
        })

    } catch (error) {
        res.redirect('/')

    }
})


//New Author Router
router.get('/new', (req, res) => {

   //this author variable will be passed to our ejs
    res.render('authors/new', {author: new Author()})
})


//create author route
router.post('/', async(req, res)=>{
    //creating a new author
    const author = new Author({
        //using only the name from req.body
        name : req.body.name
    })
    try {
        const newAuthor = await author.save()
      //  res.redirect(`authors/${newAuthor.id}`)
        res.redirect(`authors`)

    } catch (error) {
        res.render('authors/new', {
        author: author,
        errorMessage : 'Error creating an Author'
    })
    }


})


module.exports = router