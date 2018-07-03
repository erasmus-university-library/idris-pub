import fetch from 'isomorphic-fetch'
import CSL from 'citeproc';
import {Parser as HtmlToReactParser} from 'html-to-react';
const htmlToReactParser = new HtmlToReactParser();

let sdk_client = null;
let citeproc_client = null;

import locale_file from '../public/csl/locales/locales-en-US.xml';
import style_file from '../public/csl/styles/apa.csl';


export class CiteProc {
    constructor() {
        if (!citeproc_client){
            this.engine = null;
            const citations = {};
            const sys = {
                locale: null,
                style: null,
                retrieveLocale: function(lang){
                    if (this.locale === null){
                        throw Error('Citeproc Locale not loaded.');
                    }
                    return this.locale;
                },
                retrieveItem: function(id){
                    return citations[id];
                }

            }
            this.citations = citations;
            fetch(style_file).then(
                function(response) {
                    return response.text();
                }).then(function(body){
                    sys.style = body;
                });

            fetch(locale_file).then(
                function(response) {
                    return response.text();
                }).then(function(body){
                    sys.locale = body;
                });

            this.sys = sys;
            citeproc_client = this;
        }
        return citeproc_client
    }



    getProcessor = function() {
        if (this.sys.style === null){
            throw Error('Citeproc Style not loaded.');
        }
        if (this.engine === null){
            this.engine = new CSL.Engine(this.sys, this.sys.style)
        }
        return this.engine;

    }

    renderCitation = function(citation){
      this.citations[citation.id] = citation
      const processor = this.getProcessor();
      processor.updateItems([citation.id])
      let result = processor.makeBibliography();
      result[1][0] = result[1][0].replace('<div class="csl-entry">', '').replace('</div>', '');
      return result[1].map(biblioStr => htmlToReactParser.parse(biblioStr))
    }


}


export class IdrisSDK {
    constructor() {
        if (!sdk_client){
            this.token = null;
            const url = new URL(document.location);
            this.backendURL = url.protocol + '//' + url.hostname + ':6543/api/v1';

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

    recordList = function(type, query='', filters=null, offset=0, limit=10) {
        if (type === 'subgroup'){
            type = 'group';
        }
        if (type === 'workContributor' || type === 'workAffiliation'){
            type = 'work';
        }
        query = encodeURIComponent(query);
        let url = `${this.backendURL}/${type}/records?format=snippet&query=${query}`;
        if (type === 'work' || type === 'membership'){
            url = `${this.backendURL}/${type}/listing?query=${query}`;
        }
        url = url + `&offset=${offset}&limit=${limit}`;
        for (const [key, value] of Object.entries(filters || {})){
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

    recordSearch = function(type, query='', filters=null, offset=0, limit=10) {
        query = encodeURIComponent(query);
        let url = `${this.backendURL}/${type}/search?query=${query}`;
        url = url + `&offset=${offset}&limit=${limit}`;
        for (const [key, value] of Object.entries(filters || {})){
            url = url + `&${key}=${encodeURIComponent(value)}`;
        }
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

export default IdrisSDK
