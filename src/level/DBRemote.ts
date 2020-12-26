import firebase from "firebase/app";
import "firebase/database"
import EventType = firebase.database.EventType;

export class DBRemote {

    private databaseRef: firebase.database.Reference;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyCEX0hCOSuCrIdtb3b7KCgh9WCVFrQ3z14",
            authDomain: "spectre-2149.firebaseapp.com",
            databaseURL: "https://spectre-2149-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "spectre-2149",
            storageBucket: "spectre-2149.appspot.com",
            messagingSenderId: "533897229462",
            appId: "1:533897229462:web:73612cc05adae1c1b9beb7"
        };
        firebase.initializeApp(firebaseConfig);
        this.databaseRef = firebase.database().ref();
    }

    async read(name: string, eventType: EventType): Promise<any> {
        return new Promise(resolve => this.databaseRef.child(name).on(eventType, function (snapshot) {
            const val = snapshot.val();
            console.debug('DB read', name, val);
            resolve(val);
        }));
    }

    async update(name: string, value: any): Promise<void> {
        return new Promise(resolve => this.databaseRef.child(name).update(value, function (result) {
            console.debug('DB update', name, value, result);
            resolve();
        }));
    }

    async push(name: string, value: any): Promise<void> {
        return new Promise(resolve => this.databaseRef.child(name).push(value, function (result) {
            console.debug('DB push', name, value, result);
            resolve();
        }));
    }
}



