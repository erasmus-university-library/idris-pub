import fetch from 'isomorphic-fetch'

let sdk_client = null;

class CaleidoSDK {
    constructor() {
        if (!sdk_client){
            this.token = null;
            this.backendURL = 'http://localhost:6543/api/v1';

            this.login = this.login.bind(this);
            this.recordList = this.recordList.bind(this);

            sdk_client = this;
        }
        return sdk_client
    }

    login = function(user, password) {
        return fetch(this.backendURL + '/auth/login',
                     {method: 'POST',
                      mode: 'cors',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({user:user, password:password})});
    }

    recordList = function(type, query='', offset=0, limit=10) {
        query = encodeURIComponent(query);
        return fetch(`${this.backendURL}/${type}/records?query=${query}&offset=${offset}&limit=${limit}`,
                     {method: 'GET',
                      mode: 'cors',
                      headers: {'Authorization': `Bearer ${this.token}`}});
    }

    clientConfig = function(){
        return fetch(this.backendURL + '/client',
                     {method: 'GET',
                      mode: 'cors'})

    }
}

export default CaleidoSDK