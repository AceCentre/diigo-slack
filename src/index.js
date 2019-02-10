/* **************************************************************
 * Diigo Slack: Add links to diigo from slack
 * Forked from the simple demo by Tomomi Imura (@girlie_mac), this app adds a action to add URLs to your diigo account
 * The original code at https://glitch.com/~slack-action-and-dialog-blueprint
 *
 * Will Wade (@willwade)
 
 To-do: Add the slash command to search for URLS 
        Maybe a bot to keep an eye out for URLs and see if already posted
 
 * **************************************************************/


'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const signature = require('./verifySignature');
const app = express();

const apiUrl = 'https://slack.com/api';

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

/*
/* Endpoint to receive an action and a dialog submission from Slack.
/* To use actions and dialogs, enable the Interactive Components in your dev portal.
/* Scope: `command` to enable actions
 */

app.post('/actions', (req, res) => { 
  const payload = JSON.parse(req.body.payload);
  const {type, user, submission} = payload;
  console.log(payload);
  
  if (!signature.isVerified(req)) { 
    res.sendStatus(404);
    return;
  }

  if(type === 'message_action') {
 
    // Open a dialog with the selected message pre-populated
    var patt = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;;
    var theStr = payload.message.text;
    var urlForPost = theStr.match(patt);
    var nTitle = 'Give it a short snappy title!';
    
    /* too slow
    if (urlForPost.toString() !=''){
      axios.get(urlForPost.toString())
      .then(function (response) {
        // handle success
        //console.log(response);
        var re = new RegExp("<title>(.*?)</title>", "i");
        var body = response.data;
        var nTitle = body.match(re)[1];
        console.log(nTitle);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
    }
    */
    
 
    const dialogData = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id: payload.trigger_id,
      dialog: JSON.stringify({
        title: 'Save it to Diigo!',
        callback_id: 'diigo',
        submit_label: 'Diigo',
        // URL, title, shared, tags, desc, merge: Yes
        elements: [
         {
           label: 'Title',
           type: 'text',
           name: 'title',
           value: nTitle
         }, 
         {
           label: 'Description',
           type: 'textarea',
           name: 'desc',
           value: payload.message.text
         },          
         {
           label: 'Tags',
           type: 'text',
           name: 'tags',
           value: 'Tag1, Tag2'
         },
         {
           label: 'URL',
           type: 'text',
           name: 'url',
           value: urlForPost
         } 
        ] 
      })
    };
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialogData))
      .then((result) => {
        if(result.data.error) {
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
       })
      .catch((err) => {
        res.sendStatus(500);
      });

  } else if (type === 'dialog_submission') {
    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');
    
    // Save the link
    
   const diigo = {
      key: process.env.DIIGO_KEY,
      title: submission.title,
      desc: submission.desc,
      url: submission.url,
      tags: submission.tags,
      shared: "no"
   };
       
   axios.post('https://secure.diigo.com/api/v2/bookmarks', qs.stringify(diigo),{
  auth: {
    username: process.env.DIIGO_USER ,
    password: process.env.DIIGO_PWD
  }
})
    .then((result => {
      console.log(result.data);
    }))
    .catch((err) => {
      console.log(err);
    });
        
    // DM the user a confirmation message
    const attachments = [
     {
       title: 'Link Saved!',
       title_link: 'http://diigo.com/user/acecentre',
       fields: [
         {
           title: 'Title',
           value: submission.title
         }
       ],
     },
   ];

   const message = {
     token: process.env.SLACK_ACCESS_TOKEN,
     channel: user.id,
     as_user: true,
     attachments: JSON.stringify(attachments)
   };

   axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(message))
    .then((result => {
      console.log(result.data);
    }))
    .catch((err) => {
      console.log(err);
    });
  }
});

app.post('/command', (req, res) => {
  // extract the slash command text, and trigger ID from payload
  const { text, trigger_id, channel_id } = req.body;

  // Verify the signing secret
  if (signature.isVerified(req)) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    // Now search diigo with that text
    
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel_id,
    as_user: true,
    text: 'Links',
    attachments: JSON.stringify([
      {
        title: `Searching for links...`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          {
            title: 'Title',
            value: ticket.title,
          },
          {
            title: 'Description',
            value: ticket.description || 'None provided',
          },
          {
            title: 'Status',
            value: 'Open',
            short: true,
          },
          {
            title: 'Urgency',
            value: ticket.urgency,
            short: true,
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
    
  } else {
    debug('Verification token mismatch');
    res.sendStatus(404);
  }
});




const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
