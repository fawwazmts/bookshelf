const books = [];
const booksSearched = [];
let searchStatus = false;

const RENDER_EVENT = "render-book";
const SAVE_EVENT = "save-book";
const STORAGE_KEY = "BOOK_SELF";
const SEARCH_EVENT = "search-book";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return { id, title, author, year, isCompleted };
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function findBookById(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVE_EVENT));
  }
}

function countBook() {
  if (isStorageExist()) {
    let completed = 0;
    let incompleted = 0;
    if (books.length !== 0) {
      for (const book of books) {
        if (book.isCompleted) {
          completed++;
        } else {
          incompleted++;
        }
      }
    }
    return { completed, incompleted };
  }
}

function countBookSearched() {
  if (isStorageExist()) {
    let completed = 0;
    let incompleted = 0;
    if (booksSearched.length !== 0) {
      for (const book of booksSearched) {
        if (book.isCompleted) {
          completed++;
        } else {
          incompleted++;
        }
      }
    }
    return { completed, incompleted };
  }
}

function loadDatafromStorage() {
  const dataFromStorage = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataFromStorage);

  if (dataFromStorage !== null || data.length !== 0) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1);

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function confirmDeleteBook(bookId) {
  if (confirm("Yakin ingin menghapus buku?")) {
    deleteBook(bookId);
    alert("Buku berhasil dihapus");
  } else {
    return;
  }
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBookById(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBookById(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const bookItem = document.createElement("article");
  bookItem.classList.add("book_item");
  bookItem.setAttribute("id", `book-${bookObject.id}`);

  const bookIdentity = document.createElement("div");
  bookIdentity.classList.add("book_identity");

  const bookIdentityTitle = document.createElement("h4");
  bookIdentityTitle.innerText = bookObject.title;

  const bookIdentityAuthorAndYear = document.createElement("p");
  const bookIdentityAuthor = document.createElement("span");
  bookIdentityAuthor.classList.add("author");
  bookIdentityAuthor.innerText = bookObject.author;
  const bookIdentityYear = document.createElement("span");
  bookIdentityYear.classList.add("year");
  bookIdentityYear.innerText = bookObject.year;
  bookIdentityAuthorAndYear.append(bookIdentityAuthor, " - ", bookIdentityYear);
  bookIdentity.append(bookIdentityTitle, bookIdentityAuthorAndYear);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete");
  const iconDeleteButton = document.createElement("i");
  iconDeleteButton.classList.add("fa", "fa-close");
  deleteButton.append(iconDeleteButton);
  deleteButton.addEventListener("click", function () {
    confirmDeleteBook(bookObject.id);
  });

  if (bookObject.isCompleted) {
    const undoneButton = document.createElement("button");
    undoneButton.classList.add("undone");
    const iconUndone = document.createElement("i");
    iconUndone.classList.add("fa", "fa-rotate-left");
    undoneButton.append(iconUndone);

    undoneButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    actionContainer.append(undoneButton, deleteButton);
  } else {
    const doneButton = document.createElement("button");
    doneButton.classList.add("done");
    const iconDone = document.createElement("i");
    iconDone.classList.add("fa", "fa-check");
    doneButton.append(iconDone);

    doneButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    actionContainer.append(doneButton, deleteButton);
  }
  bookItem.append(bookIdentity, actionContainer);
  return bookItem;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "<p>Buku masih kosong</p>";
  incompleteBookList.innerHTML = "<p>Buku masih kosong</p>";

  let manyBook = countBook();

  if (manyBook.completed !== 0) {
    completeBookList.innerHTML = "";
  }

  if (manyBook.incompleted !== 0) {
    incompleteBookList.innerHTML = "";
  }

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isCompleted) {
      incompleteBookList.append(bookElement);
    } else if (book.isCompleted) {
      completeBookList.append(bookElement);
    }
  }
});

document.addEventListener(SAVE_EVENT, function () {
  alert("Data berhasil disimpan");
});

document.addEventListener(SEARCH_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "<p>Buku tidak ditemukan</p>";
  incompleteBookList.innerHTML = "<p>Buku tidak ditemukan</p>";

  let manyBook = countBookSearched();

  if (manyBook.completed !== 0) {
    completeBookList.innerHTML = "";
  }

  if (manyBook.incompleted !== 0) {
    incompleteBookList.innerHTML = "";
  }

  for (const book of booksSearched) {
    const bookElement = makeBook(book);
    if (!book.isCompleted) {
      incompleteBookList.append(bookElement);
    } else if (book.isCompleted) {
      completeBookList.append(bookElement);
    }
  }
  booksSearched.splice(0, booksSearched.length);
});

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const isBookCompleted = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    isBookCompleted
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook(status) {
  if (status) {
    let searchBookTitle = document.getElementById("searchBookTitle");
    let substring = searchBookTitle.value.toLowerCase();

    for (const book of books) {
      if (book.title.toLowerCase().includes(substring) && substring !== "") {
        booksSearched.push(book);
      }
    }
  } else {
    booksSearched.splice(0, booksSearched.length);
  }
}

function loadSearchForm() {
  const searchSubmit = document.getElementById("searchSubmit");
  const closeSubmit = document.getElementById("closeSubmit");
  const resultCaption = document.querySelector(".result_caption");

  let searchBookTitle = document.getElementById("searchBookTitle");

  searchSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    searchStatus = true;

    resultCaption.removeAttribute("hidden", "");
    closeSubmit.removeAttribute("hidden", "");

    if (searchBookTitle.value == "") {
      resultCaption.lastElementChild.innerText = "!!! Judul masih kosong !!!";
    } else {
      resultCaption.children[1].innerText = searchBookTitle.value;
    }

    searchBook(searchStatus);

    document.dispatchEvent(new Event(SEARCH_EVENT));
  });

  closeSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    searchStatus = false;

    if (confirm("Yakin keluar dari pencarian?")) {
      resultCaption.setAttribute("hidden", "");
      closeSubmit.setAttribute("hidden", "");
      searchBookTitle.value = "";
      searchBook(searchStatus);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const inputBook = document.getElementById("inputBook");

  loadSearchForm();

  inputBook.addEventListener("submit", function (event) {
    addBook();
  });

  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, parsed);
    }
    loadDatafromStorage();
  }
});
