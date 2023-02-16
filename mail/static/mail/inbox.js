document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

// Compose email form and content variables

const composeForm = document.getElementById('compose-form');
const composeRecipients = document.getElementById('compose-recipients').value;
const composeSubject = document.getElementById('compose-subject').value;
const composeBody = documen.getElementById('compose-body').value;

// Event handler for sending emails

composeForm.addEventListener('submit', async () => {
  try {
    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: composeRecipients, 
        subject: composeSubject, 
        body: composeBody
      })
    })
    if(response.ok){
      //const jsonResponse = await response.json();  UPDATE THIS TO COMMAND WHAT TO DO AFTER THE EMAIL HAS BEEN SENT!!!
      console.log('EMAIL SENT SUCCESSFULLY')
    }
    throw new Error('Request failed!');
  } catch (error) {
    console.log(error)
  }
})