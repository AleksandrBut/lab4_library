const express = require('express');
const router = express.Router();
const libraryService = require('../src/libraryService');

router.get('/', (request, response) => {
    response.render('library', {
        books: libraryService.getAllBooks(request),
        sortType: libraryService.getSortType(request)
    });
});

router.get('/book/:id', (request, response) => {
    const id = request.params.id;
    const isEditMode = request.query.editMode === 'true';

    if (isNaN(id)) {
        response.redirect('/invalid_path');
    }

    response.render('book', {book: libraryService.getBookById(request.params.id), isEditMode});
});

router.put('/book/:id', (request, response) => {
    const bookId = request.params.id;

    if (!Number.isNaN(bookId)) {
        libraryService.updateBookInfo(bookId, request.body);
        response.send();
    } else {
        response.status(500).send();
    }
});

router.put('/book/:id/take', (request, response) => {
    const bookId = request.params.id;

    if (!Number.isNaN(bookId)) {
        libraryService.takeBook(bookId, request.body);
        response.send();
    } else {
        response.status(500).send();
    }
});

router.put('/book/:id/return', (request, response) => {
    const bookId = request.params.id;

    if (!Number.isNaN(bookId)) {
        try {
            libraryService.returnBook(bookId, request.body.userName);
            response.send();
        } catch (e) {
            if (e.message === 'invalid_user') {
                response.status(406)
                    .send();
            }
        }
    } else {
        response.status(500)
            .send();
    }
});

router.delete('/book/:id', (request, response) => {
    const bookId = request.params.id;

    if (!Number.isNaN(bookId)) {
        libraryService.deleteBook(bookId);
        response.send();
    } else {
        response.status(500).send();
    }
});

router.get('/book', (request, response) => {
    response.render('newBook', {isEditMode: true, isAddMode: true});
});

router.post('/book', (request, response) => {
    libraryService.addBook(request.body);
    response.send();
});

module.exports = router;
