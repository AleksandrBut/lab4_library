const reloadPage = (isEditMode) => {
    location.href = `${getCurrentPathWithoutParams()}?editMode=${isEditMode}`;
};

const getCurrentPathWithoutParams = () => {
    return `${getHomeUrl()}${location.pathname}`;
};

const getHomeUrl = () => {
    return `${location.protocol}//${location.host}`;
};

const goToLibraryPage = () => {
    location.href = `${getHomeUrl()}/library`;
};

const saveBookInfo = () => {
    const bookToSave = getCurrentBook();

    fetch(getCurrentPathWithoutParams(), {
        method: 'PUT',
        body: JSON.stringify(bookToSave),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        processResponseWithReloadOnSuccess(response, 'Book updated successfully!', false);
    });
};

const processResponseWithReloadOnSuccess = (response, successMessage, isAddNewBook) => {
    if (response.status === 200) {
        alert(successMessage);

        if (!isAddNewBook) {
            reloadPage(false);
        }
    } else {
        if (response.status === 406) {
            alert("You didn't take this book");
        } else {
            alert('Service is temporary unavailable. Please try again later');
        }
    }
};

const getCurrentBook = () => {
    const name = document.getElementById('name').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const pagesCount = document.getElementById('pagesCount').value;

    return {
        name,
        author,
        year,
        pagesCount
    };
};

const takeBook = () => {
    const takenBy = prompt('Please enter your name', '');
    const takenTo = prompt('Please return date (yyyy-mm-dd)', '');

    const bookInfo = {
        takenBy,
        takenTo
    };

    if (!Number.isNaN(Date.parse(takenTo))) {
        if (takenBy !== '') {

            fetch(`${getCurrentPathWithoutParams()}/take`, {
                method: 'PUT',
                body: JSON.stringify(bookInfo),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                processResponseWithReloadOnSuccess(response, 'Book successfully taken!', false);
            });
        } else {
            alert('Name can not be empty');
        }
    } else {
        alert(`Provided date (${takenTo}) is invalid`);
    }
};

const returnBook = () => {
    const userName = prompt('Please enter your name', '');

    if (userName !== '') {
        fetch(`${getCurrentPathWithoutParams()}/return`, {
            method: 'PUT',
            body: JSON.stringify({userName}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            processResponseWithReloadOnSuccess(response, 'Book successfully returned!', false);
        });
    } else {
        alert('Name can not be empty');
    }
};

const hasNoEmptyMainFields = book => {
    return book.name.trim() !== '' && book.author.trim() !== '' &&
        book.year.trim() !== '' && book.pagesCount.trim() !== '';
};

const addBook = () => {
    const newBook = getCurrentBook();

    newBook.takenBy = null;
    newBook.takenTo = null;

    if (hasNoEmptyMainFields(newBook)) {
        fetch(getCurrentPathWithoutParams(), {
            method: 'POST',
            body: JSON.stringify(newBook),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            processResponseWithReloadOnSuccess(response, 'Book successfully added!', true);
            goToLibraryPage();
        });
    } else {
        alert('New book can not contain empty fields');
    }
};
