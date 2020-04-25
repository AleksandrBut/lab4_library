const doSort = () => {
    const sortTypeElement = document.getElementById('sortType');
    const sortType = sortTypeElement.options[sortTypeElement.selectedIndex].value;

    location.href = `library${sortType === 'none' ? '' : '?sortType=' + sortType}`;
};

const deleteBook = (bookId) => {
    fetch(`${location.protocol}//${location.host}${location.pathname}/book/${bookId}`, {
            method: 'DELETE'
        }
    ).then((response) => {
        if (response.status === 200) {
            alert('Book successfully deleted');
            location.reload(true);
        } else {
            alert('Service is temporary unavailable. Please try again later');
        }
    });
};
