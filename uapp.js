/// <reference path="mm.ts" />
var final_transcript = '';
var start_img;
var start_button;
var final_span;
var interim_span;
var testtext;
var recognition = new webkitSpeechRecognition();
recognition.lang = 'hr_HR';
recognition.onstart = function () {
    //console.log('onstart');
    start_img.setAttribute('src', 'mic-animate.gif');
};
recognition.onspeechend = function (e) {
    //console.log('onspeechend');
    recognition.stop();
};
recognition.addEventListener("error", function (e) {
    var errorEvent = e;
    //console.log('error:' + errorEvent.error);
    //console.log('message:' + errorEvent.message);
});
recognition.onend = function () {
    //console.log('onend');
    start_img.src = 'mic.gif';
    recognition.stop();
};
recognition.onresult = function (event) {
    console.log("onresult: " + event.results[0][0].transcript);
    console.log("confidence: " + event.results[0][0].confidence);
    var interim_transcript = '';
    var testtext = document.getElementById("testtext");
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            console.log("onresult final:" + event.results[i][0].transcript);
            final_transcript += event.results[i][0].transcript;
        }
        else {
            //t.innerText += event.results[i][0].transcript;
            console.log("onresult:" + event.results[i][0].transcript);
            interim_transcript += event.results[i][0].transcript;
            interim_span.innerHTML = interim_transcript;
        }
    }
    //final_transcript = capitalize(final_transcript);
    if (0 <= final_transcript.indexOf("briši sve")) {
        interim_transcript = "";
        final_transcript = "";
        if (testtext)
            testtext.value = "";
    }
    if (0 <= final_transcript.indexOf("briši")) {
        //obiši zadnjih sedam znakova
        final_transcript = final_transcript.substring(0, final_transcript.length - 7);
        if (testtext)
            testtext.value = final_transcript;
    }
    var gotovo = false;
    if (0 <= final_transcript.indexOf("gotovo")) {
        //" gotovo" ima 7 znakova
        interim_transcript = interim_transcript.substring(0, interim_transcript.length - 7);
        final_transcript = final_transcript.substring(0, final_transcript.length - 7);
        if (testtext)
            testtext.value = final_transcript;
        gotovo = true;
    }
    if (IsTTSSpeaking()) {
        //console.log("Još priča, brišem!");
        interim_transcript = "";
        final_transcript = "";
        if (testtext)
            testtext.value = "";
    }
    else {
        var xd = Distance(a.secondP.innerHTML.toLowerCase(), final_transcript.toLowerCase());
        console.log("Prvi distance (???): " + xd);
        if ((a.secondP.innerHTML.length * 0.4) >= xd) {
            //console.log("xd " + xd + " secondP " + a.secondP.innerHTML.toLowerCase() + " interim " + interim_transcript.toLowerCase() + " final " + final_transcript.toLowerCase());
            interim_transcript = "";
            final_transcript = "";
            if (testtext)
                testtext.value = "";
        }
    }
    var y = 0, y1 = 0;
    var x = 0;
    //provjeri sve odgovore
    while (x < a.answers.length) {
        //distance pokazuje razliku od željenog teksta
        y = Distance(a.answers[x], final_transcript);
        //treshold je ovdje definiran na 40%
        y1 = a.answers[x].length * 0.4;
        console.log("Drugi distance: " + y + " y1=" + y1);
        if (y == 0) {
            //ako je odgovor 100% točan, 
            //događa se rijetko 
            console.log("100% točno!");
            gotovo = true;
            break;
        }
        else if (y1 >= y) {
            //ako je razlika unutar tresholda, popravi    
            //popravlja se kako bi odgovor bio 100% točan
            //console.log("Popravljam: " + final_transcript + " u " + a.answers[x]);
            //interim_transcript = a.answers[x].toString();
            final_transcript = a.answers[x].toString();
            gotovo = true;
            break;
        }
        else {
            //console.log("Distance: " + y + " " + a.answers[x] + " -> " + final_transcript);
            console.log("String nije u dozvoljenim granicama.");
            /*            var testtext = (<HTMLInputElement>document.getElementById("testtext"))
                        if(testtext && final_transcript)
                        {
                            testtext.value = final_transcript;
                            //console.log(final_transcript);
                        }*/
        }
        x = x + 1;
    }
    interim_span.innerHTML = interim_transcript;
    final_span.innerHTML = final_transcript;
    if (testtext && final_transcript) {
        testtext.value = final_transcript;
        //console.log(final_transcript);
    }
    if (gotovo) {
        //gotovo = false;
        Recognize();
    }
};
function Recognize() {
    recognition.stop();
    var res = '';
    if (final_span.innerHTML.length == 0)
        res = interim_span.innerHTML;
    else
        res = final_span.innerHTML;
    TestResult(res);
    interim_span.innerText = '';
    final_span.innerText = '';
    final_transcript = '';
    if (testtext)
        testtext.value = '';
}
;
function startButton() {
    final_transcript = '';
    //nemoj počinjati ako priča TTS
    if (!IsTTSSpeaking()) {
        //console.log("Starting recognition.")
        recognition.start();
    }
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'mic-slash.gif';
    if (testtext)
        testtext.value = '';
}
;
//fukcija koja računa udaljensot dva stringa i vraća
//broj koji označava podudaranje
//što je broj veći i bliži duljini stringa to se
//stringovi bolje podudaraju 
function Distance(a, b) {
    if (a === b)
        return 0;
    var aLen = a.length;
    var bLen = b.length;
    if (0 === aLen)
        return bLen;
    if (0 === bLen)
        return aLen;
    var len = aLen + 1;
    var v0 = new Array(len);
    var v1 = new Array(len);
    var i = 0;
    var j = 0;
    var c2, min, tmp;
    while (i < len)
        v0[i] = i++;
    while (j < bLen) {
        c2 = b.charAt(j++);
        v1[0] = j;
        i = 0;
        while (i < aLen) {
            min = v0[i] - (a.charAt(i) === c2 ? 1 : 0);
            if (v1[i] < min)
                min = v1[i];
            if (v0[++i] < min)
                min = v0[i];
            v1[i] = min + 1;
        }
        tmp = v0;
        v0 = v1;
        v1 = tmp;
    }
    return v0[aLen];
}
var UApp = /** @class */ (function () {
    function UApp() {
        this.appStarted = false;
        this.beginDrawing = false;
        this.counter = 0;
        this.timeout = 0;
        this.timeoutStartEvent = 0;
        this.textToSpeak = "";
        this.answers = [];
        this.audioMode = false;
        this.timeoutMode = false;
        this.gameAVMode = gameAudioVideoModes.None;
        this.Elmnt = [];
        this.numberOfFalseAnswers = 0;
        this.conceptualGame = ConceptualizationModes.None;
        this.images = [];
        this.testMode = true;
        this.numberOfWords = 0;
        this.appStarted = false;
        //compatibility with App
        this.correctGroups = [];
        this.lastPointX = 0;
        this.lastPointY = 0;
        this.firstPointX = 0;
        this.firstPointY = 0;
        //this.currentRow = 0;
        var rews = "";
        rews = GetElements("Dirs");
        if (rews)
            this.dir = rews.split(";");
        else
            this.dir = [];
        rews = GetElements("Images");
        if (rews)
            this.images = rews.split(";");
        this.numberOfWords = Number(GetElements("ConceptualWords"));
        if (!this.numberOfWords)
            this.numberOfWords = 5;
        this.audioMode = Boolean(GetElements("Audio"));
        if (undefined == this.audioMode)
            this.audioMode = false;
        this.timeoutMode = Boolean(GetElements("TimeoutMode"));
        if (undefined == this.timeoutMode)
            this.timeoutMode = false;
        var xModeConcept = String(GetElements("GameAVMode")).toUpperCase();
        switch (xModeConcept) {
            case "AUDIO":
                if (IsOperatingSystemWindows())
                    this.gameAVMode = gameAudioVideoModes.Audio;
                else
                    this.gameAVMode = gameAudioVideoModes.Visual;
                break;
            case "AUDIOVISUAL":
                if (IsOperatingSystemWindows())
                    this.gameAVMode = gameAudioVideoModes.AudioVisual;
                else
                    this.gameAVMode = gameAudioVideoModes.Visual;
                break;
            case "VISUAL":
                this.gameAVMode = gameAudioVideoModes.Visual;
                break;
            case "RANDOM":
                this.gameAVMode = gameAudioVideoModes.Random;
                break;
            case "NONE":
            default:
                this.gameAVMode = gameAudioVideoModes.None;
                break;
        }
        xModeConcept = String(GetElements("ConceptualGame")).toUpperCase();
        switch (xModeConcept) {
            case "NORMAL":
                this.conceptualGame = ConceptualizationModes.Normal;
                break;
            case "BACKWARDS":
                this.conceptualGame = ConceptualizationModes.Backwards;
                break;
            case "NONE":
            default:
                this.conceptualGame = ConceptualizationModes.None;
                break;
        }
        //canvas dio
        //TODO napravi mjesto za crtanje kružića (mat)
        //i pisanje ispod textboxa
        this.canvas = document.getElementById("mycanvas");
        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = innerWidth * 0.96;
            this.canvas.height = innerHeight * 0.96;
        }
        //asr dio
        start_img = document.getElementById("start_img");
        start_button = document.getElementById("start_button");
        final_span = document.getElementById("final_span");
        interim_span = document.getElementById("interim_span");
        //mjesto gdje se upisuje odgovor
        testtext = document.getElementById("testtext");
    }
    UApp.prototype.drawCards = function () {
        //ovdje se vraća igra kod NOK odgovora
        //kod audio igara je problem što se ne 
        //ponovi pitanje, a ne vidi se, pa ga treba
        //još jednom ponoviti
        if (gameAudioVideoModes.Audio == this.gameAVMode) {
            if (IsTTSSpeaking()) {
                //console.log("drawCards TTS still speaks!")
                return;
            }
            if (this.firstP.innerHTML)
                SpeakText(this.firstP.innerHTML);
            if (this.secondP.innerHTML)
                SpeakText(this.secondP.innerHTML);
        }
    };
    UApp.prototype.loadWords = function () {
        if (!this.ElmntNames) {
            var ns = GetElements("Names");
            if (ns)
                this.ElmntNames = ns.split(";");
            else
                //dio koda traži ElmntNames, a drugi dio
                //traži ElmntTitles 
                this.ElmntNames = [];
        }
        ns = GetElements("Titles");
        if (ns)
            this.ElmntTitles = ns.split(";");
        ns = GetElements("Places");
        if (ns)
            this.ElmntPlaces = ns.split(";");
        else
            this.ElmntPlaces = [];
        ns = GetElements("How");
        if (ns)
            this.ElmntHow = ns.split(";");
        else
            this.ElmntHow = [];
        // elementi idu od %1 do %9
        for (var x = 1; x < 10; x = x + 1) {
            ns = GetElements("%" + x);
            if (undefined !== ns)
                this.Elmnt[x] = ns.split(";");
        }
    };
    UApp.prototype.DefineConceptSentence = function () {
        var r = String("");
        var n, name;
        //        if(0 == this.ElmntNames.length)
        //            this.ElmntNames = this.ElmntTitles;
        //ako su sve riječi iskorištene, učitaj ih ponovo
        if (this.ElmntTitles.length < this.numberOfWords)
            this.loadWords();
        for (var i = 0; i < this.numberOfWords; i = i + 1) {
            n = Math.floor(Math.random() * this.ElmntTitles.length);
            r = r + String(this.ElmntTitles[n]) + " | ";
            //makni element iz liste
            this.ElmntTitles.splice(n, 1);
        }
        //console.log("DefineConceptSentence: " + r + "->" + this.ElmntTitles);
        //kako bi se mijenjao traženi string svaki puta 
        mm.allowedFalseAnswers = 0;
        return r;
    };
    UApp.prototype.DefineSentence = function () {
        if (this.conceptualGame != ConceptualizationModes.None) {
            this.DefineConceptSentence();
            return;
        }
        var x = -1;
        x = Math.floor(Math.random() * this.ElmntTitles.length);
        //odredi tekst 
        var r = String(this.ElmntTitles[x]);
        //zamjeni OK ime u tekstu
        if (1 > this.ElmntNames.length)
            this.loadWords();
        var n = Math.floor(Math.random() * this.ElmntNames.length);
        var name = String(this.ElmntNames[n]);
        while (0 <= r.indexOf("%NO")) {
            r = r.replace("%NO", name[0].toUpperCase() + name.substring(1));
        }
        while (0 <= r.indexOf("%nO")) {
            r = r.replace("%nO", name);
        }
        //ženski pridjevi imaju nastavak in
        //tebat će vidjeti kako riješiti za ostale
        while (0 <= r.indexOf("%NpO")) {
            r = r.replace("%NpO", name[0].toUpperCase() + name.substring(1, name.length - 1) + "in");
        }
        while (0 <= r.indexOf("%npO")) {
            r = r.replace("%npO", name.substring(0, name.length - 1) + "in");
        }
        this.ElmntNames.splice(n, 1);
        //zamjeni NOK ime u tekstu
        n = Math.floor(Math.random() * this.ElmntNames.length);
        name = String(this.ElmntNames[n]);
        while (0 <= r.indexOf("%NN")) {
            r = r.replace("%NN", name[0].toUpperCase() + name.substring(1));
        }
        while (0 <= r.indexOf("%nN")) {
            r = r.replace("%nN", name);
        }
        while (0 <= r.indexOf("%NpN")) {
            r = r.replace("%NpN", name[0].toUpperCase() + name.substring(1, name.length - 1) + "in");
        }
        while (0 <= r.indexOf("%npN")) {
            r = r.replace("%npN", name.substring(0, name.length - 1) + "in");
        }
        //zamjeni OK mjesto u tekstu
        if (1 > this.ElmntPlaces.length)
            this.loadWords();
        n = Math.floor(Math.random() * this.ElmntPlaces.length);
        name = String(this.ElmntPlaces[n]);
        while (0 <= r.indexOf("%PO")) {
            r = r.replace("%PO", name[0].toUpperCase() + name.substring(1));
        }
        while (0 <= r.indexOf("%pO")) {
            r = r.replace("%pO", name);
        }
        this.ElmntPlaces.splice(n, 1);
        //zamjeni NOK mjesto u tekstu
        n = Math.floor(Math.random() * this.ElmntPlaces.length);
        name = String(this.ElmntPlaces[n]);
        while (0 <= r.indexOf("%pN")) {
            r = r.replace("%pN", name);
        }
        while (0 <= r.indexOf("%PN")) {
            r = r.replace("%PN", name[0].toUpperCase() + name.substring(1));
        }
        //zamjeni OK način u tekstu
        if (1 > this.ElmntHow.length)
            this.loadWords();
        n = Math.floor(Math.random() * this.ElmntHow.length);
        name = String(this.ElmntHow[n]);
        //if(0 == name.indexOf("undefined"))
        //    console.log("ElmntHow is undefined!  n=" + n + " ElmntHow.length=" + this.ElmntHow.length);
        while (0 <= r.indexOf("%hO")) {
            r = r.replace("%hO", name);
        }
        while (0 <= r.indexOf("%HO")) {
            r = r.replace("%HO", name[0].toUpperCase() + name.substring(1));
        }
        this.ElmntHow.splice(n, 1);
        //zamjeni NOK način u tekstu
        n = Math.floor(Math.random() * this.ElmntHow.length);
        name = String(this.ElmntHow[n]);
        //if(0 == name.indexOf("undefined"))
        //    console.log("ElmntHow is undefined!  n=" + n + " ElmntHow.length=" + this.ElmntHow.length);
        while (0 <= r.indexOf("%hN")) {
            r = r.replace("%hN", name);
        }
        while (0 <= r.indexOf("%HN")) {
            r = r.replace("%HN", name[0].toUpperCase() + name.substring(1));
        }
        //zamjeni druge definicije u tekstu
        for (var x = 1; x < 10; x = x + 1) {
            //iskoristi staru varijablu name
            if (undefined !== this.Elmnt[x]) {
                var i = Math.floor(Math.random() * this.Elmnt[x].length);
                name = String(this.Elmnt[x][i]);
                while (0 <= r.indexOf("%" + x)) {
                    r = r.replace("%" + x, name);
                    if (this.Elmnt[x].length > 10)
                        //smisli kako izbaciti iskorištenu stvar
                        this.Elmnt[x].splice(i, 1);
                }
            }
        }
        return r;
    };
    UApp.prototype.CleanString = function (str) {
        if (undefined == str || null == str)
            return "";
        //str = str.replace(".", "");
        //str = str.replace(",", "");
        str = str.replace(/[\r\n] +/gm, "");
        str = str.replace("\n", "");
        return str;
    };
    UApp.prototype.usporediNizSTočnimNizom = function (list1, list2) {
        // Convert strings to arrays of words
        var arr1 = list1.toLowerCase().split(",").sort();
        var arr2 = list2.toLowerCase().split(",").sort();
        // Compare sorted arrays
        return arr1.every(function (element, i) { return element === arr2[i]; });
    };
    UApp.prototype.startApp = function () {
        this.lastPointX = 0;
        this.lastPointY = 0;
        this.firstPointX = 0;
        this.firstPointY = 0;
        this.beginDrawing = false;
        //console.log("appStarted true");
        this.appStarted = true;
        if (this.ctx)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.gameAVMode === gameAudioVideoModes.Random) {
            //changing AV mode for random
            var newMode = Math.ceil(Math.random() * gameAudioVideoModes.AudioVisual);
            this.gameAVMode = newMode;
        }
        //upali buttone za slušanje govora
        var right = document.getElementById("buttons");
        if (right) {
            right.style.display = "inline-block";
        }
        //aplikacija ima polje za upis 
        //var testtext = (<HTMLInputElement>document.getElementById("testtext"))
        if (testtext) {
            testtext.value = "";
            var tt = document.getElementById("testtextdiv");
            if (tt) {
                tt.style.display = "block";
                testtext.focus();
            }
        }
        mm.waitForVideoSelection = false;
        if (!this.ElmntTitles) {
            this.loadWords();
        }
        //there is only one first element
        //this.slika = document.getElementById("slika");
        this.firstP = document.getElementsByClassName("first")[0];
        this.secondP = document.getElementsByClassName("second")[0];
        this.thirdP = document.getElementsByClassName("third")[0];
        this.fourthP = document.getElementsByClassName("fourth")[0];
        this.fifthP = document.getElementsByClassName("fifth")[0];
        this.sixthP = document.getElementsByClassName("sixth")[0];
        this.firstP.innerHTML = " ";
        this.secondP.innerHTML = " ";
        this.thirdP.innerHTML = " ";
        this.fourthP.innerHTML = " ";
        this.fifthP.innerHTML = " ";
        if (this.sixthP)
            this.sixthP.innerHTML = " ";
        var r = localStorage.getItem(GetDocURI() + "_text");
        //obrisi puni array
        if (r) {
            var ar = r.split(";");
            if (ar.length == this.ElmntTitles.length + 1) {
                //console.log("puno, brisem sve");
                localStorage.setItem(GetDocURI() + "_text", "");
                r = "";
            }
        }
        var x;
        //posebni slučaj za testiranje govora
        var dg = this.ElmntTitles[0];
        if (0 <= dg.indexOf("DrawGrid")) {
            //this.answers = mm.rewVideos;
            //prepiši sve nagrade u odgovore
            //makni direktorije iz priče
            var ans;
            for (var i = 0; i < mm.rewVideos.length; i = i + 1) {
                ans = mm.rewVideos[i];
                ans = ans.replace("../MMLib/Video/", "");
                ans = ans.replace(".mp4", "");
                this.answers[i] = ans;
            }
            //prikaži OK panel ispod kontola za zvuk
            mm.elOK.style.display = "block";
            mm.DrawGrid();
            //izađi van što prije, za svaki slučaj
            return;
        }
        //ako tekst nije brisan onda je rijec o neodgovorenom pitanju
        if (r === "" || r === null || r === undefined || 0 > r.indexOf("-1")) {
            if (r === null) {
                //console.log("r null");
                r = ";";
            }
            x = -1;
            do {
                x = Math.floor(Math.random() * (this.ElmntTitles.length - 1));
            } while (0 <= r.indexOf(";" + x.toString() + ";"));
            //console.log("nova slika");
            localStorage.setItem(GetDocURI() + "_text", r + x.toString() + ";-1");
            if (this.ElmntNames)
                r = this.DefineSentence();
        }
        else {
            //console.log("pronadji zadnji nerjeseni");
            //makni nerjesenu oznaku i pronadji zadnji
            var xr = ar[ar.length - 2];
            x = parseInt(xr);
        }
        r = this.ElmntTitles[x];
        //ako rečenica u sebi ima još % varijabli
        if (r && 0 <= r.indexOf("%"))
            r = this.DefineSentence();
        else 
        //console.log("r not defined! " + r);
        //ako je nesto krivo s poljem odigranih
        if (this.ElmntTitles.length < x) {
            //console.log("brisem sve");
            localStorage.setItem(GetDocURI() + "_text", "");
            this.startApp();
            return;
        }
        //???
        //x = x + 1;
        var str;
        if (this.images.length > 1)
            str = this.dir + this.images[x];
        else
            str = this.dir + x + ".png";
        var slika = document.getElementById("slika");
        if (slika)
            slika.setAttribute("src", str);
        //za konceptualizaciu ne vrijedi ništa od gore navedenog
        if (this.conceptualGame > ConceptualizationModes.None) {
            r = this.DefineConceptSentence();
        }
        //podjeli recenice na pojedini text, pitanje, odgovor
        var s = r.split("^");
        //recenica
        var l1 = s[0];
        //pitanje
        var l2 = s[1];
        //odgovor
        var l3 = this.CleanString(s[2]);
        var odg = [];
        var tocniodg = [];
        var tocniodgovor;
        var mj;
        //ponuđeni odgovori
        if (0 <= l3.indexOf("$")) {
            odg = l3.split("$");
            //točni
            if (0 <= odg[0].indexOf("|")) {
                tocniodg = odg[0].split("|");
                mj = Math.floor(Math.random() * tocniodg.length);
                tocniodgovor = tocniodg[mj];
            }
            else {
                tocniodgovor = odg[0];
                tocniodg[0] = odg[0];
            }
            //u odg ostaju samo netočni odgovori
            //izbaci prvi dio (točne odgovore)
            odg.splice(0, 1);
            var brojOdgovora = 0;
            if (this.sixthP)
                //ako postoji polje sixthP onda treba 4 odgovora
                brojOdgovora = 4;
            else
                //ako ne postoji polje sixthP onda treba 3 odgovora
                brojOdgovora = 3;
            //ispiši odgovore
            mj = Math.floor(Math.random() * brojOdgovora);
            var m1;
            if (mj == 0) {
                this.thirdP.innerHTML = tocniodgovor;
            }
            else {
                m1 = Math.floor(Math.random() * odg.length);
                this.thirdP.innerHTML = (odg[m1] ? odg[m1] : "");
                odg.splice(m1, 1);
            }
            if (mj == 1) {
                this.fourthP.innerHTML = tocniodgovor;
            }
            else {
                m1 = Math.floor(Math.random() * odg.length);
                this.fourthP.innerHTML = (odg[m1] ? odg[m1] : "");
                odg.splice(m1, 1);
            }
            if (mj == 2) {
                this.fifthP.innerHTML = tocniodgovor;
            }
            else {
                m1 = Math.floor(Math.random() * odg.length);
                this.fifthP.innerHTML = (odg[m1] ? odg[m1] : "");
                odg.splice(m1, 1);
            }
            if (mj == 3) {
                if (this.sixthP)
                    this.sixthP.innerHTML = tocniodgovor;
            }
            else {
                m1 = Math.floor(Math.random() * odg.length);
                if (this.sixthP)
                    this.sixthP.innerHTML = (odg[m1] ? odg[m1] : "");
                odg.splice(m1, 1);
            }
        }
        else {
            // za vizalne igre pokaži tekst kako je napisan
            if (!gameAudioVideoModes.Visual)
                l1 = l1.toUpperCase();
            this.firstP.innerHTML = l1;
            //ukloni ispis undefined 
            //tako što ćeš dodati ""
            if (!l2)
                l2 = "";
            tocniodgovor = l3;
        }
        //rečenica uvijek počinje velikim slovom za rečenice s varijablama
        if (tocniodgovor && 0 < tocniodgovor.indexOf(" "))
            tocniodgovor = tocniodgovor[0].toUpperCase() + tocniodgovor.substring(1);
        //problem sa drugim točnim odgovorima je u tome što počinju malim slovom
        //ovako bi to trbalo biti izbjegnuto
        var xI = 0;
        while (xI < tocniodgovor.indexOf("|", xI + 1)) {
            //+ 1 jer inače uvijek ga nađe na istom mjestu
            xI = tocniodgovor.indexOf("|", xI + 1);
            tocniodgovor = tocniodgovor.substring(0, xI) + "|" + l3[xI + 1].toUpperCase() + tocniodgovor.substring(xI + 2);
        }
        this.answers[0] = tocniodgovor; //.toUpperCase();
        if (gameAudioVideoModes.AudioVisual == this.gameAVMode || gameAudioVideoModes.Visual == this.gameAVMode) {
            //console.log("Pišem " + l2);
            this.firstP.innerHTML = l1;
            this.secondP.innerHTML = l2;
            //za debug odgovora
            //this.thirdP.innerHTML = l3;
        }
        else {
            this.firstP.outerHTML = this.firstP.outerHTML.replace("style=\"", "style=\"display:none\";");
            this.firstP.innerHTML = l1;
            //console.log("Skrivam: " + l2);
            this.secondP.outerHTML = this.secondP.outerHTML.replace("style=\"", "style=\"display:none\";");
            this.secondP.innerHTML = l2;
        }
        if (true == this.audioMode || gameAudioVideoModes.AudioVisual == this.gameAVMode || gameAudioVideoModes.Audio == this.gameAVMode) {
            //zamjeni specijalne znakove razumljivim tekstom
            if (l2) {
                l2 = l2.replace("⋅", "!puta!");
                l2 = l2.replace(":", "!podjeljeno s!");
            }
            //pročitaj tekst
            /*const synUtterance = new window['SpeechSynthesisUtterance']();
            let voiceSelect = "Microsoft Matej - Croatian (Croatia)";	//<br/>
            synUtterance.voice = window['speechSynthesis']
                .getVoices()
                .filter(function (voice) {
                    return voice.name === voiceSelect;
                })[0];
            synUtterance.lang = "hr-hr";
            synUtterance.volume = 1;
            //synUtterance.rate = 1;
            //synUtterance.pitch = 1;
            //if(this.textPlayed == false)*/
            if (l1) {
                //console.log("Čitam l1:" + l1);
                this.textToSpeak = l1;
                SpeakText(l1);
                //this.textPlayed = true;
                //synUtterance.text = l1;
                //window['speechSynthesis'].speak(synUtterance);
            }
            if (l2) {
                //console.log("Čitam l2:" + l2);         
                this.textToSpeak = l2;
                SpeakText(l2);
                //this.textPlayed = true;
                //synUtterance.text = l2;
                //window['speechSynthesis'].speak(synUtterance);
            }
        }
        //this.audio = new Audio(String(this.Elmnt4[row]));
        //this.audio.play();
    };
    return UApp;
}());
function UMouse_down(e) {
    UStartEvent(e.clientX, e.clientY);
}
function UTouch_start_gesture(e) {
    // get the current mouse position
    if (e.touches.length === 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }
    UStartEvent(touch.pageX, touch.pageY);
}
function UStartEvent(x, y) {
    if (a.timeoutMode && a.counter == 1) {
        //console.log("Timeout startan na drugi klik!");
        a.timeoutStartEvent = setTimeout(Finish, 2000);
        a.counter = a.counter + 1;
        return;
    }
    if (!a.appStarted) {
        //console.log("Startam aplikaciju!");
        //startaj app na prvi klik
        /*        var strtBt = document.getElementById("start_button");
                if(strtBt)
                {
                    if(0 != start_img.src.indexOf('mic-animate.gif'))
                        //startaj speach recognition ASR
                        startButton();
                }*/
        a.startApp();
        return;
    }
    else {
        //console.log("App startana! " + a.appStarted);
    }
    /*  za slučaj kada je context za 100px ispod vrha
        ekrana i textboxa
        if(a.ctx)
            y = y - 100;
    */
    a.firstPointX = x;
    a.firstPointY = y;
    a.lastPointX = x;
    a.lastPointY = y;
    a.beginDrawing = true;
    a.counter = a.counter + 1;
    //console.log("StartEvent: x:" + x + ", y:" + y + " counter:" + a.counter);
    //a.audio.pause();
    //provjeri da li se trazi selekcija videa
    if (mm.waitForVideoSelection) {
        //console.log("waitForVideoSelection true");
        if (!mm.nameTheVideo) {
            //console.log("Clicked on the video!");
            mm.startRightVideo(x, y);
        }
        /*        else
                {
                    //ovako se strata video sa definiranim imenom
                    //console.log("Reci koji video želiš gledati!");
                    //uzmi text iz input boxa i pozovi pokretanje videa
                    var tt = <HTMLInputElement>document.getElementById("testtext");
                    //uzmi tekst iz input boxa
                    TestResult(tt.value);
                    //var vname = "../MMLib/Video/Mia Dimšić-Keksi, cimet,-karamele, čaj.mp4";
                    mm.startRightVideoFromName(vname);
                }*/
        mm.waitForVideoSelection = false;
    }
    else {
        //console.log("waitForVideoSelection true");
    }
}
/*
function UMouse_up(e) {

    e.preventDefault();
    e.stopPropagation();

    UUpEvent(e.x, e.y);
}

function UTouch_end_gesture(e) {

    e.preventDefault();
    e.stopPropagation();

    UUpEvent(a.lastPointX, a.lastPointY);
}

function UUpEvent(x: number, y: number)
{
    a.counter = a.counter + 1;

    if(a.ctx)
        y = y - 100;

    if(a.testMode)
    {
        a.beginDrawing = false;
        return;
    }

    if(!a.serialMode)
    {
        //zbog višestrukih up evenata događa se da se slika i tekst ne slažu
        console.log("UpEvent:" + a.beginDrawing + " " + x + " " + y + " " + mm.waitForVideoSelection, a.firstPointX - x, document.body.clientHeight * 0.8);
        if(!a.beginDrawing)
            return;

        if(mm.waitForVideoSelection)
        {
            mm.waitForVideoSelection = false;
            return;
        }

        //console.log("Zovem NOK()")
        //mm.NOK();
        a.startApp();
        return;
    }
}
*/
function UMoveEvent(x, y) {
    if (a.testMode) {
        if (a.ctx) {
            a.ctx.beginPath();
            if (a.beginDrawing) {
                a.ctx.strokeStyle = "black";
                a.ctx.lineWidth = a.canvas.width * 0.005;
                a.ctx.beginPath();
                a.ctx.moveTo(a.lastPointX, a.lastPointY);
                a.ctx.lineTo(x, y);
                a.ctx.stroke();
            }
        }
        a.lastPointX = x;
        a.lastPointY = y;
    }
    else {
        if (a.beginDrawing) {
            a.lastPointX = x;
            a.lastPointY = y;
        }
    }
}
function UTouch_move_gesture(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }
    this.UMoveEvent(touch.pageX, touch.pageY);
}
function UMouse_move(e) {
    e.preventDefault();
    e.stopPropagation();
    this.UMoveEvent(e.clientX, e.clientY);
}
function UKeyUp(e) {
    //    console.log("KeyUp");
    //    a.firstP.innerHTML = document.getElementById("test");
    //a.firstP.innerHTML = e.key;
    //var tt = <HTMLInputElement>document.getElementById("testtext");
    var el = "";
    //provjeri gdje je upisan tekst i da li je zadnji
    //karakter u textboxu, ako nije onda je možda OK/NOK/X
    if (testtext) {
        el = testtext.value;
        //console.log(testtext.value + " testtext length: " + (testtext.value.length - 1));
        //console.log("e.key -> " + e.key + " -> " + testtext.value.lastIndexOf(e.key));
    }
    /*if(testtext && testtext.value.length - 1 == testtext.value.lastIndexOf(e.key))
    {
        ;//el = testtext.value;
    }*/
    if (!testtext || testtext.value.length - 1 != testtext.value.lastIndexOf(e.key) || testtext.value.length == 0) {
        //console.log("specijalni znak van textboxa " + e.key);
        if (e.key == "X" || e.key == "x") {
            //izlaz sa X u slučajevima kad nema
            //prikazanog input tekst polja
            TestResult("KRAJ");
            return;
        }
        //dalje
        if (e.key == "D" || e.key == "d") {
            a.counter = -1;
            //TODO ovdje treba izbrisati netočan odgovor kako bi krenuo dalje
            //RemoveNotSolvedMark();
            a.startApp();
            return;
        }
        //OK nagrada
        if (e.key == "O" || e.key == "o") {
            a.counter = 10;
            RemoveNotSolvedMark();
            Finish();
            return;
        }
        //Ne, nema nagrade
        if (e.key == "N" || e.key == "n") {
            a.counter = 0;
            Finish();
            return;
        }
    }
    /*    el = el.replace(/l/g, "i");
        el = el.replace(/1/g, "i");
        el = el.replace(/\//g, "i");
        el = el.replace(/\\/g, "i");
        el = el.replace(/\(/g, "i");
        el = el.replace(/\)/g, "i");
        el = el.replace(/0/g, "o");
        el = el.replace(/5/g, "s");
        el = el.replace(/3/g, "e");
        el = el.replace(/\s+/g, "");*/
    //el = el.toUpperCase();
    el = a.CleanString(el);
    if (testtext)
        testtext.innerText = el;
    //math?
    var n = parseInt(el);
    //ovo je zbog igre sa pisanjem brojeva 
    //133, 315...
    //trenutno povećano zbog brojeva većih od 1000
    if (n > 10000) {
        mm.waitForVideoSelection = false;
        mm.NOK();
        return;
    }
    if (e.key == "Enter")
        TestResult(el);
    //a.secondP.innerHTML = a.secondP.innerHTML + el;
}
function TestResult(res) {
    //bezuvjetno se vrati na početnu stranicu
    //ako je upisan KRAJ 
    if (0 == res.indexOf("KRAJ")) {
        leavePage = true;
        OpenIndexPage();
    }
    //var r = res.substring(0, 3).toUpperCase();
    var tocno = false;
    //ako ima višestruko točnih odgovora
    if (0 <= a.answers[0].indexOf("|")) {
        var i = 0;
        var odgovori = a.answers[0].split("|");
        while (i <= odgovori.length - 1 && tocno == false) {
            //usporedi svaki pojedinačni odgovor
            if (0 <= odgovori[i].indexOf(res) && res.length == odgovori[i].length) {
                tocno = true;
                //console.log("res=" + res + " odgovori=" + odgovori[i]);
            }
            i = i + 1;
        }
    }
    else if (0 <= a.answers[0].indexOf(",")) {
        var tocniOdg = a.answers[0].replace(", ", ",");
        res = res.replace(", ", ",");
        //makni točke ako ih ima
        //TODO što sa ? i !
        tocniOdg = tocniOdg.replace(".", "");
        res = res.replace(".", "");
        //" i " je često prisutan u nabrajanju
        //zamjeni sve sa ","
        res = res.replaceAll(" i ", ",");
        //console.log("Usporedi liste u odgovoru: " + a.answers[0] + " res: " + res);        
        tocno = a.usporediNizSTočnimNizom(tocniOdg, res);
    }
    else {
        //stari uvijet prije višestruko točnih odgovora
        if (0 <= a.answers[0].indexOf(res) && res.length >= a.answers[0].length) {
            tocno = true;
            //console.log("res=" + res + " odgovori=" + odgovori[i]);
        }
    }
    //za slučaj kad je odgovor ime videa koji se pušta
    if (mm.nameTheVideo) {
        res = res.replace("\n", "");
        mm.getRightVideoName(res);
        if (mm.vname)
            tocno = true;
        else
            tocno = false;
    }
    //stringovi jednako dugački je bilo bitno dok Keti nije znala staviti točku na kraj rečenice
    //uvođenjem višestruko točnih odgovora to nema smisla
    //ali pravi probleme kod skraćenih verzija odgovora (npr 1 ili a je skoro uvijek točno)
    if (tocno) {
        //ovo je poziv mm.OK() ali je maknuto odavde da bi se uvijek izvršavao na isti način
        a.counter = 8;
        Finish();
        //console.log(a.answer + " res:" + res + " r:" + r + " OK!");
        //mm.waitForVideoSelection = true;
        //RemoveNotSolvedMark();
        //mm.OK();
        //za svaki slučaj ako bude nešto nadopisano dolje
        return;
    }
    else {
        /*console.log("NOK ubaci -1");
        if(0 > x.indexOf("-1"))
            localStorage.setItem(GetDocURI() + "_text", x + "-1");
*/
        //console.log(a.answer + " res:" + res + " r:" + r + " NOK!");
        //ovo je NOK
        a.counter = 0;
        Finish();
        //mm.waitForVideoSelection = false;
        //mm.NOK();
        //za svaki slučaj ako bude nešto nadopisano dolje
        return;
    }
}
function RemoveNotSolvedMark() {
    var x = localStorage.getItem(GetDocURI() + "_text");
    if (!x)
        return;
    if (0 <= x.indexOf("-1")) {
        console.log("OK makni -1");
        x = x.replace("-1", "");
        localStorage.setItem(GetDocURI() + "_text", x);
    }
}
function OnClick(elem) {
    //da li još priča? sačekaj dok ne završi s pričom
    if (IsTTSSpeaking()) {
        elem.innerHTML = "<span style='color:gray;'>" + elem.innerText + "</span>";
        //console.log("Još priča, ne radi ništa.");
        return;
    }
    var odg = "";
    if (elem) {
        odg = elem.innerText;
        //odg = odg.toUpperCase();
    }
    TestResult(odg);
}
//za OK/NOK sa ekrana prebroj dodire
function Finish() {
    clearTimeout(this.timeout);
    clearTimeout(this.timeoutStartEvent);
    if (a.counter >= 7 && a.counter <= 15) {
        //da se ne vraća staro pitanje
        RemoveNotSolvedMark();
        mm.waitForVideoSelection = true;
        mm.OK();
    }
    else if (a.counter == -1) {
        Start();
    }
    else {
        mm.waitForVideoSelection = false;
        mm.NOK();
    }
    a.counter = 0;
    //mm.waitForVideoSelection = false;
}
//za NOK sa dodirom ekrana umjesto čitanja
function ButtonNOKclicked() {
    //ovo će generirati NOK uvijek
    TestResult("");
}
//za OK sa dodirom ekrana umjesto čitanja
function ButtonYESclicked() {
    //ovo će generirati OK uvijek
    TestResult(a.answers[0]);
}
//za varku kod pritiskanja ok
function ButtonClicked() {
    if (a.thirdP.style.display == "none") {
        a.thirdP.style.display = "block";
        a.fourthP.style.display = "block";
        a.fifthP.style.display = "block";
        if (a.sixthP)
            a.sixthP.style.display = "block";
    }
    else {
        a.thirdP.style.display = "none";
        a.fourthP.style.display = "none";
        a.fifthP.style.display = "none";
        if (a.sixthP)
            a.sixthP.style.display = "none";
    }
}
//za OK u mikrofon kontrolama
function ButtonOKclicked() {
    //ovo je problem kada je vidljiv input box
    if (final_span.innerText)
        TestResult(final_span.innerText);
    else {
        //uzmi tekst iz input boxa
        TestResult(testtext.value);
    }
    final_transcript = "";
    final_span.innerText = "";
    if (testtext)
        testtext.value = "";
}
function ButtonXclicked() {
    final_transcript = "";
    final_span.innerText = "";
    if (testtext)
        testtext.value = "";
}
function ButtonOClicked() {
    mm.lastTextToRead = "";
    SpeakText(a.textToSpeak);
}
window.onload = function () {
    a = new UApp();
    window.addEventListener('keyup', UKeyUp, true);
    window.addEventListener('touchstart', UTouch_start_gesture, false);
    window.addEventListener('mousedown', UMouse_down, false);
    //    window.addEventListener('mouseup', UMouse_up, false);
    //    window.addEventListener('touchend', UTouch_end_gesture, false);
    window.addEventListener('mousemove', UMouse_move, false);
    window.addEventListener('touchmove', UTouch_move_gesture, false);
    mm = new MM(a);
    Start();
};
//ovo je rješenje za riječi u listi, npr nabroji voće
/*
  function compareFruitLists(list1, list2) {
    // Convert strings to arrays of words
    const arr1 = list1.toLowerCase().split(" ").sort();
    const arr2 = list2.toLowerCase().split(" ").sort();
    // Compare sorted arrays
    return arr1.every((fruit, i) => fruit === arr2[i]);
  }
  // Example usage
  const childList = "Bananas, apples, pears and plums";
  const targetList = "apples, bananas, pears, plums";
  
  if (compareFruitLists(childList, targetList)) {
    console.log("The child listed all the target fruits.");
  } else {
    console.log("The child did not list all the target fruits.");
  }
*/
/*   VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
ovo je rješenje za rečenice s vremenom ovog tipa:
Idem u školu.
Ja idem u školu.
Ići ću u školu.
Išla sam u školu.
Podijeli na "školu", "idem u", "ići ću" i "išla sam"
i ovisno o tome prepoznaj da li su rečenice ok
/*
function containsWords(inputStr, referenceStr) {
  // Split the input and reference strings into arrays of words
  const inputWords = inputStr.split(/\W+/);
  const referenceWords = referenceStr.split(/\W+/);

  // Iterate over each word in the reference string
  for (const referenceWord of referenceWords) {
    // Check if the input string contains the current reference word
    let wordFound = false;
    for (const inputWord of inputWords) {
      if (inputWord.toLowerCase() === referenceWord.toLowerCase()) {
        wordFound = true;
        break;
      }
    }
    // If the current reference word was not found in the input string, return false
    if (!wordFound) {
      return false;
    }
  }
  // All reference words were found in the input string, so return true
  return true;
}
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*/
/*  responsive voice js snippet
<script src="https://code.responsivevoice.org/responsivevoice.js?key=YOUR_UNIQUE_KEY"></script>
responsiveVoice.speak("hello world", "Croatian Male", {onstart: StartCallback, onend: EndCallback});
*/
