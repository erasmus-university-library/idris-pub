import fetch from 'isomorphic-fetch'
import CSL from 'citeproc';
import {Parser as HtmlToReactParser} from 'html-to-react';
const htmlToReactParser = new HtmlToReactParser();

import jwtDecode from 'jwt-decode';

let sdk_client = null;
let citeproc_client = null;

import locale_file from '../public/csl/locales/locales-en-US.xml';
import style_file from '../public/csl/styles/apa.csl';

const citeproc_locale = `
<?xml version="1.0" encoding="utf-8"?>
<locale xmlns="http://purl.org/net/xbiblio/csl" version="1.0" xml:lang="en-US">
  <info>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
    <updated>2015-10-10T23:31:02+00:00</updated>
  </info>
  <style-options punctuation-in-quote="true"/>
  <date form="text">
    <date-part name="month" suffix=" "/>
    <date-part name="day" suffix=", "/>
    <date-part name="year"/>
  </date>
  <date form="numeric">
    <date-part name="month" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="day" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="year"/>
  </date>
  <terms>
    <term name="accessed">accessed</term>
    <term name="and">and</term>
    <term name="and others">and others</term>
    <term name="anonymous">anonymous</term>
    <term name="anonymous" form="short">anon.</term>
    <term name="at">at</term>
    <term name="available at">available at</term>
    <term name="by">by</term>
    <term name="circa">circa</term>
    <term name="circa" form="short">c.</term>
    <term name="cited">cited</term>
    <term name="edition">
      <single>edition</single>
      <multiple>editions</multiple>
    </term>
    <term name="edition" form="short">ed.</term>
    <term name="et-al">et al.</term>
    <term name="forthcoming">forthcoming</term>
    <term name="from">from</term>
    <term name="ibid">ibid.</term>
    <term name="in">in</term>
    <term name="in press">in press</term>
    <term name="internet">internet</term>
    <term name="interview">interview</term>
    <term name="letter">letter</term>
    <term name="no date">no date</term>
    <term name="no date" form="short">n.d.</term>
    <term name="online">online</term>
    <term name="presented at">presented at the</term>
    <term name="reference">
      <single>reference</single>
      <multiple>references</multiple>
    </term>
    <term name="reference" form="short">
      <single>ref.</single>
      <multiple>refs.</multiple>
    </term>
    <term name="retrieved">retrieved</term>
    <term name="scale">scale</term>
    <term name="version">version</term>

    <!-- ANNO DOMINI; BEFORE CHRIST -->
    <term name="ad">AD</term>
    <term name="bc">BC</term>

    <!-- PUNCTUATION -->
    <term name="open-quote">“</term>
    <term name="close-quote">”</term>
    <term name="open-inner-quote">‘</term>
    <term name="close-inner-quote">’</term>
    <term name="page-range-delimiter">–</term>

    <!-- ORDINALS -->
    <term name="ordinal">th</term>
    <term name="ordinal-01">st</term>
    <term name="ordinal-02">nd</term>
    <term name="ordinal-03">rd</term>
    <term name="ordinal-11">th</term>
    <term name="ordinal-12">th</term>
    <term name="ordinal-13">th</term>

    <!-- LONG ORDINALS -->
    <term name="long-ordinal-01">first</term>
    <term name="long-ordinal-02">second</term>
    <term name="long-ordinal-03">third</term>
    <term name="long-ordinal-04">fourth</term>
    <term name="long-ordinal-05">fifth</term>
    <term name="long-ordinal-06">sixth</term>
    <term name="long-ordinal-07">seventh</term>
    <term name="long-ordinal-08">eighth</term>
    <term name="long-ordinal-09">ninth</term>
    <term name="long-ordinal-10">tenth</term>

    <!-- LONG LOCATOR FORMS -->
    <term name="book">
      <single>book</single>
      <multiple>books</multiple>
    </term>
    <term name="chapter">
      <single>chapter</single>
      <multiple>chapters</multiple>
    </term>
    <term name="column">
      <single>column</single>
      <multiple>columns</multiple>
    </term>
    <term name="figure">
      <single>figure</single>
      <multiple>figures</multiple>
    </term>
    <term name="folio">
      <single>folio</single>
      <multiple>folios</multiple>
    </term>
    <term name="issue">
      <single>number</single>
      <multiple>numbers</multiple>
    </term>
    <term name="line">
      <single>line</single>
      <multiple>lines</multiple>
    </term>
    <term name="note">
      <single>note</single>
      <multiple>notes</multiple>
    </term>
    <term name="opus">
      <single>opus</single>
      <multiple>opera</multiple>
    </term>
    <term name="page">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="number-of-pages">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="paragraph">
      <single>paragraph</single>
      <multiple>paragraphs</multiple>
    </term>
    <term name="part">
      <single>part</single>
      <multiple>parts</multiple>
    </term>
    <term name="section">
      <single>section</single>
      <multiple>sections</multiple>
    </term>
    <term name="sub verbo">
      <single>sub verbo</single>
      <multiple>sub verbis</multiple>
    </term>
    <term name="verse">
      <single>verse</single>
      <multiple>verses</multiple>
    </term>
    <term name="volume">
      <single>volume</single>
      <multiple>volumes</multiple>
    </term>

    <!-- SHORT LOCATOR FORMS -->
    <term name="book" form="short">
      <single>bk.</single>
      <multiple>bks.</multiple>
    </term>
    <term name="chapter" form="short">
      <single>chap.</single>
      <multiple>chaps.</multiple>
    </term>
    <term name="column" form="short">
      <single>col.</single>
      <multiple>cols.</multiple>
    </term>
    <term name="figure" form="short">
      <single>fig.</single>
      <multiple>figs.</multiple>
    </term>
    <term name="folio" form="short">
      <single>fol.</single>
      <multiple>fols.</multiple>
    </term>
    <term name="issue" form="short">
      <single>no.</single>
      <multiple>nos.</multiple>
    </term>
    <term name="line" form="short">
      <single>l.</single>
      <multiple>ll.</multiple>
    </term>
    <term name="note" form="short">
      <single>n.</single>
      <multiple>nn.</multiple>
    </term>
    <term name="opus" form="short">
      <single>op.</single>
      <multiple>opp.</multiple>
    </term>
    <term name="page" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="number-of-pages" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="paragraph" form="short">
      <single>para.</single>
      <multiple>paras.</multiple>
    </term>
    <term name="part" form="short">
      <single>pt.</single>
      <multiple>pts.</multiple>
    </term>
    <term name="section" form="short">
      <single>sec.</single>
      <multiple>secs.</multiple>
    </term>
    <term name="sub verbo" form="short">
      <single>s.v.</single>
      <multiple>s.vv.</multiple>
    </term>
    <term name="verse" form="short">
      <single>v.</single>
      <multiple>vv.</multiple>
    </term>
    <term name="volume" form="short">
      <single>vol.</single>
      <multiple>vols.</multiple>
    </term>

    <!-- SYMBOL LOCATOR FORMS -->
    <term name="paragraph" form="symbol">
      <single>¶</single>
      <multiple>¶¶</multiple>
    </term>
    <term name="section" form="symbol">
      <single>§</single>
      <multiple>§§</multiple>
    </term>

    <!-- LONG ROLE FORMS -->
    <term name="director">
      <single>director</single>
      <multiple>directors</multiple>
    </term>
    <term name="editor">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="editorial-director">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="illustrator">
      <single>illustrator</single>
      <multiple>illustrators</multiple>
    </term>
    <term name="translator">
      <single>translator</single>
      <multiple>translators</multiple>
    </term>
    <term name="editortranslator">
      <single>editor &amp; translator</single>
      <multiple>editors &amp; translators</multiple>
    </term>

    <!-- SHORT ROLE FORMS -->
    <term name="director" form="short">
      <single>dir.</single>
      <multiple>dirs.</multiple>
    </term>
    <term name="editor" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="editorial-director" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="illustrator" form="short">
      <single>ill.</single>
      <multiple>ills.</multiple>
    </term>
    <term name="translator" form="short">
      <single>tran.</single>
      <multiple>trans.</multiple>
    </term>
    <term name="editortranslator" form="short">
      <single>ed. &amp; tran.</single>
      <multiple>eds. &amp; trans.</multiple>
    </term>

    <!-- VERB ROLE FORMS -->
    <term name="container-author" form="verb">by</term>
    <term name="director" form="verb">directed by</term>
    <term name="editor" form="verb">edited by</term>
    <term name="editorial-director" form="verb">edited by</term>
    <term name="illustrator" form="verb">illustrated by</term>
    <term name="interviewer" form="verb">interview by</term>
    <term name="recipient" form="verb">to</term>
    <term name="reviewed-author" form="verb">by</term>
    <term name="translator" form="verb">translated by</term>
    <term name="editortranslator" form="verb">edited &amp; translated by</term>

    <!-- SHORT VERB ROLE FORMS -->
    <term name="director" form="verb-short">dir. by</term>
    <term name="editor" form="verb-short">ed. by</term>
    <term name="editorial-director" form="verb-short">ed. by</term>
    <term name="illustrator" form="verb-short">illus. by</term>
    <term name="translator" form="verb-short">trans. by</term>
    <term name="editortranslator" form="verb-short">ed. &amp; trans. by</term>

    <!-- LONG MONTH FORMS -->
    <term name="month-01">January</term>
    <term name="month-02">February</term>
    <term name="month-03">March</term>
    <term name="month-04">April</term>
    <term name="month-05">May</term>
    <term name="month-06">June</term>
    <term name="month-07">July</term>
    <term name="month-08">August</term>
    <term name="month-09">September</term>
    <term name="month-10">October</term>
    <term name="month-11">November</term>
    <term name="month-12">December</term>

    <!-- SHORT MONTH FORMS -->
    <term name="month-01" form="short">Jan.</term>
    <term name="month-02" form="short">Feb.</term>
    <term name="month-03" form="short">Mar.</term>
    <term name="month-04" form="short">Apr.</term>
    <term name="month-05" form="short">May</term>
    <term name="month-06" form="short">Jun.</term>
    <term name="month-07" form="short">Jul.</term>
    <term name="month-08" form="short">Aug.</term>
    <term name="month-09" form="short">Sep.</term>
    <term name="month-10" form="short">Oct.</term>
    <term name="month-11" form="short">Nov.</term>
    <term name="month-12" form="short">Dec.</term>

    <!-- SEASONS -->
    <term name="season-01">Spring</term>
    <term name="season-02">Summer</term>
    <term name="season-03">Autumn</term>
    <term name="season-04">Winter</term>
  </terms>
</locale>
`;



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
		return citeproc_locale;
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

  courseUpdateMaterial = function(courseId, materialId, materialData){
    return fetch(`${this.backendURL}/course/records/${courseId}/material/${materialId}`,
                 {method: 'PATCH',
                  body: JSON.stringify({material:materialData}),
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
