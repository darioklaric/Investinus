/* TODO list
S krivulja učenja, da li se može pratiti? 
barem da se videi smanjuju s napretkom 
*/

//@ts-check
/// <reference path="app.ts" />

/*//@ts-check
/// <reference path="app.ts" />
/// <reference path="iapp.ts" />
/// <reference path="uapp.ts" />*/
/// <reference path="mapp.ts" />*/
//const speechRecognition = Window['webkitSpeechRecognition'];
let a;
let mm: MM;
let leavePage; 
//GA4 fix
interface Window {
    dataLayer?: any[];
}

enum ConceptualizationModes {
    None = 0,
    Normal,
    Backwards,
    Random
};

enum gameAudioVideoModes {
    None = 0,
    Visual,
    Audio,
    AudioVisual,
    Random
}

enum writeTextShowImage {
    Both = 0,
    Image = 1,
    Text = 2
}

class MM {

    //move video timeri
    moveVideo: boolean;
    mvdX: number = 0;
    mvdY: number = 0;
    mvdeltaX: number = 4;
    mvdeltaY: number = 3;
    mvdSize: number = 1.001;
    timeoutMVVideo;    

    //timeout vars
    timeoutVideo: number;
    timeoutAudio: number;
    timeoutBell: number;
    
    //app: App;
    bellPlaytime: number;
    //numberOfOneGamePlayed: number;
    numberOfCorrectAnswers: number;
    rewardStarted: boolean;
    startVideo: boolean;
    audioPlaytime: number;
    counter: number;
    totalVideoCount: number;
    elCanvas;
    elNOK;
    elOK;
    elVideo;
    rewVideos: string[];
    videosSpec: string[];
    NOKzvuci: string[];
    OKzvuci: string[];
    answerOK: boolean;
    videosOrder;
    waitForVideoSelection: boolean;
    timestamp: Date;
    today: string;
    videoPosition: number;
    reason: string = "Unknown";
    nokText: string[];
    nokText1: string[];
    okText: string[];
    okText2: string[];
    okText3: string[];
    allowedFalseAnswers: number;
    globalRews;
    rewards = [];
    numberOfFalseAnswers = 0;
    retriesBeforeReward = 0;
    changeTheGame = false;
    retries = 0;
    videoPlaytime = 0;
    showCorrectAnswer = false; 
    nameTheVideo = false;
    vname = ""; //../MMLib/Video/Mia Dimšić-Keksi, cimet,-karamele, čaj.mp4";
    lastTextToRead = ""; 

    constructor(myapp) 
    {
        console.log("mm constructor");

        if(myapp)
            a = myapp;
        else
        {
            console.log("MM:No app to connect!");
            a = null;
        }

        //inicijaliziraj google tag za GoogleAnalytics
        let myScript = document.createElement("script");
        myScript.setAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-TZ9DP5PKLH");
        myScript.setAttribute("async", "true");
        let head = document.head;
        head.insertBefore(myScript, head.lastElementChild);
//TODO ovo treba istestirati
        let dataLayer = window.dataLayer || [];
        function gtag(jen, dva){dataLayer.push(jen, dva);}
        gtag('js', new Date()); 
        gtag('config', 'G-TZ9DP5PKLH');
        //Google Analytics inicijalizacija gotova

        //localStorage.setItem("LastAppPage", GetDocURI());
        var rews = localStorage.getItem("GlNagrada");
        if (rews) 
        {
            this.globalRews = rews.split(";");
        }
        this.videoPosition = -1;

        //pomicanje videa definirano u HTMLu igre 
        this.moveVideo = Boolean(GetElements("MoveVideo"));
        if(!this.moveVideo)
            this.moveVideo = false;

        this.videoPlaytime = Number(GetElements("VideoPlaytime"));
        if (!this.videoPlaytime)
            this.videoPlaytime = 15000;
        else    //playtime is in seconds in html
            this.videoPlaytime = this.videoPlaytime * 1000;

        rews = GetElements("Rewards");
        this.rewards = rews.split(";");
        if (this.rewards[0] == "")
            this.rewards.pop();
        var x = Number(GetElements("RetriesBeforeReward"));
        this.retriesBeforeReward = x;
        if (undefined == this.retriesBeforeReward || null == this.retriesBeforeReward)
            this.retriesBeforeReward = 2;
        if(!IsOperatingSystemWindows() && this.retriesBeforeReward > 2)
            this.retriesBeforeReward = 2;
        this.retries = Number(GetElements("Retries"));
        if (!this.retries)
            this.retries = 3;
        this.nameTheVideo = Boolean(GetElements("NameTheVideo"));
        if(!this.nameTheVideo)
            this.nameTheVideo = false;

        //trenutno se ne koristi, čini se
        this.changeTheGame = Boolean(GetElements("ChangeTheGame"));
        if (!this.changeTheGame)
            this.changeTheGame = true;
        var n = Number(GetElements("ClockAlert"));
        if (n)
            //zbog starog načina izražavanja u milisekundama
            if(n < 1000)
                this.bellPlaytime = n * 1000;
            else
                this.bellPlaytime = n;
        else
            this.bellPlaytime = 60000;

        //da li tipka back vraća na index stranicu
        var backOff = localStorage.getItem("BackOff");
        if(backOff == "1")              
            leavePage = false;
        else
            leavePage = true;

        this.moveVideo = false;

        this.showCorrectAnswer = Boolean(GetElements("ShowCorrectAnswer"));
        if (!this.showCorrectAnswer)
            this.showCorrectAnswer = false;
        else
            this.showCorrectAnswer = true;
                
        //pokreni sat
        this.timeoutBell = setInterval(RingBell, this.bellPlaytime);
        this.timestamp = new Date();
        //console.log("timestamp: " + this.timestamp + " " + this.timestamp.getTime());

/*      Zapisivanje provedneog dnevnog vremena u igri isključeno
        this.today = this.timestamp.getFullYear() + "/" + (this.timestamp.getMonth() + 1) + "/" + this.timestamp.getDate();
        var lsToday = localStorage.getItem(this.today);
        //console.log("lsToday: " + lsToday);
        if(undefined == lsToday || null == lsToday)
        {
            localStorage.setItem(this.today, "0");
            //console.log("definiram:" + this.today);
        }
        else
        {
            ;
            //console.log("localStorage:" + this.today + " " + lsToday);
        }*/

        if(true == TestLast10())
        {
            AddReason("Last10 prekoracen u MM konstruktoru.");
            CalculateEndTime();
            location.replace("../index.html");
            return;
        }

        //if we change the game we will change it after numberOfOneGamePlayed
/*        if(null == a)
            this.numberOfOneGamePlayed = 10;
        else
            this.numberOfOneGamePlayed = this.retries;
*/
        //show the video after numberOfCorrectAnswers
        this.numberOfCorrectAnswers = 0;
        this.rewardStarted = false;
        this.startVideo = false;
        this.audioPlaytime = 3000;
        this.elCanvas = document.getElementById("canvas");
        this.videosOrder = new Array();
        //insert videos into HTML body element
        //this.videos = new Array(); // = this.rewards; rewards disconnected
        this.rewVideos = new Array();
        this.numberOfFalseAnswers = 0;
        this.allowedFalseAnswers = 3;
        //this.retriesBeforeReward = 0;

        //ovo je zbog problema sa praznim arrayima
        if(this.rewards[0] == "")
            this.rewards.splice(0, 1);

        //spoji dvije liste nagrada (lokalnu i globalnu)
        this.globalRews = this.rewards.concat(this.globalRews);        
        var totalVideos = this.globalRews.length;
/*        if(IsOperatingSystemWindows())
            totalVideos = 19;
        else
            totalVideos = 19;*/

        if(totalVideos <= 0)
        {
            console.log("Nema nagarada!");
            return;
        }

        for(var vn = 0; vn < totalVideos; vn = vn + 1)
        {
            if(0 <= this.globalRews[vn].indexOf("http"))
            {    //internet videi
                this.rewVideos.push(this.globalRews[vn]);
            }
            else
            {
                //lokalni videi
                this.rewVideos.push("../MMLib/Video/" + this.globalRews[vn]);
            }
            //numerirani videi 1,2,3.mpg
            //this.rewVideos.push("../MMLib/Video/" + String(vn) + ".mp4");
        }
        this.videosSpec = new Array();
        var c = 0;
        while(c <= 10)
        {
            if(c <= this.rewards.length)
            {
                //uvijek uvrsti specifične videe
                this.videosSpec[c] = this.rewVideos[c];
                c = c + 1;
            }
            else
            {
                var z = Math.floor(Math.random() * this.rewVideos.length);
                if(0 > this.videosSpec.indexOf(this.rewVideos[z]))
                {
                    this.videosSpec[c] = this.rewVideos[z];
                    c = c + 1;
                }
            }
        }

        this.waitForVideoSelection = false;

        this.NOKzvuci = ["NOKBljak", "NOKKrivo", "NOKNe", "NOKNetocno"];
        this.OKzvuci = ["OK", "OKBravo", "OKDa", "OKDobro", "OKHura", "OKIzvrsno", "OKOdlicno", "OKSjajno", "OKSuper", "OKTakoje", "OKTo", "OKTocno"];
        this.nokText = ["Možeš reći 'Ja ne znam'.", "Nema veze.", "Probaj još jednom.", "Možeš ti to.", "Razmisli malo.", "Razmisli još jednom.", "Probaj ponovo.", "Pokušaj još jednom.", "Bit će bolje.", "Sjetit ćeš se."];
        this.nokText1 = ["Možeš reći 'Ja ne znam'.", "Nema veze.", "Probaj još jednom.", "Možeš ti to.", "Razmisli malo.", "Razmisli još jednom.", "Probaj ponovo.", "Pokušaj još jednom.", "Bit će bolje.", "Sjetit ćeš se."];
        this.okText = ["Bravo!", "Sjajno!", "Odlično!", "Za pet!", "Bez greške!", "Tako je!", "Izvrsno!", "Hura!", "Točno!", "Super ti ide!", "Sve znaš!", "Fantastično!", "Fenomenalno!", "Nevjerojatno!", "Prekrasno!"];
        this.okText2 = ["Vrlo dobro!", "Možeš i bez greške!", "Dobro misliš!", "Za četiri!", "Rješeno!", "To! Tako je!", "Pa da!"];
        this.okText3 = ["Dobro!", "Možeš ti i puno bolje!", "Za tri!", "Tako je!", "Pa da!", "Rješeno!", "Konačno!"];

        var counter = 0;
        this.totalVideoCount = 10;
        this.answerOK = true;
        // makni 20 definicija videa jer memorijski opterećuju brwoser
        //        for (var v in this.rewVideos) 
        {
            var div_1 = document.createElement("div");
            div_1.className = "vu";
            var t = document.createElement("video");
            var s = document.createElement("source");
//            s.src = this.videosSpec[0]; //this.rewVideos[v];
            s.type = "video/mp4";
            div_1.id = "video" + counter;
            t.id = "v" + counter;
            div_1.style.display = "none";
            counter = counter + 1;
            t.appendChild(s);
            div_1.appendChild(t);
            document.body.appendChild(div_1);
        }
        //this.totalVideoCount = this.globalRews.length;
        //NOK insert not OK div image into HTML body element
        var div = document.createElement("DIV");
        div.setAttribute("class", "nok");
        var nt = document.createElement("canvas");
        nt.id = "nokcanvas";
        //var nt = document.createElement("img");
        //nt.src = "../MMLib/Slike/n" + Math.floor(Math.random() * 7) + ".jpg";
        div.appendChild(nt);
        document.body.appendChild(div);
        div.style.display = "none";
        this.elNOK = div;
        //OK insert OK div image(s) into HTML body element
        div = document.createElement("DIV");
        div.setAttribute("class", "ok");
        var ot = document.createElement("canvas");
        ot.id = "okcanvas";
        //var ot = document.createElement("img");
        //ot.src = "../MMLib/Slike/" + Math.floor(Math.random() * 13) + ".jpg";
        div.appendChild(ot);
        document.body.appendChild(div);
        div.style.display = "none";
        this.elOK = div;
    }

    OK() {
        AddReason("OK");
        //ako je nagrada već startana ne pokreći novu
        if (this.rewardStarted)
            return;
        this.rewardStarted = true;

        this.numberOfCorrectAnswers = this.numberOfCorrectAnswers + 1;
        if (this.retriesBeforeReward <= this.numberOfCorrectAnswers) 
        {
            this.numberOfCorrectAnswers = 0;
            console.log("Starting video after tries: " + this.retriesBeforeReward)
            this.startVideo = true;
        }
        else
            this.startVideo = false;
        if(this.numberOfFalseAnswers > 0)
        {
            this.startVideo = false;
            if(a)
            {    if(!a.conceptualGame)
                {
                    this.numberOfFalseAnswers = 0;
                    //this.startVideo = true;
                }
            }
        }

        this.answerOK = true;
        //glasom pohvali za točan odgovor 
        //var okFile = String("..\\MMLib\\Zvukovi\\" + this.OKzvuci[Math.floor(Math.random() * this.OKzvuci.length)] + ".mp3");
        //var audio = new Audio(okFile);
        //audio.play();

        //ovo je za video na zahtjev bez 
        //izbora na OK stranici
        if(this.nameTheVideo)
        {
            //ovako se strata video sa definiranim imenom
            this.AdjustStyle("video");
            //var vname = "../MMLib/Video/Mia Dimšić-Keksi, cimet,-karamele, čaj.mp4";
            mm.startRightVideoFromName(this.vname);
            //za svaki slučaj, da se ne dopiše ispod if bloka
            return;
        }    
        //pripremi izbor videa na ekranu 
        else if(0 != this.videoPlaytime && true == this.startVideo)
        {
            this.AdjustStyle("ok");
            this.DrawGrid();
        }
        //ovo je kad se video ne prikazuje iako je 
        //odgovor bio OK
        else
        {
            this.timeoutAudio = setTimeout(ContinueOrStop, this.audioPlaytime);
            this.AdjustStyle("ok");

            let ocanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("okcanvas");
            var octx = ocanvas.getContext("2d");
            if(!octx)
            {
                console.log("No 2d canvas context.");
                return;
            }
            ocanvas.width = innerWidth * 0.95;
            ocanvas.height = innerHeight * 0.95;
            var octxWidth = ocanvas.width;
            var octxHeight = ocanvas.height;
            var imageOObj = new Image();
            imageOObj.onload = function () {
                octx.drawImage(imageOObj, octxWidth - imageOObj.width, 0, imageOObj.width, imageOObj.height);
            }
            imageOObj.src = "..\\MMLib\\Slike\\" + Math.floor(Math.random() * 50) + ".png";
            octx.drawImage(imageOObj, octxWidth - imageOObj.width, 0, imageOObj.width, imageOObj.height);

            var txt = "";
            if(0 == this.numberOfFalseAnswers)
                txt = this.okText[Math.floor(Math.random() * this.okText.length)];
            else if(1 == this.numberOfFalseAnswers)
                txt = this.okText2[Math.floor(Math.random() * this.okText2.length)];
            else
                txt = this.okText3[Math.floor(Math.random() * this.okText3.length)];
            //SpeakText(txt);
            octx.font = "bold " + octxHeight * 0.10 + "px Arial";
            octx.fillStyle = "red";
            octx.fillText(txt, octxWidth * 0.05, octxHeight * 0.10); 
        }
    }

    DrawGrid()
    {
        //a.ClearCanvas("DrawGrid");
        this.waitForVideoSelection = true;
        //isprazni poredak videa, ali sačuvaj skriveni
        var xV = -1;
        if(this.videosOrder.length > 10)
        {
            //za sve ulaze osim prvoga sačuvaj što je svirano
            xV = this.videosOrder[10];
            //console.log("vides order prije brisanja: " + this.videosOrder)
        }
        else
            xV = 10; 

        this.videosOrder.splice(0, this.videosOrder.length);
        //promješaj svaki puta
        if(this.videosOrder.length < 10)
        {
            let x:number = 0;
            while(x < 10)
            {
                var vo = Math.floor(Math.random() * 11);
                if(0 > this.videosOrder.indexOf(vo) && vo != xV)
                {
                    this.videosOrder[x] = vo;
                    x = x + 1;
                }
            }
            this.videosOrder[10] = xV;
        }

        //console.log("videos order: " + this.videosOrder);
        let cnvs: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("okcanvas");
        var ctx = cnvs.getContext("2d");
        cnvs.width = innerWidth * 0.95;
        cnvs.height = innerHeight * 0.95;

        var w = cnvs.width / 5;
        var h = cnvs.height / 4;

        //gornja emocija
        let imageOObj = new Image();
        imageOObj.onload = () => {
            ctx.drawImage(imageOObj, cnvs.width - imageOObj.width, 0, imageOObj.width, imageOObj.height);
        }
        imageOObj.src = "..\\MMLib\\Slike\\" + Math.floor(Math.random() * 50) + ".png";
        ctx.drawImage(imageOObj, cnvs.width - imageOObj.width, 0, imageOObj.width, imageOObj.height);

        var txt = this.okText[Math.floor(Math.random() * this.okText.length)];
        //SpeakText(txt);
        ctx.font = "bold " + cnvs.height * 0.10 + "px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(txt, cnvs.width * 0.05, cnvs.height * 0.10); 

        var rewDisplay = localStorage.getItem("NagradePrikazujKao");
        if(!rewDisplay)
            rewDisplay = "SLIKA";

        let c = 0;
        for(let y = cnvs.height / 2; y < cnvs.height; y = y + h)
        {
            for(let x = 0; x < cnvs.width; x = x + w)
            {
                if(0 == rewDisplay.indexOf("TEKST"))
                {
                    //kod za ispis teksta + dodir na tekst
                    ctx.font = "Italic " + cnvs.height * 0.03 + "px Calibri";
                    ctx.fillStyle = "red";
                    var t = this.videosSpec[this.videosOrder[c]].replace("../MMLib/Video/", "");
                    t = t.replace(".mp4", "");
                    if(0 > t.indexOf("-"))
                    {
                        ctx.fillText(t, x + w * 0.1, y); 
                    }
                    else
                    {
                        // odvoji - dijelove u odvojene linije
                        var lines = t.split("-");
                        for (var j = 0; j < lines.length; j++)
                            ctx.fillText(lines[j], x + w * 0.1, y + (j * h * 0.2));
                    }
                }
                else if(0 == rewDisplay.indexOf("GLAS"))
                {
                    // kod za tekst + glas
                    let iObj = new Image();
                    iObj.onload = () => {
                        ctx.drawImage(iObj, x, y, w, h);
                    }
                    var av = this.videosSpec[this.videosOrder[c]];
                    av = av.replace("../MMLib/Video/", "");
                    av = av.replace(".mp4", "");
                    iObj.src = "..\\MMLib\\Slike\\m" + a + ".jpg";
                    ctx.drawImage(iObj, x, y, w, h);
                }
                else    //SLIKA 
                { 
                    // kod za slike
                    let iObj = new Image();
                    iObj.onload = () => {
                        ctx.drawImage(iObj, x, y, w, h);
                    }
                    var av = this.videosSpec[this.videosOrder[c]];
                    av = av.replace("../MMLib/Video/", "");
                    av = av.replace(".mp4", "");
                    iObj.src = "..\\MMLib\\Slike\\m" + a + ".jpg";
                    ctx.drawImage(iObj, x, y, w, h);
                }

                c = c + 1;
            }
        }
    }

    NOK() 
    {
        AddReason("NOK");
        if (this.rewardStarted)
        {
            this.rewardStarted = false;
            return;
        }
        this.rewardStarted = true;
        this.numberOfFalseAnswers = this.numberOfFalseAnswers + 1;

        this.answerOK = false;
        this.AdjustStyle("nok");

        let ncanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("nokcanvas");
        var nctx = ncanvas.getContext("2d");
        ncanvas.width = innerWidth * 0.95;
        ncanvas.height = innerHeight * 0.95;
        var nctxWidth = ncanvas.width;
        var nctxHeight = ncanvas.height;
        var imageNObj = new Image();
        imageNObj.onload = function () {
            nctx.drawImage(imageNObj, nctxWidth - imageNObj.width, 0, imageNObj.width, imageNObj.height);
        }
        imageNObj.src = "..\\MMLib\\Slike\\n" + Math.floor(Math.random() * 50) + ".png";
        nctx.drawImage(imageNObj, nctxWidth - imageNObj.width, 0, imageNObj.width, imageNObj.height);

        var txt = this.nokText[Math.floor(Math.random() * this.nokText.length)];
        //SpeakText(txt);
        nctx.font = "bold " + nctxHeight * 0.10 + "px Arial";
        nctx.fillStyle = "red";
        nctx.fillText(txt, nctxWidth * 0.05, nctxHeight * 0.10); 
        
        //if(0 == document.title.indexOf("Upis"))
        if(this.showCorrectAnswer)
        {
            //ispisi tocan odgovor na Ne ekranu
            nctx.font = nctxHeight * 0.05 + "px Arial";
            let offsetX: number = 0; //nctx.measureText(a.answers[0]).width / 2;
            let offsetY: number  = nctxHeight / 4;
            nctx.fillStyle = "#808080";
            //nctx.fillText(a.answers[0], nctxWidth / 2 - offsetX, nctxHeight - offsetY); 
            var ans = a.answers[0].replaceAll("|", "  ");
            nctx.fillText(ans, 0, offsetY); 
   
            this.timeoutAudio = setTimeout(ContinueOrStop, 2000);
        }
        else
            this.timeoutAudio = setTimeout(ContinueOrStop, 1000);

        this.startVideo = false;

        //var nokFile = String("..\\MMLib\\Zvukovi\\" + this.NOKzvuci[Math.floor(Math.random() * this.NOKzvuci.length)] + ".mp3");
        //var audio = new Audio(nokFile);
        //audio.play();
    }

    RestartApp() 
    {
        //panel s igrama
        var apps = "../index.html";
        //zaustavi sve nagrade
        this.rewardStarted = false;
        //kako bi se tekst ponovo pročitao
        this.lastTextToRead = "";

        if(true == TestLast10())
        {
            AddReason("Last10 prekoracen.");
            CalculateEndTime();
            //ne pokreći igru ako je dostignut last10
            location.replace(apps);
            return;
        }

        //specijalni slačaj za igre s pravim html titleom
        /*if(0 == document.title.indexOf("Koncept F"))
        {
            AddReason("Koncept FunkcProcesiranje.");
            CalculateEndTime();
            location.replace(apps);
            return;
        }*/

        if(!a)
        {
            // za slučajeve kada app nije definiran
            // npr rasturi i igre koje nemaju app klasu
            //izađi iz igre
            if(leavePage)
            {
                localStorage.setItem("LastAppPage", "");
                location.replace("../index.html");
            }
            else
                ;
        }

        //?non standard (card) game, writting, speaking... 
        if(isNaN(this.numberOfFalseAnswers))
        {
            //Start();
            this.numberOfFalseAnswers = 0;

            a.startApp();
            return;
        }

        //ConceptualizationModes !== None !== 0
        //igre konceptualizacije idu ovdje
        if(0 !== a.conceptualGame)
        {
            if(!this.answerOK)
            {
                // find correct answer if no more than 3 false answers
                if(this.allowedFalseAnswers <= this.numberOfFalseAnswers)
                {
                    this.numberOfFalseAnswers = 0;
                    //a.startApp();
                    //kreni od početka i čekaj dodir
                    Start();
                }
                else
                {
                    //nastavi dalje gdje si stao
                    a.drawCards();
                }
            }
            else
            {
                // finish the game
                this.numberOfFalseAnswers = 0;
                Start();
                //a.startApp();
            }
            return;
        }

        if (mm.retries) 
        {
            if (0 < this.retries) 
            {
                AddReason("Don't change the game.");
                CalculateEndTime();

                if(!this.answerOK)
                    // find correct answer
                    a.drawCards();
                else
                    // finish the game
                    a.startApp();
                    //Start();
                return;
            }
            else 
            {
                //?? ovo je za slučajni izbor sljedeće app
                /*var app = apps[Math.floor(Math.random() * apps.length)];
                this.numberOfOneGamePlayed = a.retries;*/
                //change the game and reinitialize everything
                AddReason("Change the game.");
                location.replace(apps);
                return;
            }
        }
        else 
        {
            if(a.guessedCards == undefined || a.correctCardsDown == undefined || undefined == a.correctGroups)
            {
                //za igre koje nisu s kartama 
                //start a new game over and over from begining
                AddReason("No cards game.");
                CalculateEndTime();
                a.startApp();
                //Start();
            }
            else if(a.guessedCards == a.correctCardsDown * a.correctGroups.length)
            {
                //start a new game over and over from begining
                //za slučajeve kada nije predviđena promjena igre
                AddReason("Cards game.");
                CalculateEndTime();
                a.startApp();
                //Start();
                //location.replace(apps[0]);
            }
            else if(a.correctGroups.length > 1)
            {
                //start a new game over and over from begining
                AddReason("Find all correct groups.");
                CalculateEndTime();
                a.startApp();
                //Start();
            }
            //
            else if(a.retries > 0)
            {
                AddReason("Retries not reached.");
                CalculateEndTime();
                a.startApp();
            }
            else
            {
                //return to previous game where it's stopped
                //ovo treba otkomentirati ako se zeli nastaviti igra dok 
                //se ne pogodi tocna karta
                //a.drawCards();
                //Start();
                //ne racuna se vrijeme kako se ne bi zbrajalo dva puta jer replace trigerira Reload
                //ovdje prolaze i NOK odgovori
                //CalculateEndTime();
                AddReason("Nothing.");
                location.replace(apps);
            }
        }
    };

    startRightVideoFromName(name)
    {
        let cnvs: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("okcanvas");
        cnvs.width = innerWidth * 0.95;
        cnvs.height = innerHeight * 0.95;
  
        if(!name)
            name = mm.vname;

        this.elVideo.src = name;
        PlayVideo();
    }

    getRightVideoName(inputTxt)
    {
        let x = -1, y = -1;
        //pronađi puno ime videa
        while(x == -1 && y < mm.rewVideos.length - 1)
        {
            y = y + 1;
            x = mm.rewVideos[y].indexOf(inputTxt);
        }
        //za slučaj kada ništa nije upisano res.length
        //i kada je string pronađen
        if(x >= 0 && inputTxt.length > 0)
            mm.vname = mm.rewVideos[y];
    }

    startRightVideo(x, y)
    {
        //enable just one of video divs
        //var position = Math.floor(Math.random() * this.totalVideoCount);
        let cnvs: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("okcanvas");
        //var ctx = cnvs.getContext("2d");
        cnvs.width = innerWidth * 0.95;
        cnvs.height = innerHeight * 0.95;

        var w = cnvs.width / 5;
        //var h = cnvs.height / 4;
        //var ctx = cnvs.getContext("2d");
        
        let xC = w;
        let xCO = 0;
        let c = 0;
        let position = -1;

        while(xC <= cnvs.width)
        {
            if(x > xCO && x < xC)
            {
                if(y >= cnvs.height / 2 && y <= cnvs.height / 4 * 3)
                    position = c;
                if(y >= cnvs.height / 4 * 3 && y <= cnvs.height)
                    position = c + 5;

                break;
            }

            c = c + 1;
            xCO = xC;
            xC = xC + w;
        }

        console.log("stratRightVideo Position " + position);
        if(x < 10 && y < 10)
        {
            //bit ce pozvan s replace, 
            //x i y su koordinate koje se inače teško pogađaju
            //CalculateEndTime();
            AddReason("Restart");
            location.replace("../index.html");
            return;
        }
        
        if(position < 0)
        {
            //za slučaj kad se pogodi bijeli dio canvasa
            //preskoči prikazivanje videa
            AddReason("No video selected");
            CalculateEndTime();
            //restart the app if video not chosen
            this.AdjustStyle("canvas");
            this.rewardStarted = false;
            //a.startApp();
            Start();
            return;
        }            
        this.videoPosition = position;
                            
        //put the right video in place
        this.elVideo.src = this.videosSpec[this.videosOrder[this.videoPosition]];
        console.log("Video: " + this.videosSpec[this.videosOrder[this.videoPosition]]);
        PlayVideo();

        //izbaci zadnje svirani video tako da se ne vidi u idućem izboru
        //console.log("videi prije zamjene " + this.videosOrder);
        var t = this.videosOrder[10];
        this.videosOrder[10] = this.videosOrder[position];
        this.videosOrder[position] = t;
        //console.log("videi nakon zamjene " + this.videosOrder);
    }

    AdjustStyle(st) {
        //turn off all divs
        if(this.elCanvas)
            this.elCanvas.style.display = "none";
        this.elOK.style.display = "none";
        this.elNOK.style.display = "none";
        var divVideo = document.getElementById("video0");
        if(divVideo)
            divVideo.style.display = "none";
        this.elVideo = document.getElementById("v0"); // + this.videosOrder[this.videoPosition]);
//        if(this.elVideo)
//            this.elVideo.style.display = "none";
        switch (st) {
            case "video":
                //enable just one of video divs
                //if(-1 == this.videoPosition)
                //    this.videoPosition = Math.floor(Math.random() * this.totalVideoCount);
                //console.log("AdjustStyle position:" + this.videoPosition.toString());
                if(divVideo)
                {
                    divVideo.style.display = "block";
                    divVideo.style.width = (window.innerWidth * .98).toString();   //a.ctxWidth.toString();
                    divVideo.style.height = (window.innerHeight * .96 - 200).toString();
                }
                if(this.elVideo)
                {
                    //console.log("Enabling video!");
                    //this.elVideo.marginTop = (window.innerHeight - 200) / 2;
                    //this.elVideo.marginLeft = (window.innerWidth - 320) / 2;
                    if(IsOperatingSystemWindows())
                    { 
                        this.elVideo.width = 320; 
                        this.elVideo.height = 200;
                    }
                    else
                    {
                        this.elVideo.width = 320; 
                        this.elVideo.height = 200;
                    }
                    this.elVideo.display = "block";
                }
                this.videoPosition = -1;
                break;
            case "canvas":
                if(this.elCanvas)
                {
                    this.elCanvas.style.display = "block";
                    if(a)
                    {
                        this.elCanvas.width = a.ctxWidth;
                        this.elCanvas.height = a.ctxHeight;
                    }
                }
                break;
            case "ok":
                this.elOK.style.display = "block";
                break;
            case "nok":
                this.elNOK.style.display = "block";
                break;
            default:
                break;
        }
    };
};

/*function WriteStat(s: string)
{
    let timestampEnd : Date = new Date();
    var diff = timestampEnd.getTime() - mm.timestamp.getTime();
    v = v + " " + (diff / 60000).toFixed(2) + "min";
    v = v + "<br>";
    ls = ls + v;
    localStorage.setItem("stat1", ls);
}*/

function CalculateEndTime()
{
    //ovo je upitno jer app.mm nije definiran u starim js projektima
    if(mm == null)
    {
        console.log("CalculateEndTime: No MM defined!")
        return;
    }        

    if(a == undefined)
    {
        console.log("CalculateEndTime: No App defined in MM!")
        return;
    }
 
    let timestampEnd : Date = new Date();
    var diff = timestampEnd.getTime() - mm.timestamp.getTime();
    //console.log("end: " + timestampEnd + " start: " + mm.timestamp + "diff: " + diff / 60000);

    if(diff < 5000 && 0 <= mm.reason.indexOf("Reload or Back"))
    {
        localStorage.setItem("reload", GetDocURI()); //document.documentURI);
        //nemoj staviti ovu stranicu u listu pregledanih
        return;
    }

    // od ovoga ce se praviti provjera da se ne moze igrati jedna te ista igra cijelo vrijeme
    var lsLast10 = localStorage.getItem("last10");
    if(lsLast10 == null)
    {
        lsLast10 = "";
    }
    else
    {
        //skrati lsLast10 tako da ima samo 40 elemenata
        if(39 <= lsLast10.split(';').length - 1)
            lsLast10 = lsLast10.substring(lsLast10.indexOf(";") + 1);
    }
    var name = GetDocURI(); //document['documentURI'];
    //name = name.replace('.', 'http:\/\/localhost');
    let addLast10:boolean = false;
    if(0 == mm.reason.indexOf("NOK"))
    {
        //nemoj brojati pogrešne odgovore
        addLast10 = false;
    }
    else if(0 == mm.reason.indexOf("OK"))
    {
        if(mm.numberOfFalseAnswers > 0)
        {
            //nemoj brojati pogrešne odgovore
            addLast10 = false;
        }
        else
        {
            addLast10 = true;
        }
    }
    else if(0 == mm.reason.indexOf("RingBell"))
    {
        //nemoj brojati neaktivne (bez odgovora u zadanom vremenu)
        addLast10 = false;
    }
    else
    {
        addLast10 = true;
    }

    //potoji mogućnost da se preko naziva stranice ne spremaju pregledi, npr za testiranje
    //if(0 !== document.title.indexOf("Tst") && addLast10 !== false)
    if(addLast10 !== false)
    {
        //spremi samo odigrane slučajeve
        localStorage.setItem("last10", lsLast10 + ";" + name);
    }

    //dodaj statistiku
    var lsStat1 = localStorage.getItem("stat1");
    let stat : string = mm.today + " " + ('0' + timestampEnd.getHours()).slice(-2) + ":" + ('0' + timestampEnd.getMinutes()).slice(-2) + ":" + ('0' + timestampEnd.getSeconds()).slice(-2) + " ";
    stat = stat + GetDocURI() + " ";
    if(a.cardsUp > 0)
        stat = stat + " " + a.cardsUp + " ";
    else if(a['text'] !== undefined)
       stat = stat + " " + a['text'] + " ";
    stat = stat + mm.reason + " " + (diff / 1000) + "s;"; 

    localStorage.setItem("stat1", lsStat1 + stat);
    mm.timestamp = timestampEnd;
    mm.reason = "Unknown";

    /* zapisi koliko je dugo igrano svakog dana
    var lsToday = localStorage.getItem(mm.today);
    if(undefined === lsToday)
    {
        console.log("datum nije definiran!");
        localStorage.setItem(mm.today, (diff / 60000).toFixed(2) + "min");
    }
    else
    {
        if(diff < 150000)
        {
            //console.log("lsToday: " + lsToday);
            let n : number = parseFloat(lsToday);
            n = n + diff / 60000;
            localStorage.setItem(mm.today, n.toFixed(2) + " min");
        }
        else
        {
            console.log("Predugo nekativan: " + (diff/60000).toString());
            stat = stat + "Not active";
        }
    }*/
}

function GetDocURI() 
{
    var dc;
    if (0 <= document['documentURI'].indexOf("www.investinus.hr"))
    {
        dc = document['documentURI'] 
        console.log("GetDocURI www: " + dc);
        return dc;
    }
    else
    {
        //za slučaj kad se kod izvršava lokalno
        dc = document['documentURI'].substring(document['documentURI'].lastIndexOf("InvestInUs/") + 11);
        //console.log("GetDocURI: " + dc);
        return dc;
    }
}

//timeout callback methods seems to have problems when contained in class
function PlayVideo() 
{
    //stop any running instance, first
    if (mm.elVideo)
        mm.elVideo.pause();
    if (mm.timeoutVideo)
        clearTimeout(mm.timeoutVideo);
    
    var playtime = mm.videoPlaytime;
    //smanji vrijeme videa za netočne odgovore 
    if(!mm.answerOK)
        playtime = playtime / 10;

    //start video and stop it in videoPlaytime seconds
    mm.timeoutVideo = setTimeout(StopVideo, playtime);
    mm.timeoutMVVideo = setInterval(UpdateVideoSizePostion, 50);
    //console.log("set timeoutMVVideo=" + mm.timeoutMVVideo);
    mm.AdjustStyle("video");
    if (mm.elVideo)
    {    //ovo treba rijesiti preko onpromise buga
        if(!mm.elVideo.duration)
        {
            //počni negdje u prve dvije minute ako nema podatka o trajanju videa
            mm.elVideo.currentTime = Math.floor(Math.random() * 120);
        }
        else
        {
            mm.elVideo.currentTime = Math.floor(Math.random() * (mm.elVideo.duration - playtime / 10000));
        }
        mm.elVideo.loop = true;
        //mm.elVideo.width = 320;
        //mm.elVideo.height = 200;
        //if(0 == document.title.indexOf("Tst") || 0 == document.title.indexOf("Koncept"))
            //nije jasno zašto se volumen ne može mijenjati ovako
            //radi samo 1 i 0
            mm.elVideo.volume = 1;
        //else
        //    mm.elVideo.volume = 0;
        mm.elVideo.play();
    }

    //preventivno zaustavi ostale videe ako dođu greškom 
    mm.startVideo = false;
    //mm.waitForVideoSelection = false;
}

function StopVideo() 
{
    //zaustavi video i vrati se nazad u aplikaciju
    mm.elVideo.pause();
    mm.AdjustStyle("canvas");
    clearTimeout(mm.timeoutVideo);
    //console.log("clear 2 timeoutMVVideo=" + mm.timeoutMVVideo);
    clearInterval(mm.timeoutMVVideo);
    mm.startVideo = false;
    mm.rewardStarted = false;
    //mm.waitForVideoSelection = false;
    //uključi ton ako je bio isključen
    mm.elVideo.volume = 1;
    //vrati se nazad u igru
    mm.RestartApp();
}

function RingBell()
{
    AddReason("RingBell");
    CalculateEndTime();
    var r;
    if(mm.bellPlaytime)
        r = confirm("Prošlo je " + (mm.bellPlaytime / 60000).toString() + " min. \nŽeliš li nastaviti?");
    else
        r = confirm("Prošlo je ? min. \nŽeliš li nastaviti?");

    //audio podsjetnik    
    //var audio = new Audio("..\\MMLib\\Zvukovi\\bell.mp3");
    //audio.play();

    clearTimeout(mm.timeoutBell);
    mm.timeoutBell = setTimeout(RingBell, mm.bellPlaytime);

    //ako je izabran OK ostani još u igri
    //ako je izabran Cancel izađi na glavni panel
    if(r != true)
    {
        leavePage = true;
        localStorage.setItem("LastAppPage", "");
        location.replace("../index.html");
    }

    return;
}

function OpenIndexPage()
{
    //var lsApp = localStorage.getItem("LastAppPage");
    //mm.retries = mm.retries - 1;

    //vrati se na index samo ako je app pokrenut dovoljan broj puta 
    //if(mm.retries < 0)
/*    if(0 > lsApp.indexOf(GetDocURI()))
    {
        localStorage.setItem("LastAppPage", "");
//        location.replace("../index.html");
    }
    else
    {*/
    if(leavePage)
    {
        localStorage.setItem("LastAppPage", "");
        location.replace("../index.html");
    }
    else
        localStorage.setItem("LastAppPage", GetDocURI());
//      location.replace(lsApp);
    //}
}

function ContinueOrStop() 
{
    if (mm.startVideo)
    {
        PlayVideo();
    }
    else
    {
        mm.AdjustStyle("canvas");
        clearTimeout(mm.timeoutAudio);
        //console.log("clear timeoutMVVideo=" + mm.timeoutMVVideo);
        clearInterval(mm.timeoutMVVideo);
        mm.startVideo = false;
        //nema više potrebe za ovim
        //mm.waitForVideoSelection = false;
        //vrati se nazad u igru
        mm.RestartApp();
    }
}

function Unload()
{
    AddReason("Reload or Back");
    //u celculateedtime ce se pratiti da li je prebrzo izasla
    CalculateEndTime();
    if(!leavePage)
    {
        OpenIndexPage();
        //leavePage = true;
    }

    return;
}

//dodaj razlog izlaska za statistiku
function AddReason(reason: string)
{
    if(mm == null)
    {
        console.log("MM not defined!");
        return;
    }

    //obriši nepoznate uzroke
/*    if(0 == mm.reason.indexOf("Unknown"))
        mm.reason = reason;
    else*/
        mm.reason = mm.reason + " " + reason;
}

window.addEventListener('beforeunload', Unload, false);

function TestLast10()
{
  var lsLast10 = localStorage.getItem("TestLast10");
  if(lsLast10 != "1")
    //testiranje je isključeno
    return false;
  
  lsLast10 = localStorage.getItem("last10");
  if(null == lsLast10)
    return false;

  var adr = GetDocURI(); //document['documentURI'];
  //broji koliko ima istih adresa u zadnjih 10
  var count = lsLast10.split(adr).length - 1;

  if(count < 9)
    return false;
  else
    return true;
};

function IsOperatingSystemWindows() {

    var platform = window.navigator.platform;
    if(0 != platform.indexOf("Win"))
        return false;
    else
        return true;
};

function GetElements(txt) 
{
    //kako za nedefinirane ne bi imali grešku dodjeli im ""
    let v: string|null;
    v = "";
    //let v = undefined;

    try {
        v = document.getElementById(txt)!.textContent;
    }
    catch (e) {
        v = "";
        console.log(txt + " is not defined in html file!");
        //alert(txt + " is not defined in index.html!")
    }

    return v;
};

var callStartApp = false;
function Start()  //callStartApp = false 
{
    if(a)
    {
        //a.appStarted = false;
        mm.lastTextToRead = "";

        if(callStartApp)
        {
            console.log("Start (mm.js) -> startApp()")
            a.appStarted = false;
            a.startApp();
        }
        else
        {
            //ovo je problem kod karata
            //a.drawCards();
            console.log("Start (mm.js) -> ne zove a.drawCards()???")
            a.appStarted = false;
        }
    }
    else
    {
        console.log("Start (mm.js) -> ništa")
        //MStart();
    }
}

function replaceAll(str, sToRpl, sRplWth)
{
    if(!str || sRplWth || sToRpl)
        return;

    do {
        str.replace(sToRpl, sRplWth);
    } while(0 >= str.indexOf(sToRpl));
} 

speechSynthesis.addEventListener("error", (e: Event) => {
    const errorEvent = e as any;
    console.log('error:' + errorEvent.error);
    console.log('message:' + errorEvent.message);
});

function IsTTSSpeaking()
{ 
    if(speechSynthesis.speaking || speechSynthesis.pending)
        return true;

    return false;
}

function SpeakText(str)
{
    var u = new SpeechSynthesisUtterance();
    u.lang = 'hr-hr';
    u.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name === "Microsoft Matej - Croatian (Croatia)";})[0];
    u.volume = 0.5;
    u.rate = 1;
    u.pitch = 1;

    /*const synUtterance = new window['SpeechSynthesisUtterance']();
    let voiceSelect = "Microsoft Matej - Croatian (Croatia)";	//<br/>
    synUtterance.voice = window['speechSynthesis']
        .getVoices()
        .filter(function (voice) {
            return voice.name === voiceSelect;
        })[0];
    synUtterance.lang = "hr-hr";
    synUtterance.volume = 1;
    synUtterance.rate = 1;*/
    //synUtterance.pitch = 0.5;
    //if(this.textPlayed == false)
    if(str)
    {
/*        if(IsTTSSpeaking())
        {   
            mm.lastTextToRead = str;
            return;
        }*/

        if(0 == mm.lastTextToRead.indexOf(str))
        { 
            console.log("Text isti kao prošli, preskačem! " + mm.lastTextToRead + " " + str);
        }
        else
        {
            u.text = str;
            speechSynthesis.speak(u);
            
            if(!IsTTSSpeaking())
            {
                /*console.log("Greška! Restartam app. Trebao bi pročitati: " + str);
                a.appStarted = false;
                mm.lastTextToRead = "";
                a.startApp();*/
            }
            else
            {
                console.log("Čitam: " + str);                
                mm.lastTextToRead = str;
            }
        }
    }
    else
        console.log("SpeakText nema teksta!")
}

// Define the function that will be called on a timer to update the video position and size
function UpdateVideoSizePostion()
{
    // Update the position and size of the video
    mm.mvdX = mm.mvdX + mm.mvdeltaX; 
    mm.elVideo.style.marginLeft = mm.mvdX + "px";
    mm.mvdY = mm.mvdY + mm.mvdeltaY; 
    mm.elVideo.style.marginTop = mm.mvdY + "px";
    //mm.elVideo.style.width = mm.elVideo.style.width * mm.mvdSize;
    //mm.elVideo.style.height = mm.elVideo.style.height * mm.mvdSize;
    //console.log("elVideo x, y, size: " + mm.elVideo.style.marginLeft + " " + mm.elVideo.style.marginTop + " " + mm.elVideo.width + " " + mm.elVideo.height);
    
    // If the video reaches the edge of the canvas, reverse its direction
    if (mm.mvdX >= innerWidth * 0.9 - mm.elVideo.width || mm.mvdX <= 0) {
        mm.mvdeltaX = -mm.mvdeltaX;
    }
    if (mm.mvdY >= innerHeight * 0.9 - mm.elVideo.height || mm.mvdY <= 0) {
        //ne vraćaj video nazad već ga vrati na početak
        //mm.mvdeltaY = -mm.mvdeltaY;
        mm.mvdY = 0;
    }
    
    // If the video reaches a certain size, stop scaling it
    if ((innerWidth * 0.4) <= mm.elVideo.width || (innerWidth * 0.5) <= mm.elVideo.height) {
        mm.mvdSize = 0.999;
    }
    //ako se previše smanji počni ga povećavati
    if (mm.elVideo.width <= (innerWidth * 0.2) || mm.elVideo.height <= (innerHeight * 0.1)) {
        mm.mvdSize = 1.001;
    }
}


