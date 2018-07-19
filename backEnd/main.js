//agregar dependencias
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var uniqid = require('uniqid');

var port = 3000;
var localHost = 'localhost';

var server = http.createServer(function (request, response) {
    var parseUrl = url.parse(request.url, true);
    var path = parseUrl.pathname;
    var method = request.method;
    var query = parseUrl.query;
    var buffer = '';
    path = path.replace(/^\/+|\/+$/g, '');
    var headers = request.headers;

    console.log(path);
    console.log(method);



    switch (path) {
        case 'posts':
            switch (method) {
                case 'OPTIONS':
                    respondToOptions(request, response);
                    break;
                case 'GET':
                    getPost(request, response);
                    break;
                case 'POST':
                    postPost(request, response);
                    break;
                case 'PATCH':
                    updatePost(request, response);
                    break;
                case 'DELETE':
                    deletePost(request, response, parseUrl.query.key);
                    break;
                default:
                    send404(request, response);
                    break;
            }

            break;
        default:
            console.log('Request not porecess')
            send404(request, response);
            break;
    }


    let data = [];

    request.on('data', function (chunk) {
        // data.push(chunk);
    });

    request.on('end', function (chunk) {
        /*
        body = Buffer.concat(body).toString();
        body =JSON.parse(body);
        console.log(body);*/
    })
    //console.log(`cliente solicitando ${path}, y el metodo: ${method}, y el query ${query.posts}`);
    //console.log(path);


    //response.end('<h1>hola Mundo</h1>');
});


//var server = http.createServer((request, response) => { response.end('<h1>hola Mundo</h1>')});

server.listen(port, localHost, function () {
    console.log('server is nuning');

});

function addCrossHeaders(request, response) {
    var origin = '*';

    if (request.headers['origin']) {
        origin = request.headers['origin']
    }

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'access-control-allow-credentials');
    response.setHeader('Access-Control-Allow-Headers', 'access-control-allow-origin');
}

function loadPosts() {
    return new Promise(loadPostPromiseExecuter);
}

function loadPostPromiseExecuter(resolve, reject) {
    fs.readFile(path.resolve(process.cwd(), './data/posts.json'), function (err, data) {
        if (err) {
            reject(null);
        } else {
            //var postsData = JSON.parse(data);
            //var post = postsData['posts'];
            //console.log(post);
            var post = JSON.parse(data);
            resolve(post);
        }
    })
}

function savePosts(posts){
    return new Promise(function (resolve, reject){
        fs.writeFile(path.resolve(process.cwd(), './data/posts.json'),JSON.stringify(posts), function (err){
            if (err){
                reject();
            }else{
                resolve();
            };
        });
    });
};

/*function getPost(request, response) {
    addCrossHeaders(request, response);

    console.log('');

    loadPosts().then(resolve).catch(reject);

    function resolve(posts) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        })
        response.write(JSON.stringify(posts));
        response.end();
    }

    function reject() {
        response.writeHead(404)
        response.end();
    }
}*/

function getPost(request, response){
    addCrossHeaders(request, response);

    loadPosts().then(function (post){
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });

        response.write(JSON.stringify(posts));
        response.end();
    }).catch(function (){
        send404(request, response)
    });
}

function respondToOptions(request, response) {
    addCrossHeaders(request, response);

    console.log(request);
    console.log(request);
    
    

    response.writeHead(200);
    response.end();

}

function postPost(request, response) {

    addCrossHeaders(request, response);
    let buffer = [];
    let post = null;

    request.on('data', function (chunk){
        buffer.push(chunk);
    })

    request.on('end', function () {

        buffer = Buffer.concat(buffer).toString();
        post = JSON.parse(buffer);

        loadPosts().then(function (posts){
            posts[uniqid()] = post;
            savePosts(posts).then(function () {
                response.writeHead(200);
                response.end();
            }).catch(function(){
                send404(request, response);
            });
        }).catch(function (){
            send404(request, response);
        });
    });

};

function deletePost(request, response, key) {
    addCrossHeaders(request, response);

    loadPosts().then(function (post) {
        delete post[key];

        savePosts(post).then(function () {
            response.writeHead(200);
            response.end();
        }).catch(function () {
            send404(request, response);
        });
    }).catch(function () {
        send404(request, response);
    })
}

function updatePost(request, response){
    addCrossHeaders(request, response);

    let buffer = [];
    let post = null;

    request.on('data', function (chunk){
        buffer.push(chunk);
    });

    request.on('end', function(){
        buffer = Buffer.concat(buffer).toString();
        post = JSON.parse(buffer);

        console.log(post);

        loadPosts().then(function (posts){

            for(const key in posts){
                for(const keyToUpdate in post){
                    if(key === keyToUpdate){
                        posts[key] = post[key];
                    }
                }
            }
        }).catch(function(){
            send404(request, response);
        });
    })
}

function send404(request, response) {
    addCrossHeaders(request, response);
    response.writeHead(404, {
        'Content-Type': 'application/json'
    });
    response.end();
}