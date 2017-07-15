const assert = require("assert");
const data = require('./data.js')
const models = require("./models");
const request = require('supertest');
const application = require("./server");
const crypto = require('crypto');

function hashPassword(password) {
    const secret = 'abcdefg';
    const hash = crypto.createHmac('sha256', secret)
        .update(password)
        .digest('hex');
    return hash
};

describe("user controller", function () {
    it('should load root', function (done) {
        request(application)
            .get('/')
            .expect(200)
            .end(done);
    })
    it('should load signup', function (done) {
        request(application)
            .get('/signup')
            .expect(302)
            .end(done);
    })
    it("should signup", function (done) {
        request(application)
            .post("/api/signup")
            .send({ username: "Charles", password: "Qwer1234", confirm: 'Qwer1234' })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, { username: "Charles", password: hashPassword('Qwer1234') })
            })
            .end(done);
    })
    it("should fail signup", function (done) {
        request(application)
            .post("/api/signup")
            .send({ username: "Chris", password: 'Qwer1234' })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, { message: "Username Already Exists" });
            })
            .end(done);
    })
    it("should fail signup", function (done) {
        request(application)
            .post("/api/signup")
            .send({ password: 'Qwer1234' })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, { message: "Please Fill in All Fields" });
            })
            .end(done);
    })
    it("should login", function (done) {
        request(application)
            .post("/api/login")
            .send({ username: "Chris", password: 'Qwer1234' })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, { message: "Logged In", display: "Faces" });
            })
            .end(done);
    })
    it("should return user not found", function (done) {
        request(application)
            .post("/api/login")
            .send({ username: "Nope", password: 'Qwer1234' })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, { message: "User Not Found" });
            })
            .end(done);
    })
    it("should fail to log in", function (done) {
        request(application)
            .post("/api/login")
            .send({ username: "Chris", password: 'Qwer14' })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, { message: "Wrong Password" });
            })
            .end(done);
    })
    it("should logout", function (done) {
        request(application)
            .post("/api/logout")
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, { message: "Logged Out" });
            })
            .end(done);
    })
});

describe("Snippet controller", function () {
    it("should return created snippet", function (done) {
        request(application)
            .post("/api/snippet")
            .send({
                userId: 1,
                title: "My Snippet",
                code: "console.log('hello')",
                note: "this is my snip",
                language: "Javascript",
                tag: "Hello"
            })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, {
                    userId: 1,
                    title: "My Snippet",
                    code: "console.log('hello')",
                    note: "this is my snip",
                    language: "Javascript",
                    tag: "Hello"
                });
            })
            .end(done);
    })
    it("should return only C++ snips", function (done) {
        request(application)
            .post("/api/snippet/languages/C++")
            .send({
                language: "C++"

            })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, {
                    "userId": 1,
                    "title": "My Snippet",
                    "code": "C++ code snippet",
                    "note": "This is a snippet",
                    "language": "C++",
                    "tag": "C++"
                });
            })
            .end(done);
    })
    it("should return only hip tag snips", function (done) {
        request(application)
            .post("/api/snippet/findTag/hip")
            .send({
                tag: "hip"
            })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, {
                    "userId": 1,
                    "title": "My Snippet",
                    "code": "['hip', 'hip']",
                    "note": "This is a snippet",
                    "language": "Javascript",
                    "tag": "hip"
                });
                
            })
            .end(done);
        
    })
    it("should return only userId 2 snips", function (done) {
        request(application)
            .post("/api/snippet/userId/2")
            .send({
                userId: 2
            })
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, {
                    "userId": 2,
                    "title": "My Snippet",
                    "code": "console.log(endWorld())",
                    "note": "This is a snippet",
                    "language": "Javascript",
                    "tag": "hips"
                });
            })
            .end(done);
    }) 
    it("should fail language", function (done) {
        request(application)
            .post("/api/snippet/languages/C")
            .send({
                language: "C"

            })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, {
                    message: "No snippets found with associated tag"
                });
            })
            .end(done);
    })
    it("should fail tags", function (done) {
        request(application)
            .post("/api/snippet/findTag/hi")
            .send({
                tag: "hi"
            })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, {
                    message: "No Tags Found"
                });
                
            })
            .end(done);
        
    })
    it("should fail to find userId", function (done) {
        request(application)
            .post("/api/snippet/userId/5")
            .send({
                userId: 5
            })
            .expect(400)
            .expect(response => {
                assert.deepEqual(response.body, {
                    message: "No snippets found with associated id"
                });
            })
            .end(done);
    })


});