/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/


'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = "amzn1.ask.skill.6d08a8cb-918c-4a77-8823-3d950d0d5477";  // TODO replace with your app ID (OPTIONAL).

const snoowrap = require('snoowrap');//Used to for Reddit API
const r = new snoowrap({
  userAgent: process.env.userAgent,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  refreshToken: process.env.refreshToken
});

const languageStrings = {
    'en-GB': {
        translation: {
            REDDIT_TITLE_INTRO: 'Alexa should learn to ',
            SUCCESS_UPVOTE:"Wow, you are not the first one to ask me for this. Let me ask again on Reddit for somebody to teach me to ",
            SUCCESS_MESSAGE_1:"Nice, it is in Reddit for developers to see. I hope to learn how to ",
            SUCCESS_MESSAGE_2:" very soon",
            SKILL_NAME: 'British Space Facts',
            ERROR_MESSAGE: "Ups, my circuits must be tired. I Couldn't ask anybody to teach me how to ",
            HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'en-US': {
        translation: {
            REDDIT_TITLE_INTRO: 'Alexa should learn to ',
            SUCCESS_UPVOTE:"Wow, you are not the first one to ask me for this. Let me ask on Reddit for somebody to teach me to ",
            SUCCESS_MESSAGE_1:"Nice, it is in Reddit for developers to see. I hope to learn how to ",
            SUCCESS_MESSAGE_2:" very soon",
            ERROR_MESSAGE: "Ups, my circuits must be tired. I couldn't ask anybody to teach me how to ",
            HELP_MESSAGE: 'You can say learn a new skill. Any skill you want. And I will ask somebody in Reddit to teach me',
            HELP_REPROMPT: 'What would you like me to learn?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'de-DE': {
        translation: {
            REDDIT_TITLE_INTRO: 'Alexa sollte es lernen ',
            SUCCESS_UPVOTE:"Wow, du bist nicht der Erste, der mich darum bittet. Lass mich auf Reddit fragen, um jemanden zu lehren ",
            SUCCESS_MESSAGE_1:"Schön, es ist in Reddit für Entwickler zu sehen. Ich hoffe, zu lernen, wie zu",
            SUCCESS_MESSAGE_2:"",
            ERROR_MESSAGE: "Ups, etwas ist schief gelaufen Ich konnte niemanden bitten, mir zu unterrichten ",
            HELP_MESSAGE: 'Sie können sagen, lernen Sie eine neue Fertigkeit. Jede Fähigkeit, die Sie wollen. Und ich werde jemanden in Reddit fragen, um mich zu lehren',
            HELP_REPROMPT: 'Was möchtest du mich lernen?',
            STOP_MESSAGE: 'Auf Wiedersehen!',
        },
    },
};

const handlers = {
    'NewSkill': function () {
        var skill_exists = false;
        var newSkill = this.event.request.intent.slots.skill.value;
        console.log(newSkill);
        r.getUser("Alexa_wish_list").getSubmissions().then((value)=>{
            value.forEach((element, index, array) =>{
                if(element.title == this.t('REDDIT_TITLE_INTRO')+newSkill){
                    console.log("Post exists in Reddit with id " + element.id);
                    skill_exists = true;
                    r.getSubmission(element.id).reply("Alexa you better smarten up. Somebody else just asked for this too!").then(value=>{
                        this.emit(':tell', this.t('SUCCESS_UPVOTE') + newSkill);
                    }, reason => {console.log("Failed to submit comment: "+ reason)})
                }
                else if(!skill_exists && index==array.length -1) {r.getSubreddit('Alexa_Skills').submitSelfpost({title: this.t('REDDIT_TITLE_INTRO')+newSkill, 
                                                       text: "Hi! Somebody asked alexa to learn how to "+newSkill+". Upvote if you agree and want a developer to create this new skill. This skill is called: Make Alexa Learn Anything. I hope you like it! "
                                                    })
                                                    .then(value =>{
                                                        console.log("New reddit post: "+ JSON.stringify(value));
                                                        this.emit(':tell', this.t('SUCCESS_MESSAGE_1') + newSkill + this.t('SUCCESS_MESSAGE_2'));
                                                    },
                                                        reason => {
                                                            console.log("Reddit Call Failed: "+reason);
                                                            this.emit(':tell', this.t('ERROR_MESSAGE') + newSkill);
                                                        }
                                                            );}
            })
        }, reason => {console.log("Failed to get Submissions" + reason)});
        
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};