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

    recordList = function(type, query='', filters={}, offset=0, limit=10) {
        query = encodeURIComponent(query);
        let url = `${this.backendURL}/${type}/records?format=snippet&query=${query}`;
        url = url + `&offset=${offset}&limit=${limit}`;
        for (const [key, values] of Object.entries(filters)){
            url = url + `&filter_${key}=${encodeURIComponent(values.join(','))}`;
        }
        return fetch(url,
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