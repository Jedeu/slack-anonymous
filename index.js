var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function createError(errorMessage) {
    return {
        error: errorMessage
    };
}

function getUsageHelp(commandName) {
    function createSample(target) {
        return commandName + ' *' + target + '* I know what you did last summer';
    }

    var text = 'Expected usage: \n' +
        commandName + ' help -- Displays help message.\n' +
        createSample('#channel') + " -- Sends to the person's channel.\n";

    return text;
}

function getFullHelp(commandName) {
    var text =
        'Allows to send anonymous messages to channels.\n' +
        'The most convenient and safe way is to open up a conversation with slackbot in Slack and type the commands there, so that nobody detects that you are typing and you don\'t accidentally reveal yourself by typing an invalid command.\n' +
        'Messages and authors are not stored, and the sources are available at <https://github.com/TargetProcess/slack-anonymous>.\n' +
        '\n' +
        getUsageHelp(commandName);

    return text;
}

function createResponsePayload(requestBody) {
    
    var hookUrls = {
        "#chinh": process.env.CHINH_URL,
        "#holland": process.env.HOLLAND_URL,
        "#gaby": process.env.GABY_URL,
        "#louis": process.env.LOUIS_URL,
        "#norman": process.env.NORMAN_URL,
        "#genevieve": process.env.GENEVIEVE_URL,
        "#jed": process.env.JED_URL,
        "#natalie": process.env.NATALIE_URL,
        "#peter": process.env.PETER_URL,
        "#jana": process.env.JANA_URL
    };

    if (!requestBody) {
        return createError('Request is empty');
    }

    var text = requestBody.text;
    var command = requestBody.command;

    if (!text || text === 'help') {
        return createError(getFullHelp(command));
    }

    
    var splitted = text.split(" ");
    if (splitted.length <= 1) {
        return createError(getUsageHelp(command));
    }

    var target = splitted[0];
    if (target.indexOf("<") >= 0) {
        target = target.substring(target.indexOf("|") + 1, target.indexOf(">"));   
    }
    var remainingText = splitted.slice(1).join(' ');
    remainingText = 'Someone said "' + remainingText + '"';
    
    return {
        target: target,
        text: remainingText,
        url: hookUrls[target]
    };
}

app.post('/', function(req, response) {
    var payloadOption = createResponsePayload(req.body);
    if (payloadOption.error) {
        response.end(payloadOption.error);
        return;
    }

    request({
        url: payloadOption.url,
        json: { text: payloadOption.text },
        method: 'POST'
    }, function (err) {
        if(err) {
            console.error(err);
            response.end('Unable to post your anonymous message: ' + JSON.stringify(err));
        } else {
            response.end('Successfully delivered your message to ' + payloadOption.target);
        }

    });
});

app.get('/', function(request, response) {
    response.write('HELLO THERE');
    response.end();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
