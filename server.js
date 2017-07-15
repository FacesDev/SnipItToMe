const express = require('express');
const data = require('./data.js');
const models = require("./models");
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const crypto = require('crypto');
const application = express();

application.engine('mustache', mustache());
application.set('views', './views');
application.set('view engine', 'mustache');
application.use(express.static(__dirname + '/public'));
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));

application.use(expressValidator());


application.use(session({
    secret: "secretkey",
    saveUninitialized: true,
    resave: false,
}));

function hashPassword(password) {
    const secret = 'abcdefg';
    const hash = crypto.createHmac('sha256', secret)
        .update(password)
        .digest('hex');
    return hash
};


//user routes

application.get('/', (request, response) => {
    return response.render('login');
});

application.get('/signup', (request, response) => {
    return response.render('signup');
})



application.post('/api/signup', async (request, response) => {
    request.checkBody('username', 'No Username Provided. ').notEmpty();
    request.checkBody('username', 'Must be less than 100 characters. ').matches(/^.{0,100}$/, "i");
    request.checkBody('password', 'No password was provided.  ').notEmpty();
    request.checkBody('password', "Password must be valid").matches(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/, "i");
    request.checkBody('confirm', 'No confirmation was provided.  ').notEmpty();
    request.checkBody('confirm', "Confirmation must be valid").matches(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/, "i");
    var errors = request.validationErrors();
    var model = { errors: errors, display: display };
    if (errors) {
        return response.status(400).json(model);
    }
    else {
        var user = await models.User.findOne({
            where: {
                username: request.body.username,
            }
        });
        if (user) {
            var model = {
                message: "Username Already Exists"
            }
            return response.status(400).json(model);
        }
        else if (request.body.username && request.body.password) {

            var user = {
                username: request.body.username,
                password: hashPassword(request.body.password),
                display: request.body.display
            };
            request.session.user_name = request.body.username;
            request.session.display = request.body.display;
            request.session.userId = user.id;
            request.session.isAuthenticated = true;
            var display = request.session.display;
            models.User.create(user);
            return response.status(200).json(user);
        }
        else {
            var model = {
                message: "Please Fill in All Fields"
            }
            return response.status(400).json(model);
        }
    }

});

application.post('/api/login', async (request, response) => {

    request.checkBody('username', 'No Username Provided. ').notEmpty();
    request.checkBody('username', 'Must be less than 100 characters. ').matches(/^.{0,100}$/, "i");
    request.checkBody('password', 'No password was provided.  ').notEmpty();
    request.checkBody('password', "Password must be valid").matches(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/, "i");
    var errors = request.validationErrors();
    if (errors) {
        var model = { errors: errors };
        request.session.isAuthenticated = false;
        return response.status(400).json(model);
    } else {
        var user = await models.User.findOne({
            where: {
                username: request.body.username,
                password: hashPassword(request.body.password)
            }
        })
        if (!user) {

            request.session.isAuthenticated = false;
            var model = {
                message: "User Not Found"
            }
            return response.status(400).json(model);

        } else {

            request.session.user_name = request.body.username;
            request.session.password = request.body.password;
            request.session.display = user.display;
            request.session.userId = user.id

            request.session.isAuthenticated = true;

            var model = {
                message: "Logged In",
                display: user.display
            }
            return response.status(200).json(model);
        }
    }
});


application.get('/api/logout', (request, response) => {
    request.session.destroy();
    var model = {
        message: "Logged Out"
    }
    return response.redirect('/');
    // return response.status(200).json(model);
});

application.get('/desktop', async (request, response) => {
    if (request.session.isAuthenticated == true) {
        var result = await models.Snippet.all();
        var display = request.session.display;
        var model = { result: result, display: display };
        response.render("desktop", model);
    } else {
        response.redirect('/');
    }
});
// Snippet routes

//create snippet
application.post('/api/snippet', async (request, response) => {
    var snippet = {
        userId: request.session.userId,
        title: request.body.title,
        code: request.body.code,
        note: request.body.note,
        language: request.body.language,
        tag: request.body.tag
    }
    var result = await models.Snippet.create(snippet);
    var model = {
        result: result,
        snippet: snippet
    }
    return response.status(200).json(model);

});

//sort by language
application.post('/api/snippet/language', async (request, response) => {
    var snippet = await models.Snippet.findAll({
            where: {
                language: request.body.language 
            }
    })
    var model = {
        snippet: snippet
    }
    if (snippet) {
        console.log('snippet: ', snippet);
        // return response.status(200).json(snippet);
        return response.render('select', model);
    }
    else {
        return response.status(400).json({ message: "No snippets found with associated tag" });
    }
});
//sory by tag
application.post('/api/snippet/tag', async (request, response) => {
var snippet = await models.Snippet.findAll({
            where: {
                tag: request.body.tag
            }
    })
    if (snippet) {
        var model = {
            snippet: snippet
        }
        return response.render('select', model);
    }
    else {
        return response.status(400).json({ message: "No Tags Found" });
    }
});
//show all for username
application.post('/api/snippet/username', async (request, response) => {
    var snippet = await models.Snippet.all({
            where: {
                userId: request.session.userId
            }
    })

    if (snippet) {
        var model = {
            snippet: snippet
        }
        return response.render('select', model);
    }
    else {
        return response.status(400).json({ message: "No snippets found with associated username" });
    }
});
//show individual snippet
application.get('/api/snippet/:id', async (request, response) => {
 var snippet = await models.Snippet.findOne({
            where: {
                id: request.params.id
            }
        })

        var model = {
            snippet: snippet
        }
        return response.render('individual-snippet', model);
   
});



application.listen(3000);
module.exports = application;