window.addEventListener('load', init, false);

function init() {

  //firebaseInit();
  var urlBase = "http://localhost:3000";
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
      var request = new XMLHttpRequest();
      request.open('POST', urlBase, true);
      request.setRequestHeader('Access-Control-Allow-Origin', '*')
      request.onreadystatechange = sendPostCallback;
      request.send(JSON.stringify(post));
    }

  };


  function updatePost(ppostInfo) {
    console.log(ppostInfo.fbkey + ' ' + ppostInfo.owner);
    postBtn.hidden = true;
    updateBtn.hidden = false;
    cancelBtn.hidden = false;

    titleTxt.value = ppostInfo.title;
    bodyTxt.value = ppostInfo.body;


  }
  function updateBtnOnClick() {

    var request = new XMLHttpRequest();
    request.open('PATCH', urlBase, true);
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {

        var post = currentPostSelected;
        post.title = titleTxt.value;
        post.body = bodyTxt.value;
        post.timestamp = new Date();

        var fbkey = post.fbkey;
        post.fbkey = null;
        var postJson = '{' + JSON.stringify(fbkey) + ':' + JSON.stringify(post) + '}';

        request.send(postJson);

      }
    }
    request.setRequestHeader('Access-Control-Allow-Origin', '*');




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

    if (confirm('Estas seguro de borrar este post')) {
      var url = "https://theevilmouseblog.firebaseio.com/posts/" + ppostInfo.fbkey + ".json";
      var request = new XMLHttpRequest();
      request.open('DELETE', url, true);
      request.onreadystatechange = deletePostCallback;
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
}