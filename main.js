const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const books = [];
const RENDER_EVENT = 'render-book';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
    if (isStorageExist) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const yearString = document.getElementById('inputBookYear').value;
    const year = Number(yearString);
    if (document.getElementById('inputBookIsComplete').checked){
        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, true);
        books.push(bookObject);
    } else {
        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, false);
        books.push(bookObject);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBook(bookObject) {
    const title = document.createElement('h3');
    title.classList.add('h3');
    title.innerText = bookObject.title;

    const author = document.createElement('p');
    author.classList.add('p');
    author.innerText = bookObject.author;

    const year = document.createElement('p');
    year.classList.add('p');
    year.innerText = bookObject.year;

    const action = document.createElement('div');
    action.classList.add('action');

    const bookItem = document.createElement('article');
    bookItem.classList.add('book_item');
    bookItem.append(title, author, year, action);

    const container = document.createElement('div');
    container.append(bookItem);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const green = document.createElement('button');
        green.classList.add('green');
        green.innerText = 'Belum Selesai dibaca';

        green.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        })

        const red = document.createElement('button');
        red.classList.add('red');
        red.innerText = 'Hapus Buku';

        red.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        })

        action.append(green, red);
    } else {
        const green = document.createElement('button');
        green.classList.add('green');
        green.innerText = 'Selesai dibaca';

        green.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        })

        const red = document.createElement('button');
        red.classList.add('red');
        red.innerText = 'Hapus Buku';

        red.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        })

        action.append(green, red);
    }

    return container;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    var hapus = confirm('Ingin Menghapus Buku?');
    
    if (hapus) {
        const bookTarget = findBookIndex(bookId)
    
        if (bookTarget === -1) return;
    
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompleteBookshelfList = document.getElementById('uncompleteBookshelfList');
    uncompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete)
            uncompleteBookshelfList.append(bookElement);
        else
            completeBookshelfList.append(bookElement);
    }
});
