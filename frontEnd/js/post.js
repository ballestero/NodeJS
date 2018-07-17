class Post {
    constructor(fbkey, title, body, owner, timestamp){
        this.fbkey = fbkey;
        this.title = title;
        this.body = body;
        this.owner = owner;

        if (timestamp === null) {
            this.timestamp = new Date();
        } else {
            this.timestamp = new Date(timestamp);
        }
    }
}