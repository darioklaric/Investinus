//@ts-check
/// <reference path="mm.ts" />
//let a: App;
//let mm: MM;
var TimeoutHideCards = 2000;
var TimerHideCards = false;
var TimeoutIntro;
var ImgTotal;
var ShowIntroduction;
var App = /** @class */ (function () {
    //eye tracking
    //https://trackingjs.com/
    //https://webgazer.cs.brown.edu/
    function App() {
        this.ctxWidth = 0;
        this.ctxHeight = 0;
        // an array of objects that define different rectangles
        this.cards = [];
        this.textPlayed = false;
        this.imgReady = false;
        this.correctGroups = [];
        this.groupImages = [];
        this.audioTitles = [];
        this.answers = [];
        this.imageBox = []; //will be filled in with image names -> XX.jpg
        this.imageBoxGroup = []; //every image belong to a group
        this.imageBoxDescription = []; //every image has its own description 
        this.showAnswerUp = false;
        this.topmostImage = [];
        this.descriptions = [];
        this.groupText = [];
        this.font = "Arial";
        this.dirs = "";
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.appStarted = false;
        //full size will create scroll bars
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight * 0.99;
        this.ctxWidth = this.canvas.width;
        this.ctxHeight = this.canvas.height;
        this.allowedCardsDown = 10;
        this.allowedCardsUp = this.allowedCardsDown - 1;
        this.startCardsUp = 1;
        this.startCardsDown = 5;
        this.cardsUp = 0;
        this.cardsDown = 0;
        this.startX = 0;
        this.startY = 0;
        this.audioForCard = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        // load HTML variables
        ImgTotal = Number(GetElements("TotalImages"));
        if (!ImgTotal)
            ImgTotal = 2;
        this.groups = Number(GetElements("Groups"));
        if (!this.groups)
            this.groups = 2;
        this.cardsUp = Number(GetElements("GroupsUp"));
        if (!this.cardsUp)
            this.cardsUp = this.startCardsUp;
        else
            this.startCardsUp = this.cardsUp;
        this.cardsDown = Number(GetElements("CardsDown"));
        if (!this.cardsDown)
            this.cardsDown = this.startCardsDown;
        else
            this.startCardsDown = this.cardsDown;
        this.correctCardsDown = Number(GetElements("CorrectAnswersDown"));
        if (!this.correctCardsDown)
            this.correctCardsDown = 1;
        this.writeDescriptions = Boolean(GetElements("ShowDescriptions"));
        if (!this.writeDescriptions)
            this.writeDescriptions = false;
        ShowIntroduction = Boolean(GetElements("ShowIntroduction"));
        if (!ShowIntroduction)
            ShowIntroduction = true;
        //since correct groups can be more than one load them into array
        var corGroups = GetElements("CorrectGroups");
        this.correctGroups = corGroups.split(";");
        if (undefined == corGroups)
            this.correctGroups.push("");
        var imgGroups = GetElements("GroupImages");
        this.groupImages = imgGroups.split(";");
        var rews;
        rews = GetElements("Answers");
        if (rews !== undefined) {
            this.answers = rews.split(";");
        }
        if (this.answers[0] == "")
            this.answers.pop();
        this.font = GetElements("Font");
        if (!this.font)
            this.font = "Arial";
        rews = GetElements("Dirs");
        if (rews) {
            rews = rews.split(";");
            this.dirs = rews[0];
        }
        //TODO zasto ovdje koristimo byid a svagdje dalje getElements???
        this.audioTitles = document.getElementById("AudioTitles").textContent.split(";");
        this.timeoutHideCardsUpDown = Number(GetElements("ConceptTimeout")) * 1000;
        if (!this.timeoutHideCardsUpDown)
            this.timeoutHideCardsUpDown = 0;
        this.showAnswerUp = Boolean(GetElements("ShowAnswerUp"));
        if (!this.showAnswerUp)
            this.showAnswerUp = false;
        var tpImg = GetElements("TopmostImage");
        if (!tpImg)
            this.topmostImage = tpImg.split(";");
        var xModeConcept = String(GetElements("ConceptualGame")).toUpperCase();
        switch (xModeConcept) {
            case "BACKWARDS":
                this.conceptualGame = ConceptualizationModes.Backwards;
                break;
            case "RANDOM":
                this.conceptualGame = ConceptualizationModes.Random;
                break;
            case "NORMAL":
                this.conceptualGame = ConceptualizationModes.Normal;
                break;
            case "NONE":
            default:
                this.conceptualGame = ConceptualizationModes.None;
                break;
        }
        xModeConcept = String(GetElements("WriteTextShowImage")).toUpperCase();
        switch (xModeConcept) {
            case "BOTH":
                this.showImageWriteText = writeTextShowImage.Both;
                break;
            case "IMAGE":
                this.showImageWriteText = writeTextShowImage.Image;
                break;
            case "TEXT":
                this.showImageWriteText = writeTextShowImage.Text;
                break;
            case "NONE":
            default:
                this.showImageWriteText = writeTextShowImage.Both;
                break;
        }
        xModeConcept = String(GetElements("ConceptualAudioGame")).toUpperCase();
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
            case "NONE":
            default:
                this.gameAVMode = gameAudioVideoModes.None;
                break;
        }
        this.descriptions = document.getElementById("Titles").textContent.split(";");
        while (this.descriptions[0] == "") {
            this.descriptions.pop();
        }
        if (0 != this.descriptions.length && 0 == this.answers.length)
            this.answers = this.descriptions;
        var imgInEachGroup = Math.ceil(ImgTotal / this.groups);
        for (var g = 1; g <= this.groups; g++) {
            for (var i = 1; i <= imgInEachGroup; i++) {
                //assign image name
                this.imageBox.push(g + "-" + i);
                //assign group number to image 
                this.imageBoxGroup.push(g);
                //assign description
                if (this.writeDescriptions) {
                    var d = GetElements("DescriptionCard" + (g + "-" + i).toString());
                    if (undefined != d)
                        this.imageBoxDescription.push(d);
                    else
                        this.imageBoxDescription.push("");
                }
            }
        }
    }
    App.prototype.startApp = function () {
        //nije testirano mijenjani kada je Start() prebačen u mm.ts
        //    if (ShowIntroduction)
        //        Introduction();
        this.totalAnswers = 0;
        //najmjerodavnija je vrijednost iz localstoragea ako je ima
        //vrijedi samo za koncept igre
        if (ConceptualizationModes.None < this.conceptualGame) {
            var d = GetDocURI();
            var name = "CardsUp_" + d;
            var lsItem = parseInt(localStorage.getItem(name));
            if (lsItem > 0 && lsItem > this.cardsUp) {
                this.cardsUp = lsItem;
                //this.cardsDown = this.cardsUp + 1; 
                this.cardsDown = this.startCardsDown + 1;
            }
        }
        var corGroups = GetElements("CorrectGroups");
        //since correctGroups is used in more than one way we need to reload original value
        //when it's not defined in original value, it's overwritten in order to show right answers, that creates a problem
        //with reloading the same value after restarting a game   
        if ("" == corGroups) {
            this.correctGroups.splice(0);
            this.correctGroups.push("");
        }
        this.ClearCanvas("StartApp");
        // drag related variables
        this.dragOK = false;
        this.startX = 0;
        this.startY = 0;
        this.movingCardIndex = -1;
        this.guessedCards = 0;
        this.textPlayed = false;
        this.audioForCard = 0;
        //this.numberOfFalseAnswers = 0;
        this.groupText.splice(0);
        if (mm != undefined && this.conceptualGame > ConceptualizationModes.None)
            mm.numberOfCorrectAnswers = 0;
        //remove all cards
        this.cards.splice(0);
        //initialize the cards
        this.PrepareCards();
        // call to draw the scene
        //console.log("drawCards startApp")
        this.drawCards();
        //timeoutHideCardsUpDown can hide cards no matter if game is conceptual or not
        if (this.timeoutHideCardsUpDown > 0) {
            TimerHideCards = true;
            if (this.gameAVMode == gameAudioVideoModes.Visual) {
                setTimeout(HideVisualConcepts, this.timeoutHideCardsUpDown);
                //console.log("timeout stratApp " + "this.timeoutHideCardsUpDown" + this.timeoutHideCardsUpDown);
                UnhideCardsAndPlayAudioTitles();
            }
            else if (ConceptualizationModes.None == this.conceptualGame) {
                setTimeout(HideVisualConcepts, this.timeoutHideCardsUpDown * this.cardsUp);
                //console.log("timeout stratApp " + "this.timeoutHideCardsUpDown * this.cardsUp * 1000" + (this.timeoutHideCardsUpDown * this.cardsUp));
                UnhideCardsAndPlayAudioTitles();
            }
        }
    };
    App.prototype.PrepareCards = function () {
        /*        if(undefined !== this.topmostImage[0])
                {
                    //without topmost image            */
        this.cardWidth = this.ctxWidth / (this.cardsDown + 1);
        if (this.cardWidth > 0.3 * this.ctxHeight)
            this.cardWidth = Math.floor(this.ctxHeight * 0.3);
        /*        }
                else
                {
                    //for topmost image we need
                }*/
        this.gutterWidth = (this.ctxWidth - this.cardWidth * this.cardsDown) / (this.cardsDown + 1);
        this.upGutterWidth = (this.ctxWidth - this.cardWidth * this.cardsUp) / (this.cardsUp + 1);
        //conceptualization game has differnet rules in defining card sets
        if (ConceptualizationModes.None < this.conceptualGame) {
            this.correctCardsDown = 1;
            this.PrepareCardsUpConceptualization();
            this.PrepareCardsDown();
        }
        else if (ImgTotal < this.groups) {
            this.PrepareCardsUpForGroups();
            this.PrepareCardsDownForGroups();
        }
        else {
            this.PrepareCardsUp();
            this.PrepareCardsDown();
        }
    };
    App.prototype.PrepareCardsUpConceptualization = function () {
        var existing = [];
        for (var i = 0; i < this.cardsUp; i++) {
            var g = -1;
            //ne smije biti dva jednaka gore
            do {
                g = Math.floor(Math.random() * (this.imageBox.length));
            } while (-1 < existing.indexOf(g));
            existing.push(g);
            this.correctGroups[i] = this.imageBox[g].substring(0, this.imageBox[g].indexOf("-"));
            this.cards.push({
                id: i,
                pos: i,
                x: this.cardWidth * i + this.upGutterWidth * i + this.upGutterWidth,
                y: this.ctxHeight / 2 - this.cardWidth,
                width: this.cardWidth,
                height: this.cardWidth,
                description: "",
                image: this.dirs + this.imageBox[g] + ".jpg",
                audio: this.audioTitles[g],
                isDragging: false,
                isHidden: true,
                text: this.audioTitles[g],
                //isHidden: this.gameAVMode < gameAudioVideoModes.Audio,
                isDragable: false,
                group: this.correctGroups[i]
            });
        }
        UnhideCardsAndPlayAudioTitles();
    };
    App.prototype.PrepareCardsUp = function () {
        var rowFactor = 0;
        if (this.descriptions.length !== ImgTotal)
            console.log("Krivi broj opisa!");
        if (0 == this.topmostImage.length) {
            //we'll have two rows only, so divide card height by 3
            rowFactor = 3;
        }
        else {
            //we'll have three rows, draw cards up lower
            rowFactor = 1;
        }
        for (var i = 0; i < this.cardsUp; i++) {
            var g = void 0;
            var place = void 0;
            //if there is more correct groups than spaces above we need to randomize question
            if (this.correctGroups.length > this.cardsUp) {
                //not tested for cases when more than one card is up
                //g = Math.floor(Math.random() * (this.correctGroups.length));
                g = this.FindNew(this.correctGroups.length);
                place = g.toString();
            }
            //when correct groups are not defined anything can be correct
            //save that for cards down
            else if ("" == this.correctGroups[i] || undefined == this.correctGroups[i]) {
                //g = Math.floor(Math.random() * (this.groups));
                g = this.FindNew(this.groups);
                //test only last half for bigger groups
                /*if (this.groups > 100 && g <= this.groups / 2) {
                    g = Math.floor(g + this.groups / 2);
                }*/
                //this.correctGroups[i] = (g + 1).toString();
                //place = (g + 1).toString();
                this.correctGroups[i] = (g).toString();
                place = (g).toString();
                g = i;
            }
            else {
                g = i;
            }
            //ne spremaj pogođene odgovore za slučajeve kada ima
            //više od jedne karate gore
            if (this.cardsUp > 1)
                place = "";
            if (undefined === this.groupImages[this.correctGroups[g] - 1]) {
                console.log("Correct groups undefeined in PrepareCardsUp()!");
                //this.correctGroups[0] = "1";
                //g = g + 1;
                //this.correctGroups[i] = (g).toString();
                //place = (g).toString();
            }
            var tDescriptions = "";
            if (this.descriptions[this.correctGroups[g] - 1] && 0 <= this.descriptions[this.correctGroups[g] - 1].indexOf("^"))
                tDescriptions = this.descriptions[this.correctGroups[g] - 1];
            else if (this.groupImages.length <= 1)
                tDescriptions = this.descriptions[this.correctGroups[g] - 1];
            //            else
            //                tDescriptions = this.descriptions[this.correctGroups[0]];
            this.cards.push({
                id: i,
                pos: i,
                x: this.cardWidth * i + this.upGutterWidth * i + this.upGutterWidth,
                y: this.cardWidth / rowFactor,
                width: this.cardWidth,
                height: this.cardWidth,
                description: tDescriptions,
                image: this.dirs + this.groupImages[this.correctGroups[g] - 1],
                audio: this.audioTitles[this.correctGroups[g] - 1],
                isDragging: false,
                isHidden: false,
                isDragable: false,
                group: this.correctGroups[g],
                text: "",
                place: place
            });
        }
        //UnhideCardsAndPlayAudioTitles();
    };
    App.prototype.FindNew = function (n) {
        var newItem;
        var name = "OK_" + GetDocURI(); // document['documentURI'];
        var lsItem = localStorage.getItem(name);
        var index = -1;
        if (null == lsItem)
            lsItem = "";
        var itemsAnswered = (lsItem.match(/;/g) || []).length;
        if (n * 0.8 <= itemsAnswered && n > 50) {
            //upozori da se bliži kraj
            alert("Dostignuto je 80% točnih odgovora!");
        }
        if (n - 1 <= itemsAnswered) {
            //počni od početka i obriši sve
            console.log("Brišem točne odgovore!");
            localStorage.setItem(name, "");
        }
        do {
            newItem = Math.floor(Math.random() * n);
            index = lsItem.indexOf(";" + newItem + ";");
        } while (index >= 0);
        return newItem;
    };
    App.prototype.PrepareCardsUpForGroups = function () {
        //let descriptions = [];
        //descriptions = document.getElementById("Titles").textContent.split(";");
        var des;
        var img;
        var aud;
        var txt;
        var grp;
        for (var i = 0; i < this.cardsUp; i++) {
            var g = void 0;
            var j = void 0;
            var place = "";
            //let t: number;
            var x = this.descriptions[0].indexOf("@");
            if (0 > x) // this.descriptions[0].indexOf("@")) 
             {
                //ako nema @ stari kod za slike
                /*                g = Math.floor(Math.random() * ImgTotal);
                                this.correctGroups[i] = (g + 1).toString();
                                t = Math.floor(Math.random() * this.groups / ImgTotal) * this.groups / (this.groups / ImgTotal);
                                j = g + t;
                                g = i;*/
                //prebaci kod tako da se može provjeravati da li je na listi dobro riješenih
                j = this.FindNew(this.groups);
                this.correctGroups[i] = ((j % ImgTotal) + 1).toString();
                //this.correctGroups[i] = ((j % ImgTotal)).toString();
                des = this.descriptions[j];
                img = this.groupImages[j];
                aud = this.audioTitles[j];
                txt = ""; // j.toString();
                grp = this.correctGroups[i];
                place = j.toString();
            }
            else {
                //ako ima @ novi kod za tekst
                if (0 == this.groupText.length) {
                    //var pos = Math.floor(Math.random()* this.descriptions.length);
                    var d = "greška";
                    var pos = this.FindNew(this.descriptions.length);
                    if (pos == undefined || this.descriptions[pos] == undefined)
                        console.log("PrepareCardsUpFroGroups error, position undefined!");
                    else
                        d = this.descriptions[pos].replace("@", "");
                    d = this.CleanString(d);
                    this.groupText = d.split(" ");
                }
                //slaganje riječi i rečenica
                des = this.groupText[i];
                img = des;
                aud = "";
                txt = "";
                grp = des;
                place = pos;
            }
            this.cards.push({
                id: i,
                pos: i,
                x: this.cardWidth * i + this.upGutterWidth * i + this.upGutterWidth,
                y: this.cardWidth / 3,
                width: this.cardWidth,
                height: this.cardWidth,
                description: des,
                image: img,
                audio: aud,
                isDragging: false,
                isHidden: false,
                isDragable: false,
                group: grp,
                text: txt,
                place: place
            });
        }
        //UnhideCardsAndPlayAudioTitles();
    };
    App.prototype.PrepareCardsDownForGroups = function () {
        //in order not to have too big cards for smaller number of cards down
        var yPos = this.gutterWidth;
        if (this.writeDescriptions)
            yPos = 2 * this.gutterWidth;
        if (yPos > this.cardWidth / 4)
            yPos = this.cardWidth / 4;
        var xPos = 0;
        var txt = "";
        var pos = 0;
        var img = "";
        var grp = "";
        for (var i = 0; i < ImgTotal; i++) {
            xPos = i;
            if (0 < this.groupText.length) {
                //slova i riječi
                pos = Math.floor(Math.random() * this.groupText.length);
                txt = this.groupText[pos];
                if (0 <= txt.indexOf("{")) {
                    txt = txt.replace("{", "");
                }
                img = txt;
                grp = txt;
                this.groupText.splice(pos, 1);
            }
            else {
                //slike
                txt = "";
                img = this.dirs + this.imageBox[i] + ".jpg";
                grp = this.imageBoxGroup[i];
            }
            this.cards.push({
                id: this.cards.length,
                pos: xPos,
                x: this.cardWidth * xPos + this.gutterWidth * xPos + this.gutterWidth,
                y: this.ctxHeight - this.cardWidth - yPos,
                width: this.cardWidth,
                height: this.cardWidth,
                description: this.imageBoxDescription[i],
                group: grp,
                image: img,
                isDragging: false,
                //cards are hidden in the begginin of conceptual game otherwise open 
                isHidden: this.timeoutHideCardsUpDown > 0,
                isDragable: true,
                text: txt
            });
        }
    };
    App.prototype.PrepareCardsDown = function () {
        //this is a simple trick to get random non repeatable positions
        var xPositions = [];
        for (var i = 0; i < this.cardsDown; i++)
            xPositions[i] = i;
        //in order not to have too big cards for smaller number of cards down
        var yPos = this.gutterWidth;
        if (this.writeDescriptions)
            yPos = 2 * this.gutterWidth;
        if (yPos > this.cardWidth / 4)
            yPos = this.cardWidth / 4;
        var position;
        var rightPosition;
        //insert correct answers first
        //let ca = Math.ceil(this.correctCardsDown / this.correctGroups.length);
        for (var g = 0; g < this.correctGroups.length; g++) {
            for (var nCard = 0; nCard < this.correctCardsDown; nCard++) {
                //image position aka name, group, description
                //include from groups that we are looking for
                var xF = this.imageBox.length / this.groups;
                var xG = (this.correctGroups[g] - 1) * (this.imageBox.length / this.groups);
                if (0 > xG)
                    xG = 0;
                position = Math.floor(Math.random() * xF) + xG;
                //put it on a random non repetable position
                var rnd = Math.floor(Math.random() * xPositions.length);
                var xPosA = xPositions.splice(rnd, 1);
                var xPos = xPosA[0];
                if (undefined === this.imageBox[position])
                    console.log("Undefined!");
                //var cardText = this.audioTitles[position];
                var cardText = "";
                if (0 == this.answers.length) {
                    //???
                    if (undefined !== this.audioTitles[position] && 0 > this.audioTitles[position].indexOf(".mp3")) {
                        cardText = this.audioTitles[position];
                    }
                    else {
                        if (undefined == a.cards[a.audioForCard].audio) {
                            //return;
                            cardText = this.audioTitles[position];
                        }
                        else {
                            //nije testirano do kraja ovdje i dole mozda ovo pravi problem sa ispisom teksta za karte
                            if (undefined !== this.audioTitles[position])
                                cardText = this.audioTitles[position].substring(0, this.audioTitles[position].indexOf(".mp3"));
                            else
                                cardText = "";
                            //cardText = position;
                            //cardText = 
                        }
                    }
                }
                else {
                    if (this.answers == undefined || undefined == this.answers[position]) {
                        console.log("PrepareCardsDown - Undefined answers or wrong position! " + position);
                        if (position >= this.answers.length)
                            position = this.answers.length - 1;
                        if (!this.answers[position])
                            this.PrepareCards();
                    }
                    if (0 > this.answers[position].indexOf("$")) {
                        cardText = this.CleanString(this.answers[position]);
                    }
                    else {
                        var correctAnswers = this.answers[position].split("$");
                        if (0 > correctAnswers[0].indexOf("^")) {
                            cardText = this.CleanString(correctAnswers[0]);
                        }
                        else {
                            var xText = correctAnswers[0].split("^");
                            cardText = this.CleanString(xText[2]);
                            //visestruki točni odgovori
                            if (0 <= cardText.indexOf("|")) {
                                var aText = cardText.split("|");
                                var aPos = Math.floor(Math.random() * aText.length);
                                cardText = this.CleanString(aText[aPos]);
                            }
                        }
                        rightPosition = position;
                    }
                }
                var correctImageName = this.imageBox[position];
                this.cards.push({
                    id: this.cards.length,
                    pos: xPos,
                    x: this.cardWidth * xPos + this.gutterWidth * xPos + this.gutterWidth,
                    y: this.ctxHeight - this.cardWidth - yPos,
                    width: this.cardWidth,
                    height: this.cardWidth,
                    description: this.imageBoxDescription[position],
                    group: this.imageBoxGroup[position],
                    image: this.dirs + this.imageBox[position] + ".jpg",
                    isDragging: false,
                    //cards are hidden in the begginin of conceptual game otherwise open 
                    isHidden: this.timeoutHideCardsUpDown > 0,
                    isDragable: true,
                    text: cardText
                });
            }
        }
        var copyToRestCards = false;
        //special case where we don't select specific group, lake in games emotions, geometrical bodies
        if (this.groups >= this.correctGroups.length) {
            //initialize rest cards with all cards
            copyToRestCards = true;
        }
        var restCards = [];
        //generate array out of other posible answers, since it's not linear (can't calculate them) it's not easy to extract them
        for (i = 0; i + 1 <= ImgTotal; i++) {
            var num = 0;
            //insert incorect other answers
            g = this.imageBoxGroup[i];
            num = this.correctGroups.indexOf(g.toString());
            if (num < 0 && copyToRestCards) {
                restCards.push(i);
            }
        }
        var incorrectAnswers;
        var imageName;
        //nCard runs where it stayed in upper for loop
        for (var gCard = this.cards.length - this.cardsUp; gCard < this.cardsDown; gCard++) {
            rnd = Math.floor(Math.random() * xPositions.length);
            xPosA = xPositions.splice(rnd, 1);
            xPos = xPosA[0];
            rnd = Math.floor(Math.random() * restCards.length);
            xPosA = restCards.splice(rnd, 1);
            position = xPosA[0];
            //in case all answers are correct
            if (undefined == position)
                position = Math.floor(Math.random() * this.cardsUp);
            //quick fix for small sets
            if (0 == restCards.length)
                restCards.push(position);
            imageName = this.dirs + this.imageBox[position] + ".jpg";
            if (0 == this.answers.length) {
                if (undefined !== this.audioTitles[position] && 0 > this.audioTitles[position].indexOf(".mp3")) {
                    cardText = this.audioTitles[position];
                }
                else {
                    //nije testirano do kraja ovdje i gore mozda ovo pravi problem sa ispisom teksta za karte
                    if (undefined == this.audioTitles[position])
                        //return;
                        cardText = this.audioTitles[position];
                    else
                        cardText = this.audioTitles[position].substring(0, this.audioTitles[position].indexOf(".mp3"));
                    //cardText = this.audioTitles[position];
                }
            }
            else {
                if (!this.answers[position]) {
                    console.log("Undefined answers position! PrepareCardsDown!");
                    return;
                }
                if (0 > this.answers[position].indexOf("$")) {
                    cardText = this.CleanString(this.answers[position]);
                    ///???
                    if (0 >= cardText.indexOf("%N"))
                        cardText = cardText.replace("%N", "%n");
                }
                else if (0 <= this.answers[position].indexOf("^.jpg$2$3$4")) {
                    //slike su pozitivni i negativni odgovori dole
                    if (!incorrectAnswers) {
                        incorrectAnswers = this.answers[rightPosition].split("$");
                        incorrectAnswers.shift();
                    }
                    var place = Math.floor(Math.random() * incorrectAnswers.length);
                    cardText = this.CleanString(incorrectAnswers[place]);
                    incorrectAnswers.splice(place, 1);
                    imageName = correctImageName.substring(0, correctImageName.indexOf("-")) + "-" + cardText + ".jpg";
                }
                else {
                    if (!incorrectAnswers) {
                        incorrectAnswers = this.answers[rightPosition].split("$");
                        incorrectAnswers.shift();
                    }
                    var place = Math.floor(Math.random() * incorrectAnswers.length);
                    cardText = this.CleanString(incorrectAnswers[place]);
                    incorrectAnswers.splice(place, 1);
                }
            }
            this.cards.push({
                id: this.cards.length,
                pos: xPos,
                x: this.cardWidth * xPos + this.gutterWidth * xPos + this.gutterWidth,
                y: this.ctxHeight - this.cardWidth - yPos,
                width: this.cardWidth,
                height: this.cardWidth,
                description: this.imageBoxDescription[position],
                group: this.imageBoxGroup[position],
                image: imageName,
                isDragging: false,
                isHidden: this.timeoutHideCardsUpDown > 0,
                isDragable: true,
                text: cardText
            });
        }
    };
    App.prototype.CleanString = function (str) {
        if (undefined == str || null == str)
            return "";
        str = str.replace(/[\r\n] +/gm, "");
        str = str.replace("\n", "");
        return str;
    };
    App.prototype.ClearCanvas = function (txt) {
        //console.debug("ClearCanvas " + txt);
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
    };
    /*    ReadText(str, rate) {
    
            if(0 == this.lastText.indexOf(str))
            {
                return;
            }
            this.lastText = str;
    
            const synUtterance = new window['SpeechSynthesisUtterance']();
            let voiceSelect = "Microsoft Matej - Croatian (Croatia)";	//<br/>
            synUtterance.voice = window['speechSynthesis']
                .getVoices()
                .filter(function (voice) {
                    return voice.name === voiceSelect;
                })[0];
            synUtterance.lang = "hr-hr";
            synUtterance.volume = 1;
            synUtterance.rate = rate;
            //synUtterance.pitch = 0.5;
            //if(this.textPlayed == false)
            if (str !== undefined) {
                //this.textPlayed = true;
                synUtterance.text = str;
                window['speechSynthesis'].speak(synUtterance);
            }
        }*/
    // redraw the scene
    App.prototype.drawCards = function () {
        var _this = this;
        this.ClearCanvas("drawCards");
        var heightFactor = 0.5;
        //topmost image je slika na vrhu prema kojoj se slazu slike ispod
        if (0 !== this.topmostImage.length) {
            if (1 == this.topmostImage.length) {
                var imageObj_1 = new Image();
                imageObj_1.onload = function () {
                    _this.ctx.drawImage(imageObj_1, _this.ctxWidth / 2 - ((_this.cardWidth * _this.cardsDown) / 2), 0, _this.cardWidth * _this.cardsDown, _this.cardWidth * 0.9);
                };
                imageObj_1.src = this.topmostImage[0];
                this.ctx.drawImage(imageObj_1, this.ctxWidth / 2 - ((this.cardWidth * this.cardsDown) / 2), 0, this.cardWidth * this.cardsDown, this.cardWidth * 0.9);
            }
            else {
                var _loop_1 = function (i) {
                    var imageObj = new Image();
                    imageObj.onload = function () {
                        _this.ctx.drawImage(imageObj, _this.cards[i].x, 0, _this.cardWidth, _this.cardWidth * 0.9);
                    };
                    imageObj.src = this_1.topmostImage[this_1.cards[i].group - 1];
                    this_1.ctx.drawImage(imageObj, this_1.cards[i].x, 0, this_1.cardWidth, this_1.cardWidth * 0.9);
                };
                var this_1 = this;
                for (var i = 0; i < this.cardsUp; i++) {
                    _loop_1(i);
                }
            }
        }
        //description je text oko-ispod gornje slike
        if (undefined !== this.cards[0].description && "" !== this.cards[0].description) {
            this.ctx.font = "bold " + this.cardWidth * heightFactor * 0.7 + "px " + this.font;
            this.ctx.fillStyle = 'red';
            this.ctx.lineWidth = this.cardWidth * 0.01;
            if (0 <= this.cards[0].description.indexOf("#")) {
                //special case where we write on both sides by injecting spaces into string
                var s = this.cards[0].description;
                s = s.replace("#", "              ");
                var widthTitle = this.ctx.measureText(s).width;
                this.ctx.fillText(s, (this.ctxWidth - widthTitle) / 2, this.ctxHeight / 3);
            }
            else if (0 <= this.cards[0].description.indexOf("{")) {
                //ne piši tekst koji sadrži ovaj znak u gornji red
                var t = this.cards[0].description.replace("{", "");
                this.cards[0].description = "";
                this.cards[0].img = t;
                //this.cards[0].text = t;
                this.cards[0].group = t;
            }
            else if (0 <= this.cards[0].description.indexOf("^")) {
                var s = this.cards[0].description.split("^");
                var s0 = s[0];
                var s1 = s[1];
                s1 = s1.replace("|", "              ");
                if (0 <= s0.indexOf("%N") || 0 <= s0.indexOf("%n")) {
                    var na = GetElements("Names");
                    var names = na.split(";");
                    var m = Math.floor(Math.random() * (names.length - 1));
                    var name_1 = names[m];
                    if (0 <= s0.indexOf("%N"))
                        s0 = s[0].replace("%N", name_1[0].toUpperCase() + name_1.substring(1));
                    if (0 <= s0.indexOf("%n"))
                        s0 = s[0].replace("%n", name_1);
                    if (0 <= s1.indexOf("%N"))
                        s1 = s[1].replace("%N", name_1);
                    if (0 <= s1.indexOf("%n"))
                        s1 = s[1].replace("%n", name_1);
                    //kako se ne bi vise puta ispisivao razlicit tekst kod redraw
                    //console.log(s0 + " " + s1);
                    this.cards[0].description = s0 + "^" + s1;
                    //console.log(this.cards[0].description = s0 + "^" + s1);
                    //console.log("Cards:" + this.cards.length)
                    //zamjeni odgovor u tko pitanjima u kartama dole
                    for (var ixy = 0; ixy < this.cards.length; ixy = ixy + 1) {
                        //console.log(ixy + ": " + this.cards[ixy].text);
                        //tocni odgovor
                        if (0 <= this.cards[ixy].text.indexOf("%N")) {
                            //console.log("Tocno:" + names[m] + " " + name + " " + s0);
                            this.cards[ixy].text = this.cards[ixy].text.replace("%N", name_1[0].toUpperCase() + name_1.substring(1));
                        }
                        //netocni odgovori traze nova imena
                        if (0 <= this.cards[ixy].text.indexOf("%n")) {
                            //izaberi drugo ime
                            m = m + 1;
                            if (m >= names.length)
                                m = 0;
                            var n2 = names[m];
                            //console.log("Netocno:" + n2);
                            this.cards[ixy].text = this.cards[ixy].text.replace("%n", n2[0].toUpperCase() + n2.substring(1));
                        }
                    }
                }
                if (this.gameAVMode < gameAudioVideoModes.Audio || this.gameAVMode == gameAudioVideoModes.AudioVisual) {
                    var widthTitle = this.ctx.measureText(s0).width;
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillText(s0, (this.ctxWidth - widthTitle) / 2, this.ctxHeight / 3);
                    this.ctx.fillStyle = 'red';
                    widthTitle = this.ctx.measureText(s[1]).width;
                    this.ctx.fillText(s1, (this.ctxWidth - widthTitle) / 2, this.ctxHeight / 2);
                }
                if (this.gameAVMode == gameAudioVideoModes.Audio || this.gameAVMode == gameAudioVideoModes.AudioVisual) {
                    var sZ = s0 + "!" + s1;
                    sZ = sZ.replace("+", "!plus!");
                    sZ = sZ.replace("-", "!minus!");
                    sZ = sZ.replace("=", "!jednako!");
                    SpeakText(sZ);
                    //window['speechSynthesis'].speak(new window['SpeechSynthesisUtterance'](s[0] + s[1]));
                    //const voices = speechSynthesis.getVoices();
                    /*                    const synUtterance = new window['SpeechSynthesisUtterance']();
                                        let voiceSelect = "Microsoft Matej - Croatian (Croatia)";	//<br/>
                                        synUtterance.voice = window['speechSynthesis']
                                            .getVoices()
                                            .filter(function (voice) {
                                                return voice.name === voiceSelect;
                                            })[0];
                                        synUtterance.lang = "hr-hr";
                                        synUtterance.volume = 1;
                                        synUtterance.rate = 1;
                                        synUtterance.pitch = 1;
                                        if (this.textPlayed == false) {
                                            this.textPlayed = true;
                                            synUtterance.text = s0;
                                            window['speechSynthesis'].speak(synUtterance);
                                            synUtterance.text = s1;
                                            window['speechSynthesis'].speak(synUtterance);
                                        }*/
                    /*                const eventList = ['start', 'end', 'mark', 'pause', 'resume', 'error', 'boundary'];
                                    eventList.forEach((event) => {
                                        synUtterance.addEventListener(event, (speechSynthesisEvent) => {
                                            log(`Fired '${speechSynthesisEvent.type}' event at time '${speechSynthesisEvent.elapsedTime}' and character '${speechSynthesisEvent.charIndex}'.`);
                                        });
                                    });*/
                }
            }
            else {
                if (this.gameAVMode < gameAudioVideoModes.Audio) {
                    //write text on one side, only
                    var widthTitle = this.ctx.measureText(this.cards[0].description).width;
                    this.ctx.fillText(this.cards[0].description, (this.ctxWidth - widthTitle) / 2, this.ctxHeight / 2 + this.cardWidth * heightFactor / 2);
                }
                else {
                    SpeakText(this.cards[0].description);
                    if (this.gameAVMode == gameAudioVideoModes.AudioVisual) {
                        var widthTitle = this.ctx.measureText(this.cards[0].description).width;
                        this.ctx.fillText(this.cards[0].description, (this.ctxWidth - widthTitle) / 2, this.ctxHeight / 2 + this.cardWidth * heightFactor / 2);
                    }
                }
            }
        }
        /*        else
                {
                    var s = this.cards[0].description;
                    console.log("description undefined? " + s);
                }*/
        // redraw each DrawSingleCard in the cards[] array
        for (var i = 0; i < this.cards.length; i++) {
            var r = this.cards[i];
            //crta pojedine cards i znak na njima ako karta nije skrivena
            if (!r.isHidden) {
                if (r.text === undefined || r.text === "") {
                    //console.log("DSC 1 DC karta nije skrivena r.x=" + r.x + " r.y=" + r.y  + " r.width=" + r.width + " r.height=" + r.height + " r.desc=" + r.description + " r.img=" + r.image + " emptystring");
                    this.DrawSingleCard(r.x, r.y, r.width, r.height, r.description, r.image, "");
                }
                /*                else if(0 <= r.image.indexOf(".mp3"))
                                {
                                    console.log(".mp3: " + r.text + " " + r.image);
                                    this.DrawSingleCard(r.x, r.y, r.width, r.height, r.description, "", r.text);
                                }*/
                else {
                    var v = parseInt(r.text) + 1;
                    var t_1 = this.dirs + v + "-1.jpg";
                    //console.log("textc not empty: " + t + " img:" + r.image + " v:" + v);
                    if (t_1 !== r.image) {
                        //console.log("DSC 2 DC karta je skrivena ¸t != img r.x=" + r.x + " r.y=" + r.y  + " r.width=" + r.width + " r.height=" + r.height + " r.desc=" + r.description + " r.img=" + r.image + " r.text=" + r.text);
                        this.DrawSingleCard(r.x, r.y, r.width, r.height, r.description, r.image, r.text);
                    }
                    else {
                        //console.log("DSC 3 DC karta je skrivena ¸t=img r.x=" + r.x + " r.y=" + r.y  + " r.width=" + r.width + " r.height=" + r.height + " r.desc=" + r.description + " r.img=" + r.image + " r.text=" + r.text);
                        this.DrawSingleCard(r.x, r.y, r.width, r.height, r.description, "", r.text);
                    }
                }
            }
            // hidden cards show edges only
            else {
                // draw upper cards, only. Lower cards will have isDragable set to true
                if (!r.isDragable) {
                    if (ConceptualizationModes.None == this.conceptualGame) {
                        this.ctx.fillStyle = "black";
                        //console.log("DSC 4");                   
                        this.DrawSingleCard(r.x, r.y, r.width, r.height, "blank", "", r.text);
                    }
                    else {
                        //in conceptual mode drawing we look just for one card in three modes: normal, backwards, random
                        if (ConceptualizationModes.Normal == this.conceptualGame && a.guessedCards == r.id) {
                            this.ctx.fillStyle = "black";
                            //console.log("DSC 5");                   
                            this.DrawSingleCard(r.x, r.y, r.width, r.height, "blank", "", "");
                            //ovo pravi problem za visual concept    this.DrawSingleCard(r.x, r.y, r.width, r.height, "blank", "", r.text);
                        }
                        if (ConceptualizationModes.Backwards == this.conceptualGame && a.cardsUp - a.guessedCards - 1 == r.id) {
                            this.ctx.fillStyle = "black";
                            if (r.isHidden) {
                                //console.log("DSC 6");                   
                                this.DrawSingleCard(r.x, r.y, r.width, r.height, "blank", "", "");
                            }
                            else {
                                //console.log("DSC 7");                   
                                this.DrawSingleCard(r.x, r.y, r.width, r.height, "blank", "", r.text);
                            }
                        }
                    }
                }
            }
        }
    };
    // draw a single card
    App.prototype.DrawSingleCard = function (x, y, w, h, z, p, t) {
        var _this = this;
        if (!!z && !!p && !!t)
            console.log("DrawSingleCard problem, all vars empty!");
        else {
            //console.log("z:" + z + " p:" + p + " t:" + t);
        }
        if (z == "blank") {
            //draw image if it exist
            //image name is with stripped -1
            p = p.replace("-1", "");
            try {
                var imageObj_2 = new Image();
                imageObj_2.onload = function () {
                    //console.debug("DI OL:" + p + " x: " + x + " y: " + y);
                    _this.ctx.drawImage(imageObj_2, x, y, w, h);
                };
                imageObj_2.src = p;
                //console.debug("DI:" + p);
                this.ctx.drawImage(imageObj_2, x, y, w, h);
            }
            catch (e) {
                //cini se da ovdje ne stane kad nema slike s tim imenom
                console.log("No image: " + p);
            }
            //console.log("z == blank")
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.closePath();
            //edges only
            this.ctx.lineWidth = this.cardWidth * 0.03;
            this.ctx.strokeStyle = "black";
            this.ctx.stroke();
        }
        else {
            //crtaj okvir za tekst (broj) od jednog ili dva slova
            // .jpg je poseban slučaj za predefinirane loše slike
            if (t.length < 3 || 0 == t.indexOf(".jpg")) {
                //edge
                this.ctx.beginPath();
                this.ctx.rect(x, y, w, h);
                this.ctx.closePath();
            }
            //describe the card
            this.ctx.fillStyle = "white";
            this.ctx.lineWidth = this.cardWidth * 0.01;
            this.ctx.strokeStyle = "black";
            this.ctx.stroke();
            if (this.writeDescriptions) {
                this.ctx.font = "bold " + this.cardWidth * 0.15 + "px " + this.font;
                var signitureWidth_1 = this.ctx.measureText(z).width;
                this.ctx.fillStyle = "black";
                this.ctx.fillText(z, x + (w - signitureWidth_1) / 2, y + h * 1.15);
                //ctx.strokeStyle = 'black';
                //ctx.lineWidth = cardWidth * 0.02;
                //ctx.strokeText(z, x + (w - signitureWidth) / 2, y + h * 1.4);
            }
        }
        //this.ctx.globalAlpha = 0.5;
        //draw image
        //nije testirano, ubačeno da radi forsiranje teksta na slikama
        //ako mjenjaš provjeri:file:///C:/TabBook/Projects/InvestInUs/KORazred/indexTkoJeTo.html
        //za gornje karte crtaj slike
        if (a.showImageWriteText == writeTextShowImage.Text && y != a.cards[0].y) {
            //console.log("Ne crtaj sliku! " + y + " > " + this.ctxHeight / 2);
            p = "";
        }
        //if (p !== undefined || p !== "") {
        if (p !== undefined && p !== "") {
            try {
                var imageObj_3 = new Image();
                imageObj_3.onload = function () {
                    //console.debug("DI OL:" + p + " x: " + x + " y: " + y);
                    _this.ctx.drawImage(imageObj_3, x, y, w, h);
                };
                imageObj_3.src = p;
                //console.debug("DI:" + p);
                this.ctx.drawImage(imageObj_3, x, y, w, h);
            }
            catch (e) {
                //cini se da ovdje ne stane kad nema slike s tim imenom
                console.log("No image: " + p);
            }
            //ako već ima slika ne ispisuj tekst ispod
            //t = "";
        }
        //draw text
        // ako je tekst u stvari mp3 
        if (0 <= t.indexOf(".mp3"))
            t = "";
        if (a.showImageWriteText == writeTextShowImage.Image)
            t = "";
        if (t !== undefined && t !== "") {
            if (this.conceptualGame == ConceptualizationModes.None) {
                this.ctx.font = "bold " + Math.round(this.cardWidth * 0.12) + "px " + this.font;
            }
            else
                this.ctx.font = "bold " + Math.round(this.cardWidth * 0.25) + "px " + this.font;
            if (0 <= this.font.indexOf("Spojenrukopis"))
                this.ctx.font = "bold " + Math.round(this.cardWidth * 0.25) + "px " + this.font;
            //console.log("Font: " + this.ctx.font + " cardWidth: " + this.cardWidth + " *.25= " + Math.round(this.cardWidth * 0.25));
            var signitureWidth = this.ctx.measureText(t).width;
            //this.ctx.fillStyle = "black";
            //ubaci gradijent kada se želi naglasiti dio u tekstu
            var zPoc = t.indexOf("(") + 1;
            var x1Place = x + (w - signitureWidth) / 2;
            var y1Place = y + h / 2;
            if (1 <= zPoc) {
                t = t.replace("(", "");
                var gradient = this.ctx.createLinearGradient(x1Place, y1Place, x1Place + signitureWidth, y1Place);
                gradient.addColorStop(0, " black ");
                gradient.addColorStop(zPoc / t.length, " red ");
                var zKraj = t.indexOf(")") - 2;
                t = t.replace(")", "");
                gradient.addColorStop(zKraj / t.length, " red ");
                zKraj = zKraj + 3;
                if (zKraj > t.length)
                    zKraj = t.length;
                gradient.addColorStop(zKraj / t.length, " black ");
                this.ctx.fillStyle = gradient;
            }
            else {
                this.ctx.fillStyle = "black";
            }
            this.ctx.fillText(t, x1Place, y1Place);
            //console.log("writing text: " + t);
        }
    };
    //can we say that moving card is on top of one of cards up
    App.prototype.isMovingCardOnCardUp = function (x, y) {
        for (var i = 0; i < this.cardsUp; i++) {
            //get selected card details
            var cUp = this.cards[i];
            //check if touch point is inside selected card
            if (x > cUp.x && x < cUp.x + cUp.width && y > cUp.y && y < cUp.y + cUp.height)
                return i;
        }
        return -1;
    };
    return App;
}());
var IntroPosition;
var IntroImages = [];
function UnhideOneCard() {
    //makni komentar ako radi
    if (0 !== a.audioForCard && a.conceptualGame !== ConceptualizationModes.None) 
    //    if (a.cardsUp < a.audioForCard && a.conceptualGame !== ConceptualizationModes.None) {
    {
        a.cards[a.audioForCard - 1].isHidden = true;
    }
    if (a.cards[a.audioForCard])
        a.cards[a.audioForCard].isHidden = false;
    else
        console.log("a.cards[a.audioForCard] " + a.audioForCard);
    console.log("drawCards UnhideOneCard");
    a.drawCards();
}
function UnhideCardsAndPlayAudioTitles() {
    //play all upper cards audios
    if (a.audioForCard < a.cardsUp) {
        if (a.cards[a.audioForCard].audio === undefined)
            return;
        if (a.audioForCard <= a.cardsUp - 1 && a.gameAVMode != gameAudioVideoModes.Audio) {
            console.log("UnhideCardsAndPlayAudioTitles UnhideOneCard");
            UnhideOneCard();
        }
        if (a.gameAVMode == gameAudioVideoModes.None || a.gameAVMode == gameAudioVideoModes.Visual)
            return;
        //console.log(a.audioForCard + "-" + a.cards[a.audioForCard].audio);
        //read the text
        if (0 > a.cards[a.audioForCard].audio.indexOf(".mp3")) {
            /*            if((document.title == "RMedoA" && a.cardsUp >= 5) || (document.title == "Koncept brojevi A" && a.cardsUp >= 6))
                        {
                            let s:string = "";
                            for(var i = 0; i < a.cardsUp; i = i + 1)
                            {
                                s = s + a.cards[a.audioForCard].audio + "!";
                                a.audioForCard = a.audioForCard + 1;
                                //add ! after 3rd word
                                //if(i == 1 || i == 3)
                                //    s = s + " ! "
                            }
                            console.log("koncept " + s);
                            a.ReadText(s, 1);
                            a.audioForCard = 0;
                            let c = setTimeout(HideConcepts, a.timeoutHideCardsUpDown * (a.cardsUp + 1));
                        }
                        else*/
            {
                //pokusaj postavljanja bridginga za konceptualne igre
                //iako nije ponavljanje i grupiranje, 
                //ovo je samo čitanje teksta bez pauza
                if (a.startCardsUp < a.cardsUp) {
                    var txt = "";
                    for (var i = 0; i < a.cardsUp; i = i + 1) {
                        if (i == 3)
                            txt = txt + "!!" + a.cards[i].audio;
                        else
                            txt = txt + "!" + a.cards[i].audio;
                    }
                    SpeakText(txt);
                    var c = setTimeout(UnhideCardsAndPlayAudioTitles, a.timeoutHideCardsUpDown * 0.75);
                }
                else {
                    SpeakText(a.cards[a.audioForCard].audio);
                    //wait before you play another one
                    console.log("timeout UnhideCardsAndPlayAudioTitles " + a.timeoutHideCardsUpDown);
                    var c = setTimeout(UnhideCardsAndPlayAudioTitles, a.timeoutHideCardsUpDown);
                }
                a.audioForCard = a.audioForCard + 1;
            }
        }
        //or play mp3 file
        else {
            console.log("playing..." + a.cards[a.audioForCard].audio);
            var audio = new Audio(a.cards[a.audioForCard].audio);
            myPlay(audio);
            a.audioForCard = a.audioForCard + 1;
            //console.log("timout UnhideCardsAndPlayAudioTitles mp3" + 1000);
            //let c = setTimeout(UnhideCardsAndPlayAudioTitles, 1000);
        }
        /*
        var playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
            // Automatic playback started!
            // Show playing UI.
            console.log("Playback strated!");
            })
            .catch(error => {
            // Auto-play was prevented
            // Show paused UI.
            audio.play();
            console.log("Playback 2. strated!");
            });
        }
        else
        {
            console.log("Playback problem!");
        }*/
    }
    else {
        if (a.conceptualGame === ConceptualizationModes.Backwards) {
            SpeakText("Nazad");
        }
        //let timer = setTimeout(HideConcepts, a.timeoutHideCardsUpDown * 2);
        a.audioForCard = 0;
        HideConcepts();
    }
}
function myPlay(aud) {
    aud.autoplay = true;
    var playPromise = aud.play();
    aud.onended = UnhideCardsAndPlayAudioTitles;
    if (playPromise !== undefined) {
        playPromise.then(function (_) {
            // Automatic playback started!
            // Show playing UI.
            console.log("Playback strated! " + aud);
        })["catch"](function (error) {
            // Auto-play was prevented
            // Show paused UI.
            aud.onpaused(myPlay(aud));
            console.log("Playback 2. strated!");
        });
    }
    else {
        console.log("Playback problem!");
    }
}
function HideVisualConcepts() {
    if (0 == a.audioForCard)
        a.audioForCard = 1;
    console.log("HideVisualConcepts UnhideOneCard");
    this.UnhideOneCard();
    if (a.audioForCard < a.cardsUp) {
        a.audioForCard = a.audioForCard + 1;
        //postavi timer
        console.log("timeout HideVisualConcepts " + 1000);
        setTimeout(HideVisualConcepts, 1000);
    }
    else {
        a.audioForCard = 0;
        HideConcepts();
    }
}
function HideConcepts() {
    var spk = window['speechSynthesis'].speaking;
    //ako je ostalo jos teksta za procitati pricekaj pola sekunde
    //if (a.audioForCard !== 0 || spk) {
    if (a.audioForCard !== 0 && spk) {
        console.log("timout HideConcepts " + 500);
        var c = setTimeout(HideConcepts, 500);
        console.log("HideConcepts() ne skriva!");
        return;
    }
    for (var i = 0; i < a.cards.length; i++) {
        if (true == a.cards[i].isHidden && i >= a.cardsUp) {
            //open cards down
            a.cards[i].isHidden = false;
            //console.log("i:" + i + " isHidden:" + a.cards[i].isHidden);
        }
        else {
            //hide cards up for conceptualization games, only
            if (ConceptualizationModes.None < a.conceptualGame && i < a.cardsUp)
                a.cards[i].isHidden = true;
        }
    }
    TimerHideCards = false;
    console.log("drawCards HideConcepts");
    a.drawCards();
}
function Introduction() {
    var titles = GetElements("IntroTitles").split(";");
    var audioIntros = GetElements("AudioIntros").split(";");
    if (!IntroPosition) {
        //initialize array
        for (var j = 0; j < ImgTotal; j++) {
            var m = a.imageBox[j].split("-");
            if (-1 != a.correctGroups.indexOf(m[0]))
                IntroImages.push(a.imageBox[j]);
        }
        /*        let t = ImgTotal / a.groups;
                for (let j = 0; j < a.correctGroups.length; j++) {
                    let p = ImgTotal / a.groups * (a.correctGroups[j] - 1);
                    for (let i = 0; i < t; i++) {
                        IntroImages.push((p + 1).toString() + "-" + (i + 1).toString());
                    }
                }*/
        IntroPosition = 0;
    }
    TimerHideCards = true;
    a.ClearCanvas("Introduction");
    var w = a.ctxWidth / 2;
    var h = a.ctxHeight / 2;
    a.cardWidth = w / 2;
    if (IntroPosition < IntroImages.length) {
        var g = IntroImages[IntroPosition].split("-");
        //draw title
        a.ctx.font = "bold " + w * 0.1 + "px Arial";
        var n = g[0];
        var z = titles[n - 1];
        var signitureWidth = a.ctx.measureText(z).width;
        a.ctx.fillStyle = "red";
        a.ctx.fillText(z, w - signitureWidth / 2, h * 0.3);
        var text = "";
        var e = document.getElementById("DescriptionCard" + IntroImages[IntroPosition]);
        if (null != e)
            text = e.textContent;
        //draw card and description if any
        //console.log("DSC 8");                   
        a.DrawSingleCard(w - w / 4, h - w / 4, w / 2, w / 2, text, IntroImages[IntroPosition] + ".jpg", "");
        //console.log("timout Introduction " + "TimeoutHideCards");
        TimeoutIntro = setTimeout(Introduction, TimeoutHideCards);
        var audio = new Audio(audioIntros[n - 1]);
        audio.play();
        IntroPosition = IntroPosition + 1;
    }
    else {
        clearTimeout(TimeoutIntro);
        IntroPosition = null;
        TimerHideCards = false;
        a.ClearCanvas("Introduction2");
        a.startApp();
    }
}
// handle mouseup events
function Mouse_up(e) {
    // tell the browser we're handling this mouse event
    //e.preventDefault();
    e.stopPropagation();
    UpEvent(e.x, e.y);
}
// handle touchup events
function Touch_end_gesture(e) {
    // tell the browser we're handling this mouse event
    //e.preventDefault();
    e.stopPropagation();
    UpEvent(a.startX, a.startY);
}
function UpEvent(x, y) {
    var rec = localStorage.getItem("stat");
    var d = new Date();
    //let dt = d.getDate() + "." + d.getMonth() + "." + d.getFullYear() + ". " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    var dt = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    // clear all the dragging flags since card is down at the moment
    a.dragOK = false;
    for (var i_1 = 0; i_1 < a.cards.length; i_1++) {
        a.cards[i_1].isDragging = false;
    }
    //in case we have no moving card, do not recognise double tap in upper cards as a correct answer
    if (0 >= a.movingCardIndex) {
        return;
    }
    var i = a.isMovingCardOnCardUp(x, y);
    //if dragged card is on one of upper cards space
    if (0 <= i) {
        a.totalAnswers = a.totalAnswers + 1;
        //find group of cardUp
        var b = false;
        if (a.cards[i].image) {
            if (1 <= a.cards[i].image.indexOf("-" + a.cards[a.movingCardIndex].group.toString() + "-"))
                b = true;
        }
        if (a.cards[i].group == a.cards[a.movingCardIndex].group || b) {
            a.guessedCards = a.guessedCards + 1;
            if (!a.showAnswerUp) {
                //hide the card since it's not in propper position
                a.cards[a.movingCardIndex].isHidden = true;
                console.log("drawCards UpEvent !showAnswerUp");
                a.drawCards();
            }
            else {
                //correct possion to be aligned with card up
                a.cards[a.movingCardIndex].x = a.cards[i].x;
                a.cards[a.movingCardIndex].y = a.cards[i].y;
                console.log("drawCards UpEvent showAnswerUp");
                a.drawCards();
            }
            //show card for conceptulization games
            if (ConceptualizationModes.None < a.conceptualGame) {
                if (ConceptualizationModes.Normal == a.conceptualGame)
                    a.cards[a.guessedCards - 1].isHidden = false;
                else if (ConceptualizationModes.Backwards == a.conceptualGame)
                    a.cards[a.cardsUp - a.guessedCards].isHidden = false;
                else //random
                 {
                    for (var i_2 = 0; i_2 < a.cardsUp; i_2++) {
                        var r = Math.random() * a.cardsUp;
                        if (false == a.cards[r].isHidden) {
                            a.cards[r].isHidden = false;
                            console.log("drawCards UpEvent Concepts");
                            a.drawCards();
                            break;
                        }
                    }
                }
            }
            //if we guessed required cards
            if (a.guessedCards == a.correctCardsDown * a.correctGroups.length) {
                rec = rec + ";" + dt + " " + GetDocURI() + " OK " + a.cardsUp + " " + a.cardsDown;
                a.correctAnswers = a.correctAnswers + 1;
                rec = rec + " U:" + a.totalAnswers + " T:" + a.correctAnswers + " " + (a.correctAnswers / a.totalAnswers * 100) + "%";
                //make game more complicated
                //if (ImgTotal < ImgPossibleTotal)
                //    ImgTotal = ImgTotal + a.groups;
                if (ConceptualizationModes.None < a.conceptualGame) {
                    //ne pokazuj nagradu ako je broj karata manji
                    if (a.cardsUp < a.startCardsUp)
                        mm.numberOfCorrectAnswers = -2;
                    //if((a.cardsUp < a.allowedCardsUp || a.cardsDown < a.allowedCardsDown))
                    if ((a.cardsUp < a.allowedCardsUp || a.cardsDown < a.allowedCardsDown)) // && a.cardsUp <= a.startCardsUp)
                     {
                        if (mm.numberOfFalseAnswers == 0) 
                        //if(a.guessedCards == a.cardsUp)
                        {
                            if (a.cardsUp <= a.startCardsUp) 
                            //povećaj broj karata ako je točno riješeno
                            {
                                a.cardsUp = a.cardsUp + 1;
                                a.cardsDown = a.cardsDown + 1;
                            }
                            //spremi dostignuti nivo u local storage
                            var name = "CardsUp_" + GetDocURI();
                            localStorage.setItem(name, a.cardsUp.toString());
                        }
                        /*                        else
                                                {
                                                    a.cardsUp = a.cardsUp - 1;
                                                    a.cardsDown = a.cardsDown - 1;
                                                }*/
                    }
                }
                else {
                    //za nekonceptualizacijske igre spremi točan odgovor
                    //čini se da bi bolje bilo držati i sve netočne odgovore
                    if (mm.numberOfFalseAnswers == 0) //&& a.correctGroups.length == 1)
                     {
                        var name = "OK_" + GetDocURI();
                        var lsItem = localStorage.getItem(name);
                        if (null == lsItem)
                            lsItem = ";";
                        if (a.cards[0].place !== "" || a.cards[0].place !== undefined || a.cards[0].place !== null) {
                            lsItem = lsItem + a.cards[0].place + ";";
                            localStorage.setItem(name, lsItem);
                        }
                    }
                }
                //a.guessedCards = 0;
                mm.OK();
            }
            else {
                var okFile = void 0;
                okFile = String("..\\MMLib\\Zvukovi\\" + mm.OKzvuci[Math.floor(Math.random() * mm.OKzvuci.length)] + ".mp3");
                //let audio = new Audio(okFile);
                //audio.play();
            }
            //erase the card that changed visibility
            console.log("drawCards UpEvent after OK");
            a.drawCards();
        }
        else 
        //wrong card left at right position
        //notify user that the aswer was wrong
        {
            if (!a.showAnswerUp)
                a.cards[a.movingCardIndex].isHidden = true;
            rec = rec + ";" + dt + " " + GetDocURI() + " NO " + a.cardsUp + " " + a.cardsDown;
            //a.correctAnswers = a.correctAnswers + 1;
            rec = rec + " U:" + a.totalAnswers + " T:" + a.correctAnswers + " " + (a.correctAnswers / a.totalAnswers * 100) + "%";
            //make game more complicated
            //if (ImgTotal > a.groups)
            //    ImgTotal = ImgTotal - a.groups;
            if (ConceptualizationModes.None < a.conceptualGame) {
                //if((a.cardsUp > 1 || a.cardsDown > 2))  
                //ovo nema smisla dok je uključeno pogađanje svih karata
                if ((a.cardsUp > 1 || a.cardsDown > 2)) // && a.cardsUp >= a.startCardsUp)  
                 {
                    if ((mm.allowedFalseAnswers - 1) <= mm.numberOfFalseAnswers) {
                        a.cardsUp = a.cardsUp - 1;
                        a.cardsDown = a.cardsDown - 1;
                        //spremi dostignuti nivo u local storage
                        var name = "CardsUp_" + GetDocURI();
                        localStorage.setItem(name, a.cardsUp.toString());
                    }
                }
                mm.numberOfCorrectAnswers = -1;
                a.cards[a.movingCardIndex].isHidden = false;
                //pomakni malo kartu gore
                a.cards[a.movingCardIndex].y = a.cards[a.movingCardIndex].y - a.cards[a.movingCardIndex].height;
            }
            mm.NOK();
        }
    }
    a.movingCardIndex = -1;
    localStorage.setItem("stat", rec);
    //bugfix - nema više karata dole kod grupa
    if (a.totalAnswers >= a.cardsDown)
        a.startApp();
    /*else
        console.log("TotalAnswers: " + a.totalAnswers + " a.cardsDown " + a.cardsDown);*/
}
// handle mouse moves
function Mouse_move(e) {
    // if we're dragging anything...
    // tell the browser we're handling this mouse event
    //e.preventDefault();
    e.stopPropagation();
    MoveEvent(e.clientX, e.clientY);
}
// handle touchmoves
function Touch_move_gesture(e) {
    // if we're dragging anything...
    if (a.dragOK) {
        // tell the browser we're handling this mouse event
        //e.preventDefault();
        e.stopPropagation();
        if (e.touches.length == 1) {
            var touch = e.touches[0];
        }
        else {
            return;
        }
        MoveEvent(touch.pageX, touch.pageY);
    }
}
function MoveEvent(x, y) {
    if (a.dragOK) {
        // get the current mouse position
        var mx = parseInt(x); // - a.offsetX;
        var my = parseInt(y); // - a.offsetY;
        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - a.startX;
        var dy = my - a.startY;
        // if dragging is too fast, just drop the card
        //if (Math.abs(dx) > 50 || Math.abs(dy) > 50)
        //    UpEvent(x, y);
        // move each DrawSingleCard that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < a.cards.length; i++) {
            var r = a.cards[i];
            if (r.isDragging && r.isDragable) {
                r.x += dx;
                r.y += dy;
            }
        }
        // redraw the scene with the new DrawSingleCard positions
        console.log("drawCards MoveEvent");
        a.drawCards();
        // reset the starting mouse position for the next mousemove
        a.startX = mx;
        a.startY = my;
    }
}
// handle touchdown events
function Touch_start_gesture(e) {
    // tell the browser we're handling this mouse event
    //e.preventDefault();
    e.stopPropagation();
    // get the current mouse position
    if (e.touches.length == 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }
    StartEvent(touch.pageX, touch.pageY);
}
// handle mousedown events
function Mouse_down(e) {
    // tell the browser we're handling this mouse event
    //e.preventDefault();
    e.stopPropagation();
    StartEvent(e.clientX, e.clientY);
}
function Key_press(e) {
    switch (e.key) {
        case "S":
        case "s":
            var d = document.createElement("P");
            d.innerHTML = localStorage.getItem("stat");
            document.body.appendChild(d);
            break;
        case "C":
            //obrisi cijeli storage
            localStorage.clear();
            break;
        case "X":
        case "x":
            //bezuvjetno napusti stranicu
            leavePage = true;
            OpenIndexPage();
            break;
        default:
            break;
    }
}
function StartEvent(x, y) {
    if (a === undefined)
        a = new App();
    if (!a.appStarted) {
        a.appStarted = true;
        a.startApp();
        return;
    }
    //ako je timer on ne dozvoljavaj micanje karata
    if (TimerHideCards)
        return;
    var mx = parseInt(x); // - a.offsetX;
    var my = parseInt(y); // - a.offsetY;
    //provjeri da li se trazi selekcija videa
    if (mm.waitForVideoSelection) {
        mm.waitForVideoSelection = false;
        mm.startRightVideo(mx, my);
        return;
    }
    // test each DrawSingleCard to see if mouse is inside
    a.dragOK = false;
    for (var i = 0; i < a.cards.length; i++) {
        var r = a.cards[i];
        if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
            // if yes, set that cards isDragging=true
            if (!r.isHidden) {
                a.dragOK = true;
                r.isDragging = true;
                a.movingCardIndex = r.id;
            }
            //provjeri da li je karta prava prije nego dozvoliš micanje
        }
    }
    // save the current mouse position
    a.startX = mx;
    a.startY = my;
}
/*function Start() {

    if (a === undefined)
        a = new App();
    if (mm === undefined)
        mm = new MM(a);

    a.appStarted = false;*/
/*    if (a.conceptualGame == ConceptualizationModes.None) {
        a.appStarted = true;
    }
    else {
        a.appStarted = false;
    }*/
//    if (ShowIntroduction)
//        Introduction();
/*    else {
        if (a.appStarted)
            a.startApp();
    }*/
//}
window.onload = function () {
    a = new App();
    window.addEventListener('mousemove', Mouse_move, false);
    window.addEventListener('mousedown', Mouse_down, false);
    window.addEventListener('mouseup', Mouse_up, false);
    window.addEventListener('touchend', Touch_end_gesture, false);
    window.addEventListener('touchstart', Touch_start_gesture, false);
    window.addEventListener('touchmove', Touch_move_gesture, false);
    window.addEventListener('keypress', Key_press, false);
    mm = new MM(a);
    Start();
};
