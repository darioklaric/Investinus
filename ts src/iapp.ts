//@ts-check
/// <reference path="mm.ts" />
class IApp 
{
    //da li je pokrenuta app
    appStarted: boolean = false;
    //da li pušta nagrade
    playReward: boolean;
    //prve i zadnje koordinate dodira
    lastPointX: number;
    lastPointY: number;
    firstPointX: number;
    firstPointY: number;
    //da li da počnem crtati po slici
    beginDrawing: boolean = false;
    //ukupan broj slika za prikaz
    numImgs = 0;
    //nazivi slika
    images = [];
    //tekst naslova za pojedinu sliku
    titles = [];
    //direktoriji u kojima su slike
    directories = [];
    //brojevi slika za prikazivanje za neserijski (rnd) mod prikazivanja
    //potrbno jer ne mogu dohvatiti broj aktivnih slika u direktoriju
    nums = [];
    //curDir = 0;
    position = 0;
    writeTextOnImage = false;
    testMode = false;
    serialMode = false;
    //određuje broj slike broj.png (kad je broj ime slike)
    counter = 1;
    //ukupan broj pokušaja
    retriesNum = 0;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    //za stari mod kad je broj klikova određivao 
    //clicks OK
    clicks = 0;
    //nclicks NOK
    nclicks = 0;
    //da li treba pročitati natpis
    readTitle: boolean = false;
    //za PODD knjige koristi timer koji blokira dodire po ekranu  
    touchTimeout: Number;
    touchTimeoutTimer;
    modPODD: boolean = false;
    textToRead = "";

    constructor() 
    {
        console.log("iapp constructor");
        this.titles = [];
        this.directories = [];
        this.nums = [];
        //this.curDir = 0;
        this.readTitle = false;
        
        var rews;
        rews = GetElements("Titles");
        this.titles = rews.split(";");
        rews = GetElements("Images");
        this.images = rews.split(";");
        this.touchTimeout = Number(GetElements("TouchTimeout"));
        if (undefined == this.touchTimeout)
            this.touchTimeout = 0;
        else
            //prebaci milisekunde u sekunde
            this.touchTimeout = Number(this.touchTimeout) * 1000;
        
        this.writeTextOnImage = Boolean(GetElements("WriteTextOnImage"));
        if (undefined == this.writeTextOnImage)
            this.writeTextOnImage = false;
        this.testMode = Boolean(GetElements("TestMode"));
        if (undefined == this.testMode)
            this.testMode = false;
        this.serialMode = Boolean(GetElements("SerialMode"));
        if (undefined == this.serialMode)
            this.serialMode = false;
        this.readTitle = Boolean(GetElements("ReadTitle"));
        if (undefined == this.readTitle)
            this.readTitle = true;

        var dirs = GetElements("Dirs");
        this.directories = dirs.split(";");
        //this.curDir = 0;
        dirs = GetElements("Nums");
        this.nums = dirs.split(";");
        this.position = 0;
        this.counter = 1;
        this.clicks = 0;
        this.nclicks = 0;

        //pronađi dir u kojem su slike i pronađi koliko slika ima u diru
        this.position = Math.floor(Math.random() * this.directories.length);
        this.numImgs = this.nums[this.position];
    }

    pickImage()
    {
        var el;
        var txt;
        var value = [];

        if(!this.serialMode)
        {
            el = Math.floor(Math.random() * this.images.length);
            //console.log("pickImage: " + el);
            var img = this.images[el];
            value[0] = img;

            if (undefined !== this.titles[el]) 
                txt = this.titles[el];
            else
                txt = ""
            value[1] = txt;

            if(txt !== undefined && 0 <= txt.indexOf("$"))
            {
                //ovo se koristi za personal refereces
                //prvi param je ime slike, drugi text 
                value = txt.split("$");
                value[0] = value[0] + ".png";
                //value[1] = value[1];
            }  

            //kako se ne bi ponavljali prikazani elementi
            //dok se ne potrše svi iz polja, obriši prikazani
            this.titles.splice(el, 1);
            this.images.splice(el, 1);
        }
        else
        {   //this.serialMode za knjige i testiranje 
            el = this.counter - 1;
            console.log("PickImage " + this.counter + " " + this.images[el]);
            if(undefined == this.images[el])
            {    //ako nema više slika pokreni iapp ponovo
                this.counter = 1;
                el = 0;
                //this.createImages();
                //this.startApp();
            }
                
            value[0] = this.images[el];
            value[1] = this.titles[el];
            //this.counter = this.counter + 1;
        }

        return value;
    }

    createImages()
    {
        var r = Math.floor(Math.random() * this.directories.length);
        if(this.nums[r] <= 1)
            this.nums[r] = this.titles.length;

        //ako su slike definirane ne moraš ih učitavati ponovo
        if(this.images.length <= 1 && this.nums[r] > 1)
        {
            for(var i = 1; i <= this.nums[r]; i++)
            {
                //var img = dirs[r] + i + ".png";
                var img = i + ".png";
                this.images[i - 1] = img;
            }
        }
        //slučaj kad nije definiran nums ni titles ni imgs
        //(exp books i testing npr)
        else
        {
            for(i = 1; i < 40; i = i + 1)
            {
                var im = i.toString() + ".png";
                var ig = this.directories[this.position] + im; 
                //if(CreateImage(ig))
                    this.images[i - 1] = im;
                //else
                //    return;
            }
        }    
    }

    //zbog komatibilnosti s app.js i mm.js
    drawCards() {
        this.startApp();
    }

    startApp() {

        console.log("iapp startApp");
        mm.waitForVideoSelection = false;

        //za PODD applikacije moraš dozvoliti dodir
        //ekrana kako bi pokazala što želi
        if(0 != this.touchTimeout)
        {
            this.modPODD = true;
            this.touchTimeoutTimer = setTimeout(TouchTimeout, Number(this.touchTimeout))
        }

        //ne mjenjaj sliku ako još priča
        //ovo mora biti prvo, inače slike i opis ne štimaju
        if(window['speechSynthesis'].speaking)
        {
            console.log("Još priča, čekaj novi move.");
            if(!this.testMode)
                return;
        }
                
        var value;
        var img;
        var txt;

        if(this.images && this.images.length > 1)
        {
            value = this.pickImage();
        }
        else
        {
            this.createImages();
            value = this.pickImage();
        }
        txt = value[1];
        img = value[0];
        //console.log("img:" + img + " title:" + txt);
        this.beginDrawing = false;

        if(img === undefined && txt === undefined)
        {
            //ako se ne prikazuje ni slika ni tekst onda nešto nije u redu
            //console.log("img === undefined || this.numImgs > this.counter");
            this.counter = 0;
            this.retriesNum = 0;
            this.startApp();
            return;
        }

        //nema povratka odavde pa možeš app označiti startanom
        this.appStarted = true;

        img = this.directories[this.position] + img;
        var i = img.toString();
        i = i.replace(/[\r\n]/g, '');
        var bg = document.getElementById("mycanvas");
        var str = "url('" + i + "')";

        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        if(this.canvas)
        {
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = innerWidth * 0.96;
            this.canvas.height = innerHeight * 0.95;
        }

        if(this.testMode)
        {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.counter = Number(localStorage.getItem("Testiranje"));
            if(this.counter === undefined || this.counter < 1)
            {
                if(!this.serialMode)
                    this.counter = Math.floor(Math.random() * this.images.length);
                else
                    //za serialMode znači da je došao do kraja seta
            	    this.counter = 1;
            }

            var imageObj = new Image();
    
            imageObj.onload = () => {
                this.ctx.drawImage(imageObj, 10, 10, this.canvas.width - 20, this.canvas.height - 20);
            }
            imageObj.onerror = () => {
                console.log("iapp onerror kod postavljanja slike, vraćam counter i zovem startApp ponovo");
                localStorage.setItem("Testiranje", "1");
                this.counter = 1;
                this.startApp();
            }

            this.ctx.drawImage(imageObj, 10, 10, this.canvas.width - 20, this.canvas.height - 20);
            imageObj.src = this.directories[this.position] + this.counter + ".png";
            console.log("Slika za testmode: " + imageObj.src)
        }
        else
        {    //nacrtaj sliku na pozadinu
            bg.style.backgroundImage = str;
            console.log("Slika za pozadinu: " + str)
        }

        if(this.writeTextOnImage)
        {
            this.ctx.font = "bold " + this.canvas.height * 0.07 + "px Arial";
            this.ctx.fillStyle = "red";
            this.ctx.fillText(txt, 10, this.canvas.height * 0.10); 
        }

        if (undefined !== txt && this.readTitle) {
            //read the text
/*            var synUtterance = new window['SpeechSynthesisUtterance']();
            var voiceSelect_1 = "Microsoft Matej - Croatian (Croatia)"; //<br/>
            synUtterance.voice = window['speechSynthesis']
                .getVoices()
                .filter(function (voice) {
                return voice.name === voiceSelect_1;
            })[0];
            synUtterance.lang = "hr-hr";
            synUtterance.volume = 1;
            synUtterance.text = txt;
            window['speechSynthesis'].speak(synUtterance);*/
            this.textToRead = txt;
            SpeakText(txt);
        }
    }
};   

function IMouse_down(e) {
//    e.stopPropagation();

    IStartEvent(e.clientX, e.clientY);
}

function ITouch_start_gesture(e) {
//    e.stopPropagation();

    // get the current mouse position
    if (e.touches.length === 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }

    IStartEvent(touch.pageX, touch.pageY)
}

function IStartEvent(x: number, y: number) {

    //čekaj da smiješ dirati po ekranu
    if(a.modPODD)
    {
        console.log("touchTimeout još nije prošao!")
        return;
    }

    //console.log("StartEvent:" + x + " " + y);

    a.firstPointX = x;
    a.firstPointY = y;
    a.lastPointX = x;
    a.lastPointY = y;
    a.beginDrawing = true;

    //provjeri da li se trazi selekcija videa
    if(mm.waitForVideoSelection)
    {
        console.log("Selektiram video");
        mm.waitForVideoSelection = false;
        mm.startRightVideo(x, y);
    }

    if (!a.appStarted) 
    {
        console.log("restartam iapp");
        //a.appStarted = true;
        a.startApp();
    }
}

function IMouse_up(e) {

    //e.preventDefault();
    //e.stopPropagation();

    IUpEvent(e.x, e.y);
}

function ITouch_end_gesture(e) {

    //e.preventDefault();
    //e.stopPropagation();

    IUpEvent(a.lastPointX, a.lastPointY);
}

function IUpEvent(x: number, y: number) 
{
    //čekaj da smiješ dirati po ekranu
    if(a.modPODD)
    {
        console.log("touchTimeout još nije prošao!")
        return;
    }

    //u test modu može biti samo 
    //točnih ili netočnih odgovora
    if(a.testMode)
    {
        a.beginDrawing = false;

        //prepoznavanje 5 dodira
        //ili nešto što će raditi kao ok/nok
        if(x > a.canvas.width * 0.9 && y > a.canvas.height * 0.9)
        {
            if(5 <= a.clicks)
            {
                a.clicks = 0;
                mm.OK();
            }
            else
            {
                a.clicks = a.clicks + 1;
                //a.clicks = 0;
                //mm.NOK();
            }
        }
        else if(x > a.canvas.width * 0.9 && y < a.canvas.height * 0.1)
        {
            a.nclicks = a.nclicks + 1;
            if(5 <= a.nclicks)
            {
                a.nclicks = 0;
                iOK();
            }
        }

        return;
    }

    if(!a.serialMode)
    {
        //u random modu idu slike i tekst za učenje
        //ili opisivanje

        //zbog višestrukih up evenata događa se da se slika i tekst ne slažu
        //console.log("UpEvent:" + a.beginDrawing + " " + x + " " + y + " " + mm.waitForVideoSelection, a.firstPointX - x, document.body.clientHeight * 0.8);
        if(!a.beginDrawing)
            return;

        //pokazi sljedecu sliku bez fba
        if(a.firstPointX - x > 100)
        {
            var r = setTimeout(a.startApp, 100);
            return;
        }

        //crtanje linije sa strane kao OK
        if((a.firstPointY - y) >= 400 && (a.firstPointX - x) >= 400 && (a.firstPointX - x) >= 400) //(document.body.offsetHeight * 0.75))
        {
            console.log("Zovem OK()")
            mm.OK();
            mm.waitForVideoSelection = false;
        }    
        else
        {
/*          nije jasno što bi ovo trebalo raditi  
            if(mm.waitForVideoSelection)
            {
                mm.waitForVideoSelection = false;
                return;
            }*/            

            //console.log("Zovem NOK()")
            //mm.NOK();
            a.startApp();
            return;
        }
    }
    else
    {   //serialMode
        a.beginDrawing = false;
        if(a.firstPointX - x > 100)
        {
            a.counter = a.counter + 1;
            a.startApp();
            return;
        }
        if(x - a.firstPointX > 100)
        {
            a.counter = a.counter - 1;
            if(a.counter < 1)
                a.counter = 1;
    
            a.startApp();
            return;
        }
        
        if((a.firstPointY - y) >= 400 && (a.firstPointX - x) >= 400) //(document.body.offsetHeight * 0.75))
        {
            if(mm.waitForVideoSelection)
            {
                mm.waitForVideoSelection = false;
            }            
            else
            {
                //next test
            }
    
            if(a.retriesNum >= a.retriesBeforeReward)
            {
                console.log("Zovem OK()");
                a.retriesNum = 0;
                mm.OK();
                mm.waitForVideoSelection = false;
            }
        }    
        else
        {
            if(mm.waitForVideoSelection)
            {
                mm.waitForVideoSelection = false;
                return;
            }            
    
    /*      if(a.retriesNum >= a.retriesBeforeReward)
            {
                console.log("Zovem NOK()");
                a.retriesNum = 0;
                mm.NOK();
            }*/
    
            a.counter = a.counter + 1;
            a.startApp();
            return;
        }
    
        a.retriesNum = a.retriesNum + 1;
        a.startApp();
    }
}

function IMoveEvent(x: number, y: number) 
{
    //čekaj da smiješ dirati po ekranu
    if(a.modPODD)
    {
        console.log("touchTimeout još nije prošao!")
        return;
    }

    if(a.testMode)
    {
        a.ctx.beginPath();
        if (a.beginDrawing) {
            a.ctx.strokeStyle = "black";
            a.ctx.lineWidth = a.canvas.width * 0.005;
            a.ctx.beginPath();
            a.ctx.moveTo(a.lastPointX, a.lastPointY);
            a.ctx.lineTo(x, y);
            a.ctx.stroke();
            a.lastPointX = x;
            a.lastPointY = y;
        }
    } else {
        if (a.beginDrawing) {
            a.lastPointX = x;
            a.lastPointY = y;
        }
    }
}

function ITouch_move_gesture(e) {

    //e.preventDefault();
    //e.stopPropagation();

    if (e.touches.length === 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }

    this.IMoveEvent(touch.pageX, touch.pageY)
}

function IMouse_move(e) {

    //e.preventDefault();
    //e.stopPropagation();

    this.IMoveEvent(e.clientX, e.clientY);
}

//odgovor je došao putem tastature
function IKey_press(e)
{
    switch (e.key) {
        case "N":
        case "n":
            localStorage.setItem("Testiranje", a.counter.toString());
            mm.NOK();
            break;
        case "o":
        case "O":
            iOK();
            break;
        case "d":
        case "D":
            a.startApp();
            break;
        case "x":
        case "X":
            //bezuvjetno napusti stranicu
            leavePage = true;
            OpenIndexPage();
            break;        
        default:
            break;
    }
}

function iOK()
{
    a.counter = a.counter + 1;
    if(a.serialMode)
        localStorage.setItem("Testiranje", a.counter.toString());
    else
        localStorage.setItem("Testiranje", "");

    mm.OK();
}

//čekaj X sekundi prije nego reagira ekran
//ovo se koristi kod igara koje imaju PODD slike sa 
//strane i moraju se moći dirati 
function TouchTimeout()
{
    a.modPODD = false;
    clearTimeout(a.touchTimeoutTimer);
}

function ButtonOClicked()
{
    mm.lastTextToRead = "";
    SpeakText(a.textToRead);
}

/*
function IStart() {
    a.startApp();
}*/

window.onload = () => {

    a = new IApp();

    window.addEventListener('mousemove', IMouse_move, false);
    window.addEventListener('mousedown', IMouse_down, false);
    window.addEventListener('mouseup', IMouse_up, false);
    window.addEventListener('touchend', ITouch_end_gesture, false);
    window.addEventListener('touchstart', ITouch_start_gesture, false);
    window.addEventListener('touchmove', ITouch_move_gesture, false);
    window.addEventListener('keypress', IKey_press, false);
    mm = new MM(a);
    //true - ne čekaj korisnički dodir ekrana 
    Start();
};