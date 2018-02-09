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
        if (type === 'subgroup'){
            type = 'group';
        }
        query = encodeURIComponent(query);
        let url = `${this.backendURL}/${type}/records?format=snippet&query=${query}`;
        url = url + `&offset=${offset}&limit=${limit}`;
        for (const [key, value] of Object.entries(filters)){
            url = url + `&${key}=${encodeURIComponent(value)}`;
        }
        if( type === 'membership') {
            url = url + '&transitive=true';
        }
        return fetch(url,
                     {method: 'GET',
                      mode: 'cors',
                      headers: {'Authorization': `Bearer ${this.token}`}});
    }

    recordSearch = function(type, query='', offset=0, limit=10) {
        query = encodeURIComponent(query);
        let url = `${this.backendURL}/${type}/search?query=${query}`;
        url = url + `&offset=${offset}&limit=${limit}`;
        return fetch(url,
                     {method: 'GET',
                      mode: 'cors',
                      headers: {'Authorization': `Bearer ${this.token}`}});
    }

    record = function(type, id){
        return fetch(`${this.backendURL}/${type}/records/${id}`,
                     {method: 'GET',
                      mode: 'cors',
                      headers: {'Authorization': `Bearer ${this.token}`}});
    }

    recordSubmit = function(type, id, value){
        if (id === null) {
            return fetch(`${this.backendURL}/${type}/records`,
                         {method: 'POST',
                          mode: 'cors',
                          body: JSON.stringify(value),
                          headers: {'Authorization': `Bearer ${this.token}`,
                                    'Content-Type': 'application/json'}});

        } else {
            return fetch(`${this.backendURL}/${type}/records/${id}`,
                         {method: 'PUT',
                          mode: 'cors',
                          body: JSON.stringify(value),
                          headers: {'Authorization': `Bearer ${this.token}`,
                                    'Content-Type': 'application/json'}});
        }
    }


    clientConfig = function(){
        return fetch(this.backendURL + '/client',
                     {method: 'GET',
                      mode: 'cors'})

    }
}

export default CaleidoSDK