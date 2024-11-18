document.getElementById('addContactBtn').addEventListener('click', function() {
    const name = prompt('הכנס את שם איש הקשר');
    const phone = prompt('הכנס את מספר הטלפון');
    const email = prompt('הכנס את האימייל');
    
    if (name && phone && email) {
        fetch('/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, email })
        })
        .then(response => response.json())
        .then(data => loadContacts())
        .catch(error => console.error('Error:', error));
    }
});

function loadContacts() {
    fetch('/contacts')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#contactsTable tbody');
            tableBody.innerHTML = '';
            data.forEach(contact => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.email}</td>
                    <td>
                        <button onclick="deleteContact(${contact.id})">מחק</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function deleteContact(id) {
    fetch(`/contacts/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => loadContacts())
    .catch(error => console.error('Error:', error));
}

loadContacts(); // לטעון אנשי קשר עם טעינת הדף
