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

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Request emails from server
  const getEmails = async (mailbox) => {
    try {
      const response = await fetch('emails/' + mailbox);
      const jsonResponse = await response.json();
      return jsonResponse
    } catch (error) {
      console.log(error);
    }
  }
   
  // Populate inbox
  const mailboxEmails = await getEmails(mailbox);
  console.log(mailboxEmails)
/*   mailboxEmails.forEach(email => {
    p = document.createElement('p');
    document.getElementById('emails-view').appendChild(p); 
    att = document.createAttribute('class');
    att.value = 'mailboxEmails';
    p.setAttributeNode(att);
    p.innerHTML = mailboxEmails[email].subject
    
  }); */

  let emailIdCompiler = []

  for (let email in mailboxEmails) {
    console.log(mailboxEmails[email].subject);
    document.getElementById('emails-view').innerHTML +=  `<div id=email${mailboxEmails[email].id} class='mailboxEmails'>
    <span class="from">From: ${mailboxEmails[email].sender} </span> 
    <span class="subject">Subject: ${mailboxEmails[email].subject}</span> 
    <span class="timestamp">${mailboxEmails[email].timestamp}</span>
    </div>`;
    emailIdCompiler.push(mailboxEmails[email].id);
  }

  // Event handler for email clicks
  for (let i = 0; i < emailIdCompiler.length; i++) {
    document.getElementById(`email${emailIdCompiler[i]}`).addEventListener("click", () => {
      console.log(`you just clicked on email${emailIdCompiler[i]} !!`);
    });
  }
}

// Compose email form
const composeForm = document.getElementById('compose-form');

// Event handler for sending emails
composeForm.addEventListener('submit', async event => {
  event.preventDefault();
  
  // Form content variables
  const composeRecipients = document.getElementById('compose-recipients').value;
  const composeSubject = document.getElementById('compose-subject').value;
  const composeBody = document.getElementById('compose-body').value;
  try {
    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: composeRecipients, 
        subject: composeSubject, 
        body: composeBody
      })
    })
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    load_mailbox('sent');
    return;
  } catch (error) {
    console.log(error)
  }
})