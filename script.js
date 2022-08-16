const books = []; //array kumpulan objek buku
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS'; //key local storage

//Fungsi untuk mengecek apakah browser mendukung local storage 
function isStorageExist() {
    if(typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true
}

//Fungsi untuk mengambil data dari local storage
function loadData() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

//Memberikan fungsi addBook() ke button submit dan menjalankan fungsi loadData() jika browser mendukung local storage
document.addEventListener('DOMContentLoaded', function () {
    const submitBook = document.getElementById('form');
    submitBook.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
        
    });
    if (isStorageExist()) {
        loadData();
    }
});

//Fungsi untuk menampilkan toast setelah data berhasil tersimpan
function toast() {
    const toast = document.getElementById('toast');
    toast.className = "show";
    setTimeout(function() {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}


//Fungsi untuk menambahkan buku
function addBook() {
    const textTitle = document.getElementById('bookTitle').value;
    const textAuthor = document.getElementById('bookAuthor').value;
    const textYear = document.getElementById('publishedYear').value;
    const checkBox = document.getElementById('isCompleted').checked;

    //Memvalidasi apakah form sudah diisi dengan lengkap
    if( textTitle && textAuthor != '') {
        const generatedID = generateID();
        const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, checkBox);
        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        toast();
    } else {
        alert("Silahkan Lengkapi Form Buku!");
    }
}

//Menggunakan tanggal sebagai id objek
function generateID() {
    return +new Date();
}

//Membuat objek buku
function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

//Menggunakan DOM untuk merender objek buku ke dalam rak buku
document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBook = document.getElementById('book-list');
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('finished-list');
    completedBook.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(!bookItem.isCompleted) {
            uncompletedBook.append(bookElement);
        } else {
            completedBook.append(bookElement);
        }
    }
});

//Menggunakan DOM untuk membuat elemen rak buku
function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isCompleted) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('unread-button');
        unreadButton.innerText = "Belum Selesai Baca";

        unreadButton.addEventListener('click', function() {
            unreadBook(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.innerText = "Hapus Buku";

        removeButton.addEventListener('click', function() {
            removeBook(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = "Edit Buku";

        editButton.addEventListener('click', function() {
            editBook(bookObject.id);
        });

        container.append(unreadButton, removeButton, editButton);

    } else {
        const readButton = document.createElement('button');
        readButton.classList.add('read-button');
        readButton.innerText = "Selesai Baca";

        readButton.addEventListener('click', function() {
            readBook(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.innerText = "Hapus Buku";

        removeButton.addEventListener('click', function() {
            removeBook(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = "Edit Buku";

        editButton.addEventListener('click', function() {
            editBook(bookObject.id);
        });


        container.append(readButton, removeButton, editButton);
    }

    return container;
}

//Fungsi untuk menemukan id dari objek buku yang nanti akan digunakan fungsi lainnya
function findBook(bookId) {
    for(const bookItem of books){
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

//Fungsi untuk memindahkan buku ke rak yang sudah dibaca
function readBook(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Fungsi untuk menghapus buku
function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    const bookObject = findBook(bookId);

    if(bookTarget === -1) return;
    const result = confirm(`Yakin ingin menghapus buku ${bookObject.title}`);
    if (result) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    } else {
        return
    }
}

//Fungsi untuk memindahkan buku ke rak yang belum dibaca
function unreadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Fungsi untuk mencari index pada array buku
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

//Fungsi untuk mengedit objek buku
function editBook(bookId) {
    const bookTarget = findBook(bookId);
    const button = document.getElementsByClassName('edit-button');
    for (var i = 0; i < button.length; i++) {
        button[i].setAttribute('disabled', 'disabled');
    }

    if (bookTarget == null) return;
    //Membuat form edit buku
    const edit = document.getElementById(`book-${bookId}`);
    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-book');
    const textEditTitle = document.createElement('h4');
    textEditTitle.innerText = "Judul Buku";
    const textEditAuthor = document.createElement('h4');
    textEditAuthor.innerText = "Pengarang"
    const textEditYear = document.createElement('h4');
    textEditYear.innerText = "Tahun Terbit";
    const editTitle = document.createElement('input');
    const editAuthor = document.createElement('input');
    const editYear = document.createElement('input');
    const saveEditButton = document.createElement('button');
    editTitle.setAttribute('value', `${bookTarget.title}`);
    editAuthor.setAttribute('value', `${bookTarget.author}`);
    Object.assign(editYear, {
        value : `${bookTarget.year}`,
        type : 'number',
        min : '1900',
        max : '2100',
        step : '1'
    });
    saveEditButton.innerText = "Simpan";
    //Fungsi untuk menyimpan buku yang telah di edit
    saveEditButton.addEventListener('click', function() {
        const bookObject = bookTarget;
        bookObject.title = editTitle.value;
        bookObject.author = editAuthor.value;
        bookObject.year = editYear.value;
        saveData();
    });
    editContainer.append(textEditTitle, editTitle, textEditAuthor, editAuthor, textEditYear, editYear, saveEditButton);
    edit.append(editContainer);
}

//Merender ulang elemen ketika terjadi perubahan data
document.addEventListener(SAVED_EVENT, function () {
    document.dispatchEvent(new Event(RENDER_EVENT));
})

//Menyimpan data ke dalam local storage
function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}