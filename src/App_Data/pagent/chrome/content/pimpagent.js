//{cac97cb3-f8d9-4b18-a2e4-03bebb60c1e2}

var confDebug = true; //toggles debug msgs to go to the error display
dump("test");
var cpage_type = null;
var opPage = false; //keeps track of current op page;

var pageArr = new Array();
pageArr['kingdom_details'] = 'kingdom';
pageArr['throne'] = 'throne';
pageArr['science'] = 'science';
pageArr['province_news'] = 'kdnews';
pageArr['council_military'] = 'militaryadv';
pageArr['council_internal'] = 'buildingadv';
pageArr['enchantment'] = 'magic';
pageArr['sorcery'] = 'magic';
pageArr['thievery'] = 'thief';
pageArr['send_armies'] = 'attack';
pageArr['aid'] = 'aid';

var serv;
var _doc = null;
var loadedPage;
var randNum;
var theHref;


function pimp_load(e) {
    tempdoc = e.originalTarget;
    if (!tempdoc.location)
        tempdoc = e.originalTarget.ownerDocument;
    var loc = tempdoc.location;

    var foundPage = false;
    var disabled = false;


    if (tempdoc.location && tempdoc.location.toString().match(/http/i) && tempdoc.location.toString().match(/utopia-game\.com\/(wol)\/game/) && !tempdoc.location.href.match(/\/links\//)) {
        var loc = tempdoc.location;
        serv = determineServer(tempdoc.location.toString());
        theHref = tempdoc.location.href;
        debug("server:" + serv);
        if (serv != false) //utopian server
        {
            foundUtopia = true;
            GM_setValue('curr_server', serv, true);
            _doc = tempdoc;
            //	window.addEventListener('error',handleErr,true);//onerror=handleErr;
            //window.onError = handleErr;
            //_doc.banana();

            if (GM_getValue('use_server_' + serv, false) && GM_getValue('enabled', true, true)) {

                //scores.cgi (kd page), menu.cgi (throne), science.cgi (sci page), council.cgi?elder=4 (buildings), council?elder=3 (military), news.cgi( kd news )
                //magic.cgi, thievery.cgi, attack.cgi
                var page = loc.href.match(/utopia-game\.com\/(wol)\/game\/([a-z_]+)/i);
                debug("page:" + page);
                debug("array:" + page[1]);
                debug("array2:" + page[2]);
                if (page != null && pageArr[page[2]]) //array with 3 parts, (2nd is page, 3rd is arguments)
                {
                    randNum = Math.random();
                    //                    if (page[1] == 'council') //council page, concat the strings for a unique page id
                    //                        page[1] = page[1] + page[2];


                    if (pageArr[page[2]] && _doc.body.innerHTML.indexOf("Sorry, but you've reached this page in the wrong way") == -1
						&& _doc.body.innerHTML.indexOf("You have been logged in for several hours") == -1
						&& _doc.body.innerHTML.indexOf("As a security measure within the game") == -1) {
                        debug("init: PA enabled, page found: " + pageArr[page[2]] + " key: " + page[2]);
                        foundPage = true;
                        //alert(pimp.getValue('app.extensions.version'));

                        if (GM_getValue('pimp_username', '') != '' && GM_getValue('pimp_password', '') != '' && GM_getValue('pimp_provincename', '') != '')
                            eval("page_" + pageArr[page[2]] + "(_doc);");
                        else {
                            newel = _doc.createElement('input');
                            newel.value = 'Enter username/password';
                            newel.type = 'button';
                            newel.style.textAlign = 'center';
                            newel.addEventListener('click', showPrefs, true);
                            box = buildAgentBox(_doc, 'button');
                            box.appendChild(newel);
                            GM_setValue('disabled', true);
                            addAgentMessage(_doc, 'Reload page after entering!');

                        }

                        numFailed = numQueue('errorheaddat');
                        //	debug("number of failed: "+numFailed);
                        if (upgradeCheck)
                        { addUpdateMsg(_doc); }
                        else if (numFailed > 0) {
                            addFailedMsg(_doc);
                        }

                        d = new Date();
                        nowtime = d.getTime();
                        /*
                        lastUpdateCheck = GM_getValue('updatecheck','',true);
						
						if( 
							( GM_getValue('updatever','',true) == '' || GM_getValue('updatever','',true) == CURRVER ) &&
                        (lastUpdateCheck == '' || compareTime(nowtime,lastUpdateCheck) > 30) || true )
                        {
							
							req = new XMLHttpRequest();
                        req.open("POST", 'http://agent.utopiapimp.com/update.rdf', true);
                        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
                        req.send('');
                        req.onreadystatechange = function (aEvt) {
                        if (req.readyState == 4) {
                        if(req.status == 200) //good return
                        {
                        verStr =req.responseText.match(/\<version\>(.*?)\<\/version\>/i);
                        if( verStr != null )
                        {
                        GM_setValue('updatever',verStr[1],true);
                        GM_setValue('updatecheck',nowtime+'',true);
                        }
                        }
                        }
                        }
                        }
						
						//now, if the values are different, need to stick in that message
                        if( compareVer(getExtVersion(),GM_getValue('updatever','',true)) )
                        {
                        addUpdateMsg(_doc);
                        }
                        */
                    }
                }
            }
            else {
                debug("init: PA disabled for this server");
                disabled = true;
            }

            toggleStatusBar(true);
            setStatusLabel();
            _doc.defaultView.addEventListener('unload', pimp_hidestatus, true);
            loadedPage = true;


        }


    }
    else if (tempdoc.location && tempdoc.location.toString().match(/http/i) && tempdoc.location.hostname.match(/utopia(shrimp|pimp)\.com/i) && tempdoc.location.href.match(/pimp\_agent/)) {
        el = tempdoc.getElementById('extversion');
        if (typeof el != 'undefined') {
            el.innerHTML = "Your currently installed version: " + getExtVersion() + "<br>(if these two numbers are different, please download the new version of Pimp Agent <a href='http://agent.utopiapimp.com/pimpagent.xpi'>here</a>!)";

        }

    }
    checkStatus(foundPage || disabled); //if not a utopia page, dont repeat

}


function determineServer(host) {
    if (host.match(/utopia-game\.com\/wol/i))
        return 'wol';
    else if (host.match(/utopia-game\.com\/bf/i))
        return 'bf';
    else if (host.match(/utopia-game\.com\/gen/i))
        return 'gen';
    return false;
}


function pimp_hidestatus(e) {
    toggleStatusBar(false);
}

function toggleStatusBar(toggle) {
    var sb = document.getElementById('upt-statuspanel');
    var sbi = getEl('upt-statuspanel-icon');
    if (sb) {
        sbi.hidden = (!toggle);
        sb.hidden = (!toggle);
    }
}

function checkStatus(foundPage) {

    var sloaded = false;

    var sb = document.getElementById('upt-statuspanel');
    d = new Date();
    nowtime = d.getTime();

    //every time this loads, check to see if page is still active. if not, let it run, but hide the status bar

    if (foundPage) {
        //	debug("last queue: "+GM_getValue(serv+"_lastqueue",'')+" "+nowtime);
        if ((GM_getValue(serv + "_lastqueue", '') == "" || compareTime(nowtime, GM_getValue(serv + "_lastqueue")) > QUEUE_SENDINTERVAL) && numQueue() > 0) {
            sendQueue();
            //addAgentMessage(_doc,'sent me some intel, woot');
        }


        setStatusLabel();
        //this should only retimeout if the page is still around
        var sb = document.getElementById('upt-statuspanel');
        if (sb && sb.hidden == false)
            window.setTimeout(function() { checkStatus(true); }, 10000);
    }
    else {

        //not in utopia, but if there's something in the queue, we need to dump it!
        servlist = ['bf', 'wol', 'gen'];


        for (i = 0; i < 3; i++) //need to check each server
        {

            server = servlist[i]; //so the other functions work properly within a server 'scope'

            /* Now, since it could be loading up ads or whatever, this might get reached even if they are browsing Utopia. Therefore
            we need to check the lastqueue option to see when it's last sent. 
            */
            if ((GM_getValue(serv + "_lastqueue", '') == "" || compareTime(nowtime, GM_getValue(serv + "_lastqueue")) > QUEUE_SENDINTERVAL) && numQueue() > 0) {
                //debug("status-loop: found server " + serv + " still has intel to send; outside of Utopia");
                sendQueue();
            }
        }
    }
}

function page_aid(doc) {
    //debug("pageload: aid");
    thebody = cleanData(doc.body.innerHTML);
    astr = thebody.match(/(We have sent.*?)It should arrive shortly\!/i);
    if (astr != null)
        addAgentLink(doc, 'aid');
}

function proc_aid(txt) {
    //debug("procload: aid");
    txt = cleanData(txt);
    astr = txt.match(/(We have sent.*?)It should arrive shortly\!/i);
    if (astr != null)
        return ['aid', 'Your Aid shipment', 'Aid', encode64(astr[1])];
}
//Finds a throne page.
function page_throne(doc) {
    //let's get the province name, and if it's not the same as the current user, try to switch over
    txt = doc.body.innerHTML;
    debug("here's the text: " + txt);
    txt = cleanData(vuuText(txt));
    debug("now here is the text: " + txt);
    prov = txt.match(/The Province of ([a-z\dA-Z\s]{0,35}|[a-z\d]|)\(\d+\:\d+\) as of/i);
    debug(prov);
    if (prov != null) {
        proc_selfintel(doc, 'throne', 'cb');
        /*
        foundUser = true;
        if( prov[1] != selfProvName() ) //different user??
        {
        debug("pageload: throne: self("+selfProvName()+") seems different from page ("+prov[1]+")");
        foundUser = false;
        userdata = GM_getValue('userbinds','',true);
        userdata = ( userdata == '' ) ? [] : userdata.split(',');
        for( i in userdata ) 
        {
        otherprov = PimpUtil.getValue('user'+i+'_'+GM_getValue('curr_server','',true)+"_selfprov",'');
        if( otherprov == prov[1] ) //found user!
        {
        debug("pageload: throne: found match, reloading user: "+prov);
        foundUser =true;
        setUser(i);
        setStatusLabel();
        break;
        }
        }
		
		}
		
		
		if( foundUser == false && doc.getElementById('upt.agentbox') ) //couldn't find other province
        {
			
			msg = "<span style=\"color: yellow; cursor: pointer; text-decoration: underline;\">Province mismatch?</span>";
        newel = getMsgBox('badprov',msg);
        newel.addEventListener('click',badProv,true);
		
		}*/
    }
}

function badProv() {
    GM_setValue('badprovmsg', 1, true);
    showPrefs(0);
}


function setDate(key) {
    d = new Date();
    nowtime = d.getTime() + '';
    GM_setValue(key, nowtime);
}

function proc_selfintel(doc, type, ftype) {
    debug("procload: selfintel, type: " + ftype);

    autosent = false;

    addAgentLink(doc, type);
    //need to check for autosend

    d = new Date();
    nowtime = d.getTime();
    if (GM_getValue('auto_send_selfintel', true)) //GM_getValue('auto_send_selfintel',true) )//oPimpUtil.getBoolPref('auto_send_selfintel') )
    {
        if (GM_getValue(serv + '_lastself' + ftype, '') == '' || compareTime(nowtime, GM_getValue(serv + '_lastself' + ftype, '')) > GM_getValue('auto_send_selfintel_span', 6) * 60) {
            //debug("procload: selfintel: time to autosend data: " + ftype);
            autosent = true;
            cpage_type = type;
            txt = doc.body.innerHTML;
            txt = vuuText(txt);
            queueAgent(txt);

            addAutosentButton(doc);
            setDate(serv + '_lastself' + ftype);
            setStatusLabel();
        }
        else {
            //debug("procload: selfintel: autosend enabled, but not enough time: " + ftype);
            diff = compareTime(nowtime, GM_getValue(serv + '_lastself' + ftype)); //in minutes
            addAgentMessage(doc, 'Intel auto-sent ' + formatTimeDiff(diff) + ' hours ago');
        }
    }

}

function formatTimeDiff(minutes) //I want hours.xx
{
    hours = Math.floor(minutes / 60);
    //alert(minutes+" "+hours+" "+((minutes - hours * 60)/60));
    minutes = new String((minutes - hours * 60) / 60);
    //alert(minutes);
    fraction = minutes.match(/\.\d{0,2}/);
    //alert(fraction);
    return new String(hours) + fraction;
}

function addAutosentButton(doc) {
    newel = doc.createElement('input');
    newel.value = 'Auto-pimped';
    newel.type = 'button';
    newel.style.textAlign = 'center';
    newel.disabled = true;
    box = buildAgentBox(doc, 'button');
    box.appendChild(newel);
    prebutton = doc.getElementById('upt.agentbox.sendbutton');
    if (prebutton)
        prebutton.style.display = 'none';
}
//Adds an update message so the user will update.
function addUpdateMsg(doc) {
    if (!doc.getElementById('upt.agentbox'))
        return;
    msg = "<a style=\"color: yellow; \" target='_blank' href='https://addons.mozilla.org/en-US/firefox/addon/12179' >Update Pimp Agent!</a>";
    getMsgBox('updatemsg', msg);
}

function openExt(e) {
    window.open("chrome://mozapps/content/extensions/extensions.xul?type=extensions", "ext-panel", "chrome, centerscreen");

}

function addAgentMessage(doc, msg) {
    if (!doc.getElementById('upt.agentbox'))
        return;
    newel = doc.getElementById('upt.agentbox.msg');
    if (!newel) {
        newel = doc.createElement('span');
        newel.id = 'upt.agentbox.msg';
        newel.innerHTML = msg;
        box = buildAgentBox(doc, 'msg');
        box.appendChild(newel);
    }
    else {
        newel.innerHTML = msg;
    }
}


function addAgentLink(doc, type) {
    cpage_type = type;
    newel = makeAgentButton(doc);

    typeel = doc.createElement('input');
    typeel.id = 'page_type';
    typeel.type = 'hidden';
    typeel.value = type;

    newel.addEventListener('click', queueAgentEvent, true);
    box = buildAgentBox(doc, 'button');
    box.appendChild(newel);
    box.appendChild(typeel);
}

function makeAgentButton(doc, msg) {
    el = doc.getElementById('upt.agentbox.sendbutton');
    if (el) {
        //debug("already found agent button!");
        el.value = msg;
        return el;
    }

    newel = doc.createElement('input');
    newel.id = 'upt.agentbox.sendbutton';
    if (typeof msg != 'undefined')
        newel.value = msg;
    else
        newel.value = 'Pimp into Queue';
    newel.type = 'button';
    return newel;
}

function queueAgentEvent(e) {
    if (e != false)
        source = e.originalTarget;
    else
        source = _doc.getElementById('upt.agentbox.sendbutton');
    if (typeof source == 'undefined')
        return;


    var body = getParent(source, 'body');
    copyText = body.innerHTML;
    //debug("here is the text: "+copyText);
    copyText = vuuText(copyText, source.ownerDocument);
    //debug("here is the text again: "+copyText);
    typeel = source.ownerDocument.getElementById('page_type');
    if (typeof typeel != 'undefined') {
        debug("found type in the hidden element");
        queueAgent(copyText, typeel.value);
    }
    else
        queueAgent(copyText);
    source.value = 'Pimped into Queue!';
    source.disabled = true;
    clearAgentMsg(source.ownerDocument);
}

function clearAgentMsg(doc) {
    if (!doc.getElementById('upt.agentbox'))
        return;
    newel = doc.getElementById('upt.agentbox.msg');
    if (newel)
        newel.style.display = 'none';
}

function queueAgent(text, cpage_force, angel_pass) {
    d = new Date();
    ctime = Math.floor(d.getTime() / 1000);
    //ctime = getTime();

    if (typeof cpage_force != 'undefined')
        usetype = cpage_force;
    else
        usetype = cpage_type;


    //debug("here is pre-angel: "+cleanData(text));
    if (GM_getValue("use_angel", false, true) && typeof angel_pass == 'undefined') {
        queryAngel(cleanData(text), usetype);
        return; //it will get called again by queryAngel
    }
    //debug("here is post-angel: "+text);


    //semaphore
    //in the middle of a send, delay the addition
    if (GM_getValue("busy", '') != '' && compareTime(d.getTime(), GM_getValue("busy")) < .1) {
        window.setTimeout(function(a, b) { queueAgent(a, b); }, 1000, text, usetype);
        return;
    }
    //debug("queueAgent: usetype/" + usetype + " cpage_force/" + cpage_force + " text/" + text);
    eval("metadata = proc_" + usetype + "(text);");
    if (metadata != false) //found the info
    {
        //	alert('this is the metadata: '+metadata);

        headArr = arrayPref(serv + '_headdat');
        dataArr = arrayPref(serv + '_datadat');

        //debug("queue: Adding type (" + usetype + ") to queue");

        opNum = 1;

        for (i = 0; i < headArr.length; i++) {
            //time|type|target|number
            temp = headArr[i].split("|"); // 
            if (metadata[1] + metadata[2] == temp[1] + temp[2]) //dupe intel
            {
                if (metadata[0] == 'top' || metadata[0] == 'mop' || metadata[0] == 'aop' || metadata[0] == 'aid') {
                    //debug("queue: this type of op already present, adding to previous entry and incrementing count");
                    tempbody = dataArr[i].split("|");
                    metadata[3] = encode64(decode64(tempbody[1]) + "\n" + decode64(metadata[3]));
                    opNum = parseInt(temp[3]) + 1;
                }

                headArr.splice(i, 1);
                dataArr.splice(i, 1);
                break;
            }
        }

        if (metadata[0] == 'top' || metadata[0] == 'mop' || metadata[0] == 'aop' || metadata[0] == 'aid')
            headArr.push(ctime + "|" + metadata[1] + "|" + metadata[2] + "|" + opNum);
        else
            headArr.push(ctime + "|" + metadata[1] + "|" + metadata[2]);

        dataArr.push(metadata[0] + "|" + metadata[3]);

        //debug("queue: after adding, here is headarr: " + headArr);

        GM_setValue(serv + "_headdat", headArr.join("\n"));
        GM_setValue(serv + "_datadat", dataArr.join("\n"));

        //diff = compareTime(nowtime,GM_getValue(serv+'_lastself'+ftype)); //in minutes
        if (metadata[4]) //self intel
            setDate(serv + '_lastself' + metadata[4]);


        if (prefsWindow) {
            initQueueList();
            initLogList();
        }

        setStatusLabel();

    }
    else //error!
    {
        //debug('queue: false metadata on queueAgent');
    }

}



function buildAgentBox(doc, rtype) {
    box = doc.getElementById('upt.agentbox');
    if (box != null) {
        if (rtype == 'button')
            return doc.getElementById('upt.agentbox.buttons');
        else if (rtype == 'msg')
            return doc.getElementById('upt.agentbox.msgs');
        else
            return box;
    }
    else {
        box = doc.createElement('div');
        box.style.position = 'fixed';
        box.style.bottom = '0px';
        box.style.right = '0px';
        box.style.border = '1px dashed #fff';
        box.style.borderWidth = '1px 0 0 1px';
        box.style.padding = '2px';
        box.style.backgroundColor = '#333';
        box.id = 'upt.agentbox';
        box.style.textAlign = 'center';

        ititle = doc.createElement('div');
        ititle.innerHTML = 'Pimp Agent';
        ititle.style.textAlign = 'center';
        ititle.marginBottom = '5px';

        icon = doc.createElement('img');
        icon.src = "chrome://pimpagent/content/color-large.png";
        box.appendChild(icon);

        //box.appendChild(ititle);
        butbox = doc.createElement('div');
        butbox.id = 'upt.agentbox.buttons';
        butbox.style.textAlign = 'center';
        box.appendChild(butbox);
        msgbox = doc.createElement('div');
        msgbox.id = 'upt.agentbox.msgs';
        msgbox.style.textAlign = 'center';
        box.appendChild(msgbox);

        msgbox = doc.createElement('div');
        msgbox.id = 'upt.agentbox.updatemsg';
        msgbox.style.textAlign = 'center';
        box.appendChild(msgbox);

        msgbox = doc.createElement('div');
        msgbox.id = 'upt.agentbox.failedmsg';
        msgbox.style.textAlign = 'center';
        box.appendChild(msgbox);

        msgbox = doc.createElement('div');
        msgbox.id = 'upt.agentbox.badprov';
        msgbox.style.textAlign = 'center';
        box.appendChild(msgbox);

//        ad = doc.createElement('div');
//        ad.innerHTML = "<map name='admap38154' id='admap38154'><area href='http://www.projectwonderful.com/out_nojs.php?r=0&amp;c=0&amp;id=38154&amp;type=2' shape='rect' coords='0,0,117,30' title='' alt='' target='_blank' /></map><table cellpadding='0' border='0' cellspacing='0' width='117' bgcolor='#333'><tr><td><img src='http://www.projectwonderful.com/nojs.php?id=38154&amp;type=2' width='117' height='30' usemap='#admap38154' border='0' alt='' /></td></tr></table>";
//        ad.style.textAlign = 'center';
//        ad.style.padding = '0px 0px';
//        box.appendChild(ad);

        //box.setAttribute('-moz-border-radius','3px');
        doc.body.appendChild(box);
        if (rtype == 'button')
            return butbox;
        else if (rtype == 'msg')
            return msgbox;
        else
            return box;
    }
}

// proc_ functions are called whenever the pimp it button is pushed, or when data is auto-queued due to user preferences
// page_functions are called when that page is detected - usually either places appropriate buttons on the page or auto-queues

//Proc stuff
function proc_throne(txt, angel_pass) // The Province of The Kittys Paw (10:9) as of
{
    //debug("procload: throne");
    //debug("here is the throne: " + encode64(cleanData(txt)));

    return ['self_cb_raw', 'CB', selfProvName(), encode64(cleanData(txt)), 'cb'];
}

function page_science(doc) {
    //debug("pageload: self-science");
    txt = doc.body.innerHTML;
    //	debug("here's the text: "+txt);
    txt = cleanData(vuuText(txt));
    goodpage = txt.match(/Sciences are the heart and soul of our people and our lands/i);

    if (goodpage != null) {
        proc_selfintel(doc, 'science', 'sos');
    }
    else {
        //debug("fail science page");
    }
}

function proc_science(txt) {
    //debug("procload: self-science");
    return ['self_sos_raw', 'SoS', selfProvName(), encode64(cleanData(txt)), 'sos'];
}

function page_militaryadv(doc) {
    //debug("pageload: self-military");
    txt = doc.body.innerHTML;
    //	debug("here's the text: "+txt);
    txt = cleanData(vuuText(txt));
    goodpage = txt.match(/Our military effectiveness is determines/i);

    if (goodpage != null) {
        proc_selfintel(doc, 'militaryadv', 'som');
    }

}

function proc_militaryadv(txt) {
    //debug("procload: self-military");
    return ['self_som_raw', 'SoM', selfProvName(), encode64(cleanData(txt)), 'som'];
}

function page_buildingadv(doc) {
    //debug("pageload: self-building");
    txt = doc.body.innerHTML;
    //	debug("here's the text: "+txt);
    txt = cleanData(vuuText(txt));
    goodpage = txt.match(/You will find that as we build more of certain building types/i);

    if (goodpage != null) {
        proc_selfintel(doc, 'buildingadv', 'survey');
    }
}

function proc_buildingadv(txt) {
    //debug("procload: self-building");
    return ['self_survey_raw_adv', 'Survey', selfProvName(), encode64(cleanData(txt)), 'survey'];
}

function proc_cb(txt) {
    //debug("procload: cb");
    idata = txt.split('|');
    return ['cb_raw', 'CB', idata[0], cleanData(idata[3])];
}

function proc_sos(txt) {
    //debug("procload: sos");
    idata = txt.split('|');
    return ['sos_raw', 'SoS', idata[0], cleanData(idata[3])];
}

function proc_som(txt) {
    //debug("procload: som");
    idata = txt.split('|');
    return ['som_raw', 'SoM', idata[0], cleanData(idata[3])];
}

function proc_survey(txt) {
    //debug("procload: survey");
    idata = txt.split('|');
    return ['survey_raw_adv', 'Survey', idata[0], cleanData(idata[3])];
}

function proc_ce(txt) {
    //debug("procload: ce");
    idata = txt.split('|'); //needs to be fixed to give dates within target name
    return ['ce_raw', 'CE', idata[0], cleanData(idata[3])];
}

function page_kingdom(doc) {
    //debug("pageload: kingdom");
    //Due to the current formatting problems I have disabled this..  molesquirrel fixed ;) - re-enabled	
    addAgentLink(doc, 'kingdom');
}

function proc_kingdom(txt) {
    //debug("procload: kingdom");

    //txt = vuuText(txt);
    //txt = ( vuu == '' ) ? txt : vuu;
    //now, let's mark up ones that have protection

    //<font color="#99ffbb"> >> [PROT]
    //<font color="#ffaaaa"> >> NOCHANGE

    //<font color="#77ffff"> >> NOCHANGE

    txt = txt.replace(/\<font color=\"\#99ffbb\"\>/gi, '[PROT]');
    txt = txt.replace(/\<font color=\"\#ffaaaa\"\>/gi, '[NOC]');
    txt = txt.replace(/\<font color=\"\#77ffff\"\>/gi, '[NOC]');

    txt = cleanData(txt);

    temp = txt.match(/provinces in the kingdom of ([a-z\d ]+ \(\#?\d{1,2}:\d{1,2}\))\./i);
    if (!temp)
        temp = txt.match(/Current kingdom is ([A-Za-z\d ]+\(\#?\d{1,2}:\d{1,2}\))/i);
    if (!temp) //possible metatron
    {
        temp = txt.match(/Tag Kingdom +([a-z\d ]+ \(\#?\d{1,2}:\d{1,2}\))/i);
    }
    //debug("procload: kingdom: kingdom name > " + temp[1]);
    return (temp == false) ? false : ['kdpage', 'KD Page', temp[1], encode64(txt)];
}


function vuuText(txt, doc) {
    if (typeof doc != 'undefined') {
        //debug("using doc");
        v = doc.getElementById('vuu_original_html');
    }
    else {
        //debug("using _doc");
        v = _doc.getElementById('vuu_original_html');
    }
    return (v && v.value != '') ? v.value : txt;
}


function page_kdnews(doc) {
    //debug("pageload: self-kdnews");
    addAgentLink(doc, 'kdnews');
}

function proc_kdnews(txt) {
    //debug("procload: self-kdnews");
    txt = cleanData(txt);

    return ['selfce', 'KD News ' + getCEDates(txt), 'Self Kingdom', encode64(txt)];
}

function selfProvName() {
    return GM_getValue(GM_getValue('curr_server', '', true) + "_selfprov", '');
}

// Utility Functions on intel/ops - text replacement/mutation/search

function getCEDates(txt) {
    re = /([a-z]+\, YR\d+) Edition/im;
    dates = re.exec(txt);
    return dates[1];
}

/* strips out useless html and attempts to make the page look as if the user were to do a copy-paste into clipboard
so some of the html is converted into spaces, linebreaks, and so forth
*/
function cleanData(data) {
    data = data.replace(/[\s]*\<BR\>[\s]*/ig, "\n");
    data = data.replace(/\<\/T[DH]>[\n\r\s]*\<T[DH]\>/ig, ' ');
    data = data.replace(/(\<\/TD\>|\&nbsp\;|<\/TH\>)/ig, ' ');
    data = data.replace('♦', '');
    //return data;
    return data.replace(/<\S[^>]*>/g, '');
}


//gBrowser.addEventListener('load', examplePageLoad, true);


function examplePageLoad(event) {
    if (event.originalTarget instanceof HTMLDocument) {
        var doc = event.originalTarget;
        //alert(event.originalTarget.href);
        if (event.originalTarget.defaultView.frameElement) {
            // Frame within a tab was loaded. doc should be the root document of
            // the frameset. If you don't want do anything when frames/iframes
            // are loaded in this web page, uncomment the following line:
            // return;
            // Find the root document:
            while (doc.defaultView.frameElement) {
                doc = doc.defaultView.frameElement.ownerDocument;
            }
        }
    }
}

// do not try to add a callback until the browser window has
// been initialised. We add a callback to the tabbed browser
// when the browser's window gets loaded.
window.addEventListener(
  "load",
  function() {
      // Add a callback to be run every time a document loads.
      // note that this includes frames/iframes within the document
      gBrowser.addEventListener("load", pimp_load, true);
  },
  false
);