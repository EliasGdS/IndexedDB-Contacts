var form = document.getElementsByTagName('form')[0];


form.addEventListener("submit", function () {
    if (form.checkValidity()) {
        console.info("Formulário Validado Com Sucesso");

        //Usando a interface FormData para recuperar dados do formulário
        var formData = new FormData(form);

        // Criando Objeto

        const contact = {
            'name': formData.get('in-contact-name'),
            'email': formData.get('in-contact-email'),
            'phone': formData.get('in-contact-phone')
        };

        event.preventDefault();
        addContact(contact);
        form.reset();

    }
}, false);

function renderAll(contacts) {
    //Limpar dados do tbody
    let table = document.getElementById("contacts-table").getElementsByTagName('tbody')[0];
    const tbodyNew = document.createElement('tbody');
    table.parentNode.replaceChild(tbodyNew, table);

    table = document.getElementById("contacts-table").getElementsByTagName('tbody')[0];

    //Criar linhas e colunas na tabela de contatos
    contacts.forEach(item => {
        const newRow = table.insertRow(table.rows.length);

        const newCell_1 = newRow.insertCell(0);
        const newCell_2 = newRow.insertCell(1);
        const newCell_3 = newRow.insertCell(2);
        const newCell_4 = newRow.insertCell(3);

        const name = document.createTextNode(item['name']);
        const email = document.createTextNode(item['email']);
        const phone = document.createTextNode(item['phone']);

        var param =  item["userid"] ? item["userid"] : '';

        newCell_1.appendChild(name);
        newCell_2.appendChild(email);
        newCell_3.appendChild(phone);
        newCell_4.innerHTML = "<button type='button' onclick='deleteContact(this," + param + ")' class='btn_del'><span><i class='fas fa-user-times fa-3x'></i></span></button>";

        newCell_1.style.borderLeft='none';
        newCell_4.style.borderLeft='none';
    });
}

function renderLine(contactData) {
    
    let table = document.getElementById("contacts-table").getElementsByTagName('tbody')[0];

    //Criar linha e colunas no final da tabela de dados
    contactData.forEach(function(item) {
      
        const newRow = table.insertRow(table.rows.length);

        const newCell_1 = newRow.insertCell(0);
        const newCell_2 = newRow.insertCell(1);
        const newCell_3 = newRow.insertCell(2);
        const newCell_4 = newRow.insertCell(3);

        const name = document.createTextNode(item['name']);
        const email = document.createTextNode(item['email']);
        const phone = document.createTextNode(item['phone']);

        var param =  item["userid"] ? item["userid"] : '';

        newCell_1.appendChild(name);
        newCell_2.appendChild(email);
        newCell_3.appendChild(phone);
        newCell_4.innerHTML = "<button type='button' onclick='deleteContact(this," + param + ")' class='btn_del'><span><i class='fas fa-user-times fa-3x'></i></span></button>";

        newCell_1.style.borderLeft='none';
        newCell_4.style.borderLeft='none';
      
    });
}

const DBNAME = 'customer_db';

const loadDB = () => {
    console.log('Carregando o IndexDB...');
    let customer = new Customer(DBNAME);
    customer.initialLoad();
}

window.addEventListener('load', function() {loadDB()});

const clearDB = () => {
    console.log('Limpando o IndexDB...');
    let customer = new Customer(DBNAME);
    customer.clearAll();

    let table = document.getElementById("contacts-table").getElementsByTagName('tbody')[0];
    const tbodyNew = document.createElement('tbody');
    table.parentNode.replaceChild(tbodyNew, table);
}

const addContact = (contactData) => {
    console.log('Adicionando contato ao IndexDB...');
    let customer = new Customer(DBNAME);
    customer.add(contactData);
}

const searchAll = () => {
    let customer = new Customer(DBNAME);
    customer.getAll();
}

const searchDB = (term) => {
    term = document.getElementById('in-search').value;
    let customer = new Customer(DBNAME);
    customer.search(term);
}

const deleteContact = (row, id) => {
    let customer = new Customer(DBNAME);
    console.log(id);
    customer.removeIndexDB(row, id);
}