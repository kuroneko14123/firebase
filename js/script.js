$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDrkbkqjaYYam7Qt2IGsNtO-_FoZHlFeY0",
        authDomain: "webchat-80fea.firebaseapp.com",
        databaseURL: "https://webchat-80fea.firebaseio.com",
        projectId: "webchat-80fea",
        storageBucket: "webchat-80fea.appspot.com",
        messagingSenderId: "451608753742"
    };
    firebase.initializeApp(config);
    var dbRef = firebase.database().ref().child('object');
    var database = firebase.database();
    var photoURL;
    const $email = $('#email');
    const $password = $('#password');
    const $btnSignIn = $('#btnSignIn');
    const $btnSignUp = $('#btnSignUp');
    const $btnSignOut = $('#btnSignOut');
    const $btnSubmit = $('#btnSubmit');
    var btnChatRoom = $('#btnChatRoom');
    var btnViewProfile = $('#btnViewProfile');
    var editProfile = $('#editProfile');
    var $messageField = $('#messageInput');
    var $messageList = $('#example-messages');
    const file = $('#file');
    var $logged = $('#logged');
    var dbCharRoom = database.ref().child('chatroom');
    var storageRef = firebase.storage().ref();
    var profileName = $('#profile-name');
    var profileEmail = $('#profile-email');
    var img = $('#img');
    var signInfo = $('user-info');
    var clearMessage = $('#clearMessage');
    var description = $('#description');


    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var file = evt.target.files[0];

        var metadata = {
            'contentType': file.type
        };

        // Push to child path.
        // [START oncomplete]
        storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
            console.log('Uploaded', snapshot.totalBytes, 'bytes.');
            console.log(snapshot.metadata);
            photoURL = snapshot.metadata.downloadURLs[0];
            console.log('File available at', photoURL);
        }).catch(function(error) {
            // [START onfailure]
            console.error('Upload failed:', error);
            // [END onfailure]
        });
        // [END oncomplete]
    }



    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $logged.html(user.email + " is login");
            user.providerData.forEach(function(profile) {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);
            });
            const userId = user.uid;
            const userdata = database.ref('users/' + userId);
            var userSnapshot;
            userdata.once('value').then(function(snapshot) {
                var chatRoomUserName = $('#chatRoomUserName');
                userSnapshot = snapshot.val();
                if (userSnapshot == null && !/profile\.html$/.test(window.location.href)) {
                    window.location = "./profile.html";
                }
                var tempUsername = userSnapshot.username || user.email;
                chatRoomUserName.html(tempUsername);
                profileName.html(userSnapshot.username);
                profileEmail.html(userSnapshot.email);
                description.html(userSnapshot.description);
                img.attr("src", userSnapshot.profile_Picture);
                console.log(userSnapshot.username);
            });


            if (user) {
                const loginName = user.displayName || user.email;
                signInfo.html(loginName + " is login...");
            }
        } else {
            $logged.html("no one login");

            console.log("not logged in");
        }
        if (/chatRoom\.html$/.test(window.location.href)) {
            dbCharRoom.limitToLast(10).on('child_added', function(snapshot) {
                //GET DATA
                var data = snapshot.val();
                var username = data.name || "anonymous";
                var message = data.text;
                var imgSrc = data.photoURL;
                //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
                var $messageElement = $("<li>");
                var $nameElement = $("<img src='" + imgSrc + "' class='demo-avatar'>" + "<strong class='example-chat-username'></strong>");
                //var imgElement = $("<img src='" + userSnapshot.profile_Picture + "' class='demo-avatar'>");
                $nameElement.text(username);
                $messageElement.text(message).prepend($nameElement);

                //ADD MESSAGE
                $messageList.append($messageElement)

                //SCROLL TO BOTTOM OF MESSAGE LIST
                $messageList[0].scrollTop = $messageList[0].scrollHeight;
            });
        }
        $messageField.keypress(function(e) {
            if (e.keyCode == 13) {
                //FIELD VALUES
                var username = userSnapshot.username;
                var message = $messageField.val();
                console.log(username);
                console.log(message);

                //SAVE DATA TO FIREBASE AND EMPTY FIELD
                dbCharRoom.push({ name: username, text: message, photoURL: userSnapshot.profile_Picture });
                $messageField.val('');
            }
        });

    });

    $btnSignUp.click(function(e) {
        const email = $email.val();
        const password = $password.val();
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email, password);
        promise.catch(function(e) {
            console.log(e.message);
        });
        promise.then(function(e) {
            window.location.href = "./profile.html"
        });
    });

    $btnSignIn.click(function(e) {
        const email = $email.val();
        const password = $password.val();
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email, password);

        promise.catch(function(e) {
            console.log(e.message);
        });
        promise.then(function(e) {
            window.location.href = "./chatRoom.html";
        });
    });

    $btnSignOut.click(function(e) {
        firebase.auth().signOut();
        if (!/index\.html$/.test(window.location.href)) {
            window.location = "./index.html";
        }
    });

    file.change(handleFileSelect);

    $btnSubmit.click(function(e) {
        var user = firebase.auth().currentUser;
        const userId = user.uid;
        const userName = $('#userName');
        const job = $('#job');
        const age = $('#age');
        const email = $email.val()
        var description = $('#descriptions');
        const promise = database.ref('users/' + userId).set({
            username: userName.val(),
            email: user.email,
            job: job.val(),
            age: age.val(),
            profile_Picture: photoURL || '',
            description: description.val()
        });
        window.location.href = "./viewProfile.html";
        promise.then(function() {
            const user = firebase.auth().currentUser;
            var userdata = firebase.database.ref('users/' + userId);
            return userdata.once('value').then(function(snapshot) {
                profileName.html(snapshot.val().username);

            });
            if (user) {
                profileEmail.html(user.email);
                img.attr("src", photoURL);
                const loginName = user.displayName || user.email;
                signInfo.html(loginName + " is login...");
            }

        });
    });

    btnChatRoom.click(function(e) {
        window.location = "./chatRoom.html";
    });
    btnViewProfile.click(function(e) {
        window.location = "./viewProfile.html";
    });
    editProfile.click(function() {
        window.location = "./profile.html";
    });

    clearMessage.click(function() {
        dbCharRoom.remove().then(function() {
            window.location.reload();
        });
    })
});
