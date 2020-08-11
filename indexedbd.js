class Customer {
    constructor(dbName) {
        this.dbName = dbName;
        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB.");
        }
    }

    /**
   * Preenche o BD do cliente com um conjunto inicial de dados
   * @memberof Customer
   */

    initialLoad = () => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = (event) => {
            // Enviar mensagem ao campo de log informando o erro.
            console.log('initialLoad - Database error: ', event.target.error.code, " - ", event.target.error.message);
        }

        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            // Cria um objectStore para conter a informação sobre nossos clientes. Usa "id" como key path.
            const objectStore = db.createObjectStore('contacts', { keyPath: 'userid', autoIncrement: true });

            objectStore.oncomplete = (event) => {
                console.log('IndexDB inicializado com sucesso.');
            }

            objectStore.onerror = (event) => {
                console.log('initialLoad - objectStore error: ', event.target.error.code,
                    " - ", event.target.error.message);
            };

            // Cria um índice para buscar clientes pelo nome. Podemos ter nomes duplicados, então não podemos usar como índice único.
            objectStore.createIndex('name', 'name', { unique: false });
            // Cria um índice para buscar clientes pelo email. Não podemos ter emails duplicados, então podemos usar como índice único.
            objectStore.createIndex('email', 'email', { unique: true });

            db.close;
        };
    }

    clearAll = () => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = (event) => {
            console.log('removeAllRows - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };

        request.onsuccess = (event) => {
            console.log('Deletando todos os contatos...');

            // Referência o BD aberto
            const db = event.target.result;
            // Transação 
            const txn = db.transaction('contacts', 'readwrite');

            txn.onerror = (envet) => {
                console.log('removeAllRows - Txn error: ', event.target.error.code,
                    " - ", event.target.error.message);
            };

            txn.oncomplete = (event) => {
                console.log('Todos os contatos foram removidos!');
            };

            // Chama o Objeto
            const objectStore = txn.objectStore('contacts');
            const getAllKeysRequest = objectStore.getAllKeys();

            getAllKeysRequest.onsuccess = (event) => {
                getAllKeysRequest.result.forEach(key => {
                    objectStore.delete(key);
                });
            }

            let table = document.getElementById("contacts-table").getElementsByTagName('tbody')[0];
            const tbodyNew = document.createElement('tbody');
            table.parentNode.replaceChild(tbodyNew, table);

            db.close;
        }
    }

    add = (contactData) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = (event) => {
            console.log('removeAllRows - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const txn = db.transaction('contacts', 'readwrite');

            txn.oncomplete = (event) => {
                console.log('Contato adicionado com sucesso.');
            };

            const objectStore = txn.objectStore('contacts');
            const request = objectStore.add(contactData);

            request.onsuccess = (event) => {
                let item = [];
                contactData.userid = event.target.result;
                item.push(contactData);

                console.log("contato Com Id => ", item);

                renderLine(item);
            }


            db.close;
        };
    }

    getAll = () => {
        const request = indexedDB.open(this.dbName);

        let contacts = [];

        request.onerror = (event) => {
            console.log('removeAllRows - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };

        request.onsuccess = (event) => {
            console.log("Carregando todos os contatos.");

            const db = event.target.result;
            const txn = db.transaction('contacts', 'readonly');
            const objectStore = txn.objectStore('contacts');

            // Abrindo Cursor
            const r_cursor = objectStore.openCursor();

            r_cursor.onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor) {
                    contacts.push(cursor.value);
                    // Próximo contato armazenado
                    cursor.continue();
                }
                else {
                    console.log('Não existem mais contatos para buscar.');
                    renderAll(contacts);
                }

            }

        }

    }

    search = (term) => {
        const request = indexedDB.open(this.dbName);

        request.onerror = (event) => {
            console.log('removeAllRows - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const txn = db.transaction('contacts', 'readonly');
            const objectStore = txn.objectStore('contacts');

            const index_1 = objectStore.index('name');
            const index_2 = objectStore.index('email');

            const keyRange = IDBKeyRange.only(term);

            const contactsByName = [];
            const contactsByEmail = [];

            //Abrindo Cursor
            //Eu poderia usar o método get, mas se tivermos mais de um contato o método vai pegar o de menor chave
            //Cursor vai retornar todos os contatos localizados
            const searchByName = index_1.openCursor(keyRange);

            searchByName.onsuccess = (event) => {
                let cursor = event.target.result;

                if (cursor) {
                    contactsByName.push(cursor.value);
                    cursor.continue();
                }
                else {
                    const searchByEmail = index_2.openCursor(keyRange);

                    searchByEmail.onsuccess = (event) => {
                        cursor = event.target.result;

                        if (cursor) {
                            contactsByEmail.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            //Transformar aray (contendo contactsByName + contactsByEmail) para JSON
                            let str = JSON.stringify(contactsByName.concat(contactsByEmail));

                            //Retorna os itens únicos. Remove os repetidos.
                            let contacts = JSON.parse(str).filter((li, idx, self) => self.map(itm => itm.id).indexOf(li.id) === idx);

                            renderAll(contacts);
                        }
                    }
                }
            }
        }
    }

    removeIndexDB = (row, id) => {
        const request = indexedDB.open(this.dbName);

        request.onerror = (event) => {
            console.log('removeAllRows - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const txn = db.transaction('contacts', 'readwrite');
            const objectStore = txn.objectStore('contacts');

            const delRequest = objectStore.delete(id);

            delRequest.onsuccess = (event) => {
                const i = row.parentNode.parentNode.rowIndex;
                document.getElementById('contacts-table').deleteRow(i);
            }

        }
    }
}


