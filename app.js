require('dotenv').config({silent: true});
let Botkit = require('botkit');
let mongoose = require("mongoose");

let conversationSchema = new mongoose.Schema({
  company: String,
  product: String,
  category: String,
  audienceGender: String,
  audienceLocation: String,
  audienceAgeRange: String,
  budget: String
});

let Conversation = mongoose.model('Conversation', conversationSchema);
let newConvo = new Conversation();

mongoose.connect(process.env.DB_KEY, function() {
  console.log("Connected");
});

let controller = Botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
controller.spawn({
   token: process.env.TOKEN,
}).startRTM();


let askCompany = function(response, convo) {
  convo.ask('What company do you work for?', function(response, convo) {
    convo.say('Awesome.');
    newConvo.company = response.text;
    askProduct(response, convo);
    convo.next();
  });
}

let askProduct = function(response, convo) {
  convo.ask('What is the name of your products?', function(response, convo) {
    newConvo.product = response.text;
    convo.say('Ok.')
    askCategory(response, convo);
    convo.next();
  });
}

let askCategory = function(response, convo) {
  convo.ask('What category? (mobile game or mobile app)', function(response, convo) {
    newConvo.category = response.text;
    convo.say('Ok.');
    askAudienceGender(response, convo);
    convo.next();
  });
}

let askAudienceGender = function(response, convo) {
  convo.say("I have a few questions about the type of audience you target...")
  convo.ask('is the audience primarily male or female', function(response, convo) {
    newConvo.audienceGender = response.text;
    convo.say('Ok.');
    askAudienceLocation(response, convo);
    convo.next();
  });
}

let askAudienceLocation = function(response, convo) {
  convo.ask('Where is the audience located', function(response, convo) {
    newConvo.audienceLocation = response.text;
    convo.say('Ok...');
    askAudienceAgeRange(response, convo);
    convo.next();
  });
}

let askAudienceAgeRange = function(response, convo) {
  convo.ask('What is the age range of your audience?', function(response, convo) {
    newConvo.audienceAgeRange = response.text;
    convo.say('Ok. One more question and then we are done.');
    askBudget(response, convo);
    convo.next();
  });
}

let askBudget = function(response, convo) {
  convo.ask('What is your budget?', function(response, convo) {
    newConvo.budget = response.text;
    convo.say('Ok. Thank you!');
    logInfo(response, convo);
    convo.next();
  });
}

let logInfo = function(response, convo) {
  newConvo.save();
  convo.say("Your results have been saved.  Thank you for your response.", function(response, convo) {
  });
}

controller.hears('hello', ['direct_message','direct_mention','mention'],function(bot,message) {
    bot.startConversation(message, askCompany);
});

controller.hears('question', ['direct_message'],function(bot,message) {
  bot.startConversation(message, askCompany);
});
