document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => { compose_email('none', 'none', 'none'); });

  // By default, load the inbox
  load_mailbox('inbox');
});

// Update archive status
async function archiveEmail(email, archived) {
  document.getElementById(`email${email}`).parentElement.setAttribute('hidden', 'hidden')
  if (archived) {
    try {
      const response = await fetch(`emails/${ email }`, {
        method: 'PUT',
        body: JSON.stringify ({
        archived: false
        })
      })
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const response = await fetch(`emails/${ email }`, {
        method: 'PUT',
        body: JSON.stringify ({
        archived: true
        })
      })
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
};

function compose_email(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (recipient === 'none'){
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    // Format subject to have Re: only once
    subject = subject.replace(/^Re:/, "")
    // Update composition fields for reply
    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = `Re: ${subject}`;
    document.querySelector('#compose-body').value = body;
  }
}

async function load_email(email, type) {

  document.querySelector('#emails-view').innerHTML = `<h3>Email</h3>`;

  // Update email's read status
  try {
    const response = await fetch(`emails/${ email }`, {
      method: 'PUT',
      body: JSON.stringify ({
        read: true
      })
    })
    console.log(response)

    // Request email details
    const getResponse = await fetch(`emails/${ email }`);
    const emailDetail = await getResponse.json();

    // Format variables to be used as function parameters
    const recipient = emailDetail.sender.replace(/'/g, "\\&#39;");
    const subject = emailDetail.subject.replace(/'/g, "\\&#39;");
    const timestamp = emailDetail.timestamp.replace(/'/g, "\\&#39;");
    let body = emailDetail.body.replace(/'/g, "\\&#39;");
    // Reformat body to avoid found bug when multiple replies occurred
    body = body.split('\n').join(' ')
    
    // Render email details. Read (type) emails don't render reply button
    if (type === 'other') {
      document.getElementById('emails-view').innerHTML +=  `<div id=readEmailInfo>
      <p><b>From:</b> ${emailDetail.sender}</p>
      <p><b>To:</b> ${emailDetail.recipients}</p>
      <p><b>Subject:</b> ${emailDetail.subject}</p> 
      <p><b>Timestamp:</b> ${emailDetail.timestamp}</p>
      <hr>
      <p style="line-height: normal;"> ${ emailDetail.body } </p>
      </div>
      <button class="replyButton btn btn-primary" 
      onclick="compose_email('${recipient}', '${subject}', 'On ${ timestamp }, ${ recipient } wrote: ${ body }')">Reply</button>`;
    } else {
      document.getElementById('emails-view').innerHTML +=  `<div id=readEmailInfo>
      <p><b>From:</b> ${emailDetail.sender}</p>
      <p><b>To:</b> ${emailDetail.recipients}</p>
      <p><b>Subject:</b> ${emailDetail.subject}</p> 
      <p><b>Timestamp:</b> ${emailDetail.timestamp}</p>
      <hr>
      <p style="line-height: normal;"> ${ emailDetail.body } </p>
      </div>`
    }
    
  }catch (error) {
    console.log(error);
  }
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
   
  // Variable for populating mailbox
  const mailboxEmails = await getEmails(mailbox);
  console.log(mailboxEmails)

  // Compiler arrays for event handler
  let emailIdCompiler = []
  let emailStatusCompiler = []

  // Rendering loop for Sent mailbox and others
  if (mailbox === 'sent') {
    for (let email in mailboxEmails) {
      console.log(mailboxEmails[email].subject);
      console.log(mailboxEmails[email].archived)
      document.getElementById('emails-view').innerHTML +=  `<div class="emailContainer"><span id="email${mailboxEmails[email].id}" class='mailboxEmails'>
      <span class="from">From: ${mailboxEmails[email].sender} </span> 
      <span class="subject">Subject: ${mailboxEmails[email].subject}</span> 
      <span class="timestamp">${mailboxEmails[email].timestamp}</span>
      </span></div>`;
      emailIdCompiler.push([mailboxEmails[email].id, 'sent']);
      emailStatusCompiler.push(mailboxEmails[email].read)
    }
  } else {
    for (let email in mailboxEmails) {
      let archivedStatus = mailboxEmails[email].archived
      archivedStatus ? archivedStatus = 'Unarchive' : archivedStatus = 'Archive'
      document.getElementById('emails-view').innerHTML +=  `<div class=emailContainer><span id="email${mailboxEmails[email].id}" class='mailboxEmails'>
      <span class="from">From: ${mailboxEmails[email].sender} </span> 
      <span class="subject">Subject: ${mailboxEmails[email].subject}</span> 
      <span class="timestamp">${mailboxEmails[email].timestamp}</span>
      </span><button class="buttonEmail btn btn-light" onclick="archiveEmail(${mailboxEmails[email].id}, ${mailboxEmails[email].archived})">${ archivedStatus }</button></div>`;
      emailIdCompiler.push([mailboxEmails[email].id, 'other']);
      emailStatusCompiler.push(mailboxEmails[email].read)
    }
  }

  // Event handler for email clicks
  for (let i = 0; i < emailIdCompiler.length; i++) {
    document.getElementById(`email${emailIdCompiler[i][0]}`).addEventListener("click", () => {
      console.log(`You just clicked on email${emailIdCompiler[i][0]} !!`);
      load_email(emailIdCompiler[i][0], emailIdCompiler[i][1]);
    });
    if (emailStatusCompiler[i] === true) {
      document.getElementById(`email${emailIdCompiler[i][0]}`).classList.add("readStatus");
    }
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