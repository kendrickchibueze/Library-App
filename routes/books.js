const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const fs  = require('fs');
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeType = ['images/jpeg', 'images/png', 'images/gif']

const upload = multer({

    dest:uploadPath,
    fileFilter:(req, file, callback) => {
    callback(null, imageMimeType )
}

})


// All Books route
router.get('/', async (req, res) => {

    let query = Book.find()
    if(req.query.title != null && req.query.title !=''){
         query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !=''){
        //lte means less than or equal to
         query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !=''){
        //gte means greater than or equal to
         query = query.gte('publishDate', req.query.publishedAfter)
    }

    try {
       const books = await query.exec()
        res.render('books/index', {
            books:books,
            searchOptions: req.query
       })

    } catch (error) {
         res.redirect('/')


    }

})


//New  Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());


})


//create book route
router.post('/', upload.single('cover'), async(req, res)=>{
const fileName  = req.file != null ? req.file.filename : null
   //construct our book object
    const book = new Book({
    title:req.body.title,
    author:req.body.author,
    // req.body.date returns a string, so we convert it to a real date to store in our database
    publishDate: new Date(req.body.publishDate),
    pageCount:req.body.pageCount,
    coverImageName : fileName,
    description:req.body.description
    })
try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)

} catch  {
    if(book.coverImageName != null){
    removeBookCover(book.coverImageName)
    }

    renderNewPage(res, book, true)
}


})

function removeBookCover(fileName) {
    //this uploadPath gives us public/uploads/bookCoverName
    fs.unlink(path.join(uploadPath, fileName), err =>{
    if(err) console.err(err)
    })
}

 async function renderNewPage(res, book, hasError = false){

try {
        //we are passing all authors into this page
   const authors = await Author.find({})
//    const book = new Book()
    const params =  {
            authors: authors,
            book: book

    }
    if(hasError) params.errorMessage ='Error Creating Book'
    res.render('books/new', params)

    } catch {

    res.redirect('/books')

    }
}

module.exports = router