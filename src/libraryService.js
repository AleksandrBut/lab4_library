const fs = require('fs');

const allBooksCachePath = 'public/library.json';
const nextIdCachePath = 'public/nextId.json';

const getAllBooksFromCache = () => {
    return JSON.parse(fs.readFileSync(allBooksCachePath, 'utf-8'));
};

const getAllBooks = (request) => {
    if (isNeedToSort(request)) {
        return getAllBooksSorted(request);
    }

    return getAllBooksFromCache();
};

const getAllBooksSorted = (request) => {
    const sortType = doGetSortType(request);
    let sortedBooks;

    if (sortType === 'availability') {
        sortedBooks = getAllBooksFromCache().sort((firstBook, secondBook) => {
            return !firstBook.takenBy ? -1 : !secondBook.takenBy ? 1 : 0;
        });
    } else if (sortType === 'availabilityDate') {
        sortedBooks = getAllBooksFromCache().sort((firstBook, secondBook) => {
            if (firstBook.takenTo > secondBook.takenTo || secondBook.takenTo === null) {
                return -1;
            } else if (firstBook.takenTo < secondBook.takenTo || firstBook.takenTo === null) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    return sortedBooks;
};

const getSortType = (request) => {
    if (isNeedToSort(request)) {
        return doGetSortType(request);
    }
};

const doGetSortType = (request) => {
    return request.query.sortType;
};

const isNeedToSort = (request) => {
    const requestParams = request.query;

    return requestParams && requestParams.sortType &&
        (requestParams.sortType === 'availability' || requestParams.sortType === 'availabilityDate');
};

const getBookById = id => {
    return getAllBooksFromCache().find(book => book.id === id);
};

const updateBookMainFields = (bookToUpdate, bookInfo) => {
    bookToUpdate.name = bookInfo.name;
    bookToUpdate.author = bookInfo.author;
    bookToUpdate.year = bookInfo.year;
    bookToUpdate.pagesCount = bookInfo.pagesCount;

    return bookToUpdate;
};

const updateBookInfo = (bookId, bookFieldsToUpdate) => {
    const bookToUpdate = getBookById(bookId);
    const updatedBook = updateBookMainFields(bookToUpdate, bookFieldsToUpdate);
    const updatedLibrary = updateBookInLibrary(updatedBook);

    setLibraryCache(updatedLibrary);
};

const takeBook = (bookId, takeBookInfo) => {
    const bookToTake = getBookById(bookId);

    bookToTake.takenBy = takeBookInfo.takenBy;
    bookToTake.takenTo = takeBookInfo.takenTo;

    const updatedLibrary = updateBookInLibrary(bookToTake);
    setLibraryCache(updatedLibrary);
};

const updateBookInLibrary = bookToUpdate => {
    return getAllBooksFromCache().map(book => {
        return book.id === bookToUpdate.id ? bookToUpdate : book;
    });
};

const setLibraryCache = library => {
    fs.writeFileSync(allBooksCachePath, JSON.stringify(library), (err) => {
        if (err) {
            console.log(err);
        }
    });
};

const returnBook = (bookId, returnBookUserName) => {
    const bookToReturn = getBookById(bookId);

    if (bookToReturn.takenBy === returnBookUserName) {
        bookToReturn.takenBy = null;
        bookToReturn.takenTo = null;

        const updatedLibrary = updateBookInLibrary(bookToReturn);
        setLibraryCache(updatedLibrary);
    } else {
        throw new Error('invalid_user');
    }
};

const deleteBook = (bookId) => {
    const updatedLibrary = getAllBooksFromCache().filter((book => book.id !== bookId));
    setLibraryCache(updatedLibrary);
};

const getNextId = () => {
    const nextId = JSON.parse(fs.readFileSync(nextIdCachePath, 'utf-8')).nextId;
    fs.writeFileSync(nextIdCachePath, JSON.stringify({nextId: (+nextId + 1).toString()}));

    return nextId;
};

const addBook = (newBook) => {
    newBook.id = getNextId();

    const updatedLibrary = [...getAllBooksFromCache(), newBook];
    setLibraryCache(updatedLibrary);
};

exports.getAllBooks = getAllBooks;
exports.getBookById = getBookById;
exports.getSortType = getSortType;
exports.updateBookInfo = updateBookInfo;
exports.takeBook = takeBook;
exports.returnBook = returnBook;
exports.deleteBook = deleteBook;
exports.addBook = addBook;
