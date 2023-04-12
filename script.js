'use strict'

const form = document.querySelector('#contactForm')
const $table = $('#table')
const CLASS_CONTACT_ROW = '.main-table__tr'
const CLASS_DELETE_BTN = 'deleteBtn'
const CLASS_EDIT_BTN = 'editBtn'
let contactList = []

form.addEventListener('submit', onFormSubmit)
$table.on('click', '.' + CLASS_DELETE_BTN, deleteContact)
      .on('click', '.' + CLASS_EDIT_BTN, editContact)
inputName.focus()

TableAPI.getList()
    .then((data) => {
        renderList(data)
        contactList = data
    })
    .catch((error) => {
        showError(error)
    })

function onFormSubmit(e){
    e.preventDefault()  
      
    const contact = getData()
    clearForm()
    inputName.focus()

    if(!isDataValid(contact)){
        showError(new Error('Введенные данные не валидны!'))
        return
    }

    if(contact.id){
        updateContact(contact.id, contact)
    } else {
        createContact(contact)
    }
}

function getData(){
    const id = form.id.value
    const contact = findContactById(id) || {}

    return {
        ...contact,
        name: form.inputName.value,
        surname: form.inputSurname.value,
        phone: form.inputPhone.value,
    }
}

function renderList(list){
    const html = list.map(createTableRowWithNewData)

    $table.append(html)
}

function findContactById(id){
    return contactList.find(contact => contact.id === id)
}

function findContactRow(element){
    return element.closest(CLASS_CONTACT_ROW)
}

function createTableRowWithNewData(data){
    return `
    <tr class='main-table__tr' data-id=${data.id}>
        <td class="main-table__td">
            <span>${data.name}</span>
        </td>
        <td class="main-table__td">
            <span>${data.surname}</span>
        </td>
        <td class="main-table__td">
            <span>${data.phone}</span>
        </td>
        <td>
            <button type="button" class="editBtn">Edit</button>
            <button type="button" class="deleteBtn">Delete</button>
        </td>
    </tr>
    `
}

function deleteContact(e){
    const target = e.target
    const contactRow = findContactRow(target)
    const id = contactRow.dataset.id

    TableAPI.delete(id)
    .then(() => {
        deleteRow(contactRow)
        const idInList = contactList.indexOf(findContactById(id))
        contactList.splice(idInList, 1)
    })
    .catch((error) => {
        showError(error)
    })
}

function createContact(contact){
    TableAPI.create(contact)
        .then((contact) => {
            $table.append(createTableRowWithNewData(contact))
            contactList.push(contact)
        })
        .catch((error) => {
            showError(error)
        })
}

function editContact(e){
    const target = e.target
    const id = findContactRow(target).dataset.id
    fillForm(findContactById(id))
}

function updateContact(id, newContact){
    TableAPI.update(id, newContact)
        .then((newContact) => {
            const number = contactList.indexOf(findContactById(id))
            contactList.splice(number, 1, newContact)
            replaceContactRow(id, newContact)
        })
        .catch((error) => {
            showError(error)
        })
}

function fillForm(contact){
    form.inputName.value = contact.name
    form.inputSurname.value = contact.surname
    form.inputPhone.value = contact.phone
    form.id.value = contact.id
}

function replaceContactRow(id, contact){
    const oldContactRow = document.querySelector(`[data-id="${id}"]`)
    const newContactRow = createTableRowWithNewData(contact)
    oldContactRow.outerHTML = newContactRow
}

function deleteRow(row){
    row.remove()
}

function showError(error){
    alert(error.message)
}

function isDataValid(data){
    return isValidName(data.name) && isValidName(data.surname) && isNotEmpty(data.phone)
}

function isNotEmpty(value){
    return value.trim()
}

function isNumber(value){
    return !isNaN(value) && isNotEmpty(value)
}

function isValidName(value){
    return isNotEmpty(value) && !isNumber(value)
}

function clearForm(){
    form.reset()
}