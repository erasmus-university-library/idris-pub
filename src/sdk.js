import fetch from 'isomorphic-fetch'

let sdk_client = null;

class CaleidoSDK {
    constructor() {
        if (!sdk_client){
            this.token = null;
            this.backendURL = 'http://localhost:6543/api/v1';

            this.login = this.login.bind(this);
            this.typeList = this.typeList.bind(this);

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

    typeList = function() {
        return [{'type': 'person', 'label': 'Persons'},
                {'type': 'group', 'label': 'Groups'},
                {'type': 'user', 'label': 'Users'}];
    }
}

export default CaleidoSDK