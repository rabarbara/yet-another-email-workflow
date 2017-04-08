![Yet another email workflow header](https://github.com/rabarbara/yet-another-email-workflow/blob/master/working/img/yaew.png "Yet another email workflwow")

# yet-another-email-workflow
Yet another email workflow to speed up email development

Designing HTML emails can be a very tiresome process, especially if you are doing all the coding manually. You have to inline all the styles, create tables and basically ~~party~~ code like it's 1999. This email workflow aims to take a little bit of that burden of your chest.

It enables you to work fast and focus on the task that is the most important: content and placement.

### IMPORTANT

This project is still under development. Currently, only the `watch` and `build` commands are usable.

## Features

1. Browser reload on change.
2. Scss stylesheets (included is the ink.css file for easier creation of responsive emails)
3. HTML and text versions of the email on build
4. Simple link replacement for a less error prone link creation
5. Automatic Google UTM url parameter addition to links
6. Test emails sent to chosen address (upcoming)
7. Automatic image optimization (upcoming)


## Requirements

1. Node (>6)
2. Mailgun (optional)


## Install

1. Clone this repository.
2. Cd into directory
3. `npm install`


## Getting started

Your most important folder where you will do the majority of work is the working folder.
There you will find an HTML file, an scss folder and a file called `information.json`.

The HTML file will be your starting file to construct your email. The scss folder is for the stylesheets.
The `information.json` file should contain all the meta information about your email, such as the subject, sender, url parameters, urls and so on.

All your HTML content goes into the `working\index.html` file.

### Gulp and NPM

To avoid installing global packages, all gulp tasks are run under npm scripts.

### Development

Run `npm run watch`. The development server will start and a browser window will open.

The two files in the working folder you should edit are the `index.html` and the `scss\styles.scss`.
You should also fill out the information in `information.json`.

#### Information.json

Here you input all the required data. If you do not wish to use the automatic url insertion feature or the url parameter appending feature, leave the links and the parameters section as is.

**Example information.json**

```json
{
  "subject": "My favourite email workflow",
  "senderName": "John Doe",
  "senderEmail":"jd@john-doe.org",
  "replyTo": ["jane.doe@john-doe.org", "office@john-doe.org"],
  "links": {
    "headerLink":"https://www.john-doe.org/header"
  },
  "parameters": {
    "utm": {
      "source": "source",
      "medium": "email",
      "name": "campaignName",
      "term": "email,workflow",
      "content": "email-about-the-content"
    },
  "custom": {
      "jhdp": "a-custom-john-doe-parameter"
    }
  }
}

```

### Build

When you wish to create the complete email, run `npm run build`. This will inline all the css, replace all urls and create a nice txt version of the html as well.
