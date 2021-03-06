window.addEventListener('load', init, false);

function init() {

  //firebaseInit();
  var urlBase = "http://localhost:3000/";
  var titleTxt = document.getElementById('titleTxt');
  var bodyTxt = document.getElementById('bodyTxt');
  var postBtn = document.getElementById('postBtn');
  var updateBtn = document.getElementById('updateBtn');
  var deleteBtn = document.getElementById('deleteBtn');
  var cancelBtn = document.getElementById('cancelBtn');
  var editBtn = document.getElementById('editBtn');
  var postContainer = document.getElementById('postsContainer');
  var owner = 'Jeison';
  var currentPostSelected = null;

  postBtn.hidden = false;
  updateBtn.hidden = true;
  cancelBtn.hidden = true;

  postBtn.onclick = postBtnOnClick;
  updateBtn.onclick = updateBtnOnClick;
  cancelBtn.onclick = cancelBtnOnClick;
  //editBtn.onclick = editBtnOnClick;

  postContainer.addEventListener('click', selectPost, false);



  var posts = [];
  var slectedPostUI = null;
  var moveToBottom = false;


  requestAllPost();

  function requestAllPost() {

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {

        var postsData = JSON.parse(request.responseText);

        for (const key in postsData) {
          var postData = postsData[key];
          var editable = false;
          if (postData.owner === owner) {
            editable = true;
          }

          var newPost = new Post(key, postData.title, postData.body, postData.owner, postData.timestamp);
          var newPostUI = new PostUI(newPost, owner);
          posts.push(newPost);


        }

      }
    }

    request.open("GET", urlBase + '/posts', true);
    request.setRequestHeader('Access-Control-Allow-Origin', '*')
    request.send();
  }

  function sendPostCallback(event) {
    var request = event.target;
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        requestAllPost();

      } else {
        console.log('Error on request: ', request.status)
      }

    }
  }

  function postBtnOnClick() {

    if (titleTxt.value === '' || bodyTxt.value === '') {
      alert('Los datos del post no estan completos');

    } else {
      var post = new Post(null, titleTxt.value, bodyTxt.value, owner, true);
      console.log(post);

      var request = new XMLHttpRequest();
      request.open('POST', urlBase + '/posts', true);
      request.setRequestHeader('Access-Control-Allow-Origin', '*')
      request.onreadystatechange = sendPostCallback;
      request.send(JSON.stringify(post));

      cleanForm();
    }

  };


  function updatePost(ppostInfo) {
    console.log(ppostInfo.fbkey + ' ' + ppostInfo.title + ' ' + ppostInfo.body + ' ' + ppostInfo.owner);
    postBtn.hidden = true;
    updateBtn.hidden = false;
    cancelBtn.hidden = false;

    titleTxt.value = ppostInfo.title;
    bodyTxt.value = ppostInfo.body;

    console.log('¿? ' + titleTxt.value + ' ' + bodyTxt.value);

  }


  function updateBtnOnClick() {

    let titleTxt2 = document.getElementById('titleTxt');
    let bodyTxt2 = document.getElementById('bodyTxt');

    var postJson = null;

    var request = new XMLHttpRequest();
    console.log('ok');
    request.open('PATCH', urlBase + 'posts', true);
    request.setRequestHeader('Access-Control-Allow-Origin', '*');

    //request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        console.log(currentPostSelected);

        currentPostSelected.title = titleTxt2.value;
        currentPostSelected.body = bodyTxt2.value;

        console.log(currentPostSelected);

        var post = currentPostSelected;
        //post.title = titleTxt.value;
        //post.body = bodyTxt.value;
        post.timestamp = new Date();


        console.log(titleTxt2.value);
        console.log(bodyTxt2.value);



        var fbkey = post.fbkey;
        post.fbkey = null;
        postJson = '{' + JSON.stringify(fbkey) + ':' + JSON.stringify(post) + '}';

        console.log(JSON.parse(postJson));
        cleanForm();
      }
    };
    request.send(postJson);

    postBtn.hidden = false;
    updateBtn.hidden = true;
    cancelBtn.hidden = true;



  };

  function updatePostCallback(event) {
    var request = event.target;

    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        requestAllPost();
      } else {
        console.log('Error on request', request.status);

      }
    }
  }

  function cancelBtnOnClick() {
    console.log('Edicion Cancelada');

    postBtn.hidden = false;
    updateBtn.hidden = true;
    cancelBtn.hidden = true;

    cleanForm();

  };

  function deletePostCallback(event) {
    var request = event.target;

    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        requestAllPost();
      } else {
        console.log('Error on request', request.status);

      }
    }
  }


  function deleteBtnOnClick(ppostInfo) {
    console.log(ppostInfo.fbkey);

    console.log(urlBase + 'posts?query=' + ppostInfo.fbkey);


    if (confirm('Estas seguro de borrar este post')) {
      var urlX = urlBase + 'posts?query=' + ppostInfo.fbkey;
      var request = new XMLHttpRequest();
      request.open('DELETE', urlX, true);
      request.onreadystatechange = deletePostCallback;
      request.setRequestHeader('Access-Control-Allow-Origin', '*');
      request.send();
      //removeSelectedPostStyle();
    }

  };



  function selectPost(event) {
    currentPostSelected = getPostByFbKey(event.target);

    if (event.target.id === 'update') {
      updatePost(currentPostSelected);
    } else {
      if (event.target.id === 'delete') {
        deleteBtnOnClick(currentPostSelected);
      }
    }



  };

  function getPostByFbKey(target) {
    var postSelected = null;

    for (var i = 0; i < posts.length; i++) {
      if (posts[i].fbkey === target.parentElement.id) {
        postSelected = posts[i];
        console.log(postSelected);
      }
    }

    if (postSelected === null && target.parentElement !== null) {
      return (target.parentElement);
    } else {
      if (postSelected !== null) {
        return postSelected;
      } else {
        return null;
      }
    }
  }


  function cleanForm() {
    titleTxt.value = null;
    bodyTxt.value = null;
  }
}