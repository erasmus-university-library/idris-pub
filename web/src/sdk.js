import fetch from 'isomorphic-fetch'
import CSL from 'citeproc';
import {Parser as HtmlToReactParser} from 'html-to-react';
const htmlToReactParser = new HtmlToReactParser();

import jwtDecode from 'jwt-decode';

let sdk_client = null;
let citeproc_client = null;

import locale_file from '../public/csl/locales/locales-en-US.xml';
import style_file from '../public/csl/styles/apa.csl';

function futch(url, opts={}, onProgress) {
  return new Promise( (res, rej)=>{
    var xhr = new XMLHttpRequest();
    xhr.mode = opts.mode;
    xhr.open(opts.method || 'get', url);
    for (var k in opts.headers||{})
      xhr.setRequestHeader(k, opts.headers[k]);
    xhr.onload = e => res(e.target.responseText);
    xhr.onerror = rej;
    if (xhr.upload && onProgress)
      xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
    xhr.send(opts.body);
  });
}


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
      let port = ''
      if (url.port){
	port = ':' + url.port;
	if (url.port === '8080'){
	  port = ':6543';
	}
      }
      this.config = CONFIG || {};
      this.url = url;
      this.hostName = url.hostname + port ;
      this.hostUrl = url.protocol + '//' + this.hostName;
      this.backendURL = this.hostUrl + '/api/v1';

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

  decodeToken = function(){
    return jwtDecode(this.token)
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

  recordDelete = function(type, id){
    return fetch(`${this.backendURL}/${type}/records/${id}`,
                 {method: 'DELETE',
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
                          body: value === null ? '' : JSON.stringify(value),
                          headers: {'Authorization': `Bearer ${this.token}`,
                                    'Content-Type': 'application/json'}});
        }
    }

  blobUpload = function(uploadURL, file, onProgress){
    return futch(uploadURL,
		 {method: 'PUT',
		  mode: 'cors',
		  body: new Blob([file], {type: file.type}),
		  //body: file,
                  headers: {'Authorization': `Bearer ${this.token}`,
			    'Content-Type': file.type}
		 },
		onProgress);
  }
  courseMaterialURL = function(courseId, materialId){
    return `${this.hostUrl}/course/${courseId}/material/${materialId}?token=${this.token}`;
  }

  clientConfig = function(){
    if (this.config.cache !== undefined &&
	this.config.cache.client !== undefined){
      const clientConfig = this.config.cache.client;
      return new Promise(
	function(resolve, reject){
	  resolve(new Response(JSON.stringify(clientConfig)));
	});
    }
    return fetch(this.backendURL + '/client',
                 {method: 'GET',
                  mode: 'cors'})

  }


  courseLoad = function(courseId, showRoyalties=true){
    return fetch(`${this.backendURL}/course/records/${courseId}?show_royalties=${showRoyalties}`,
                 {method: 'GET',
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});
  }

  courseUpdate = function(courseId, courseData){
    return fetch(`${this.backendURL}/course/records/${courseId}`,
                 {method: 'PUT',
                  body: JSON.stringify(courseData),
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});

  }

  courseAdd = function(courseData){
    return fetch(`${this.backendURL}/course/records`,
                 {method: 'POST',
                  body: JSON.stringify(courseData),
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});

  }

  courseAddMaterial = function(courseId, materialData, dryRun=false){
    return fetch(`${this.backendURL}/course/records/${courseId}/materials`,
                 {method: 'POST',
                  body: JSON.stringify({dry_run: dryRun, material: materialData}),
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});

  }

  courseDOILookup = function(doi){
    return fetch(`${this.backendURL}/course/lookup/doi?doi=${encodeURIComponent(doi)}`,
                 {method: 'GET',
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});
  }

  load = function(type, path){
    return fetch(`${this.backendURL}/${type}/${path}`,
                 {method: 'GET',
                  mode: 'cors',
                  headers: {'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'}});

  }
}

export default IdrisSDK
