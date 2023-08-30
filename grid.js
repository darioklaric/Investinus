//inicijaliziraj google tag za GoogleAnalytics
let myScript = document.createElement("script");
myScript.setAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-TZ9DP5PKLH");
myScript.setAttribute("async", "true");
let head = document.head;
head.insertBefore(myScript, head.lastElementChild);
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date()); 
gtag('config', 'G-TZ9DP5PKLH');
//Google Analytics inicijalizacija gotova

//definiraj globalne nagrade i spremi u localStorage
//ako se localstorage razlikuje od html sadržaja, promjeni ls
var GlNagrada = document.getElementById("GlNagrada").textContent;
var lsGlNagrada = localStorage.getItem("GlNagrada"); 
if(null == lsGlNagrada)
  lsGlNagrada = "";
if(0 != GlNagrada.indexOf(lsGlNagrada) || GlNagrada.length != lsGlNagrada.length)
{
  localStorage.setItem("GlNagrada", GlNagrada);  
}
//da li se nagrade pokazuju kao slike ili TEXT
var prikaziNagradu = document.getElementById("NagradePrikazujKao").textContent;
var lsPrikaziNagradu = localStorage.getItem("NagradePrikazujKao"); 
if(null == lsPrikaziNagradu)
  lsPrikaziNagradu = "";
if(0 != prikaziNagradu.indexOf(lsPrikaziNagradu) || lsPrikaziNagradu.length != prikaziNagradu.length)
{
  localStorage.setItem("NagradePrikazujKao", prikaziNagradu);  
}
//da li je uključena BACK tipka u browseru kako se ne bi moglo izlaziti ranije iz igre
var backDozvoljen = document.getElementById("BackOff").textContent;
localStorage.setItem("BackOff", backDozvoljen);  
//da li je uključeno testiranje na zadnjih 10 odigranih istih igara 
var testLast10 = Boolean(document.getElementById("TestLast10").textContent);
if(!testLast10)
  localStorage.setItem("TestLast10", "");  
else
  localStorage.setItem("TestLast10", "1");  

  //ako neka od igara nije završena kako treba
var lsLastApp = localStorage.getItem("LastAppPage");
if(lsLastApp)
{
  var mj = "./" + lsLastApp;
  if(0 <= lsLastApp.indexOf(".investinus.hr/Keti/"))
    //problem sa www.investinus.hr
    lsLastApp = lsLastApp.replace(".investinus.hr/Keti/", "");
  if(TestLast10(mj))
  {
    //poseban slučaj kad je zadnja igra pokrenuta previše puta
    //otiđi na praznu stranicu
    localStorage.setItem("LastAppPage", "");
    //location.replace("index.html");
  }
  else
    //vrati se u zadnju igru
    location.replace(lsLastApp);
}
else
{
  //sve igre su ok, prikaži grid
  localStorage.setItem("LastAppPage", "");
  //location.replace("index.html");
}

var main = document.createElement("main");
var section = document.createElement("section");
section.className = "cards";

var brElem = document.getElementById("BrojElemenata");
for(var el = 1; el <= brElem.textContent; el = el + 1) {

    var element = 0;
    var article = document.createElement("article");
    var a = document.createElement("a");
    var elData = document.getElementById("I" + el);
/*    if(el == 0)
      a.href = "javascript:window.open(\"" + dirs[element][0] + "\", \"\", \"status=1\");"; 
    else*/
    a.href = elData.textContent;
    //a.href = "javascript:location.replace('" + dirs[element][0] + "');"; 
    var img = document.createElement("img");
    img.className = "zoom article-img c" + (el % 7 + 1);
    img.src = "./MMLib/IgreSlike/" + elData.getAttribute("slika");
    var h1 = document.createElement("h1");
    h1.className = "article-title";
    var txt = elData.getAttribute("tekst");
    h1.innerText =  txt.slice(0, txt.indexOf(" "));

    if(false == TestLast10(element))
    {
      a.appendChild(img);
      article.appendChild(a);
    }

    article.appendChild(h1);
    section.appendChild(article);
    

    /*    <article>
    <a class="citanje">
      <img class="zoom article-img c1" src="./7.png" alt=" " />
    </a>
    <h1 class="article-title">
      Čitanje
    </h1>
  </article>*/

    //dirs.splice(element, 1);
}

main.appendChild(section);
document.body.appendChild(main);

function CleanLast10()
{
  localStorage.setItem("last10", "");
  localStorage.setItem("LastAppPage", "");
  localStorage.setItem("PisanjePisanihSlovaNumeriraneTocke/index.html_text", "");

  var x;
  for (var i = 0; i < localStorage.length; i++) {
    x = localStorage.key(i);
    if(0 == x.indexOf("CardsUp_"))
      //obriši sve CardsUp_ zapise
      //localStorage.key(i) = "";
      localStorage.removeItem(x);
  }
}

function TestLast10(element)
{
  var adr;

  if(!testLast10)
    //ako je kontrola isključena izađi odmah
    return false;

  var lsLast10 = localStorage.getItem("last10");
  if(!isNaN(element)) 
  {
    adr = document.getElementById("I1").textContent;
    if(null == lsLast10)
    {
      localStorage.setItem("last10", "");
      return false;
    }      
  }
  else
  {
    adr = element;
  }

  adr = adr.substr(2);
  //broji koliko ima istih adresa u zadnjih 10
  var count = lsLast10.split(adr).length - 1;

  if(count < 9)
    return false;
  else
    return true;
}
/*
window.onload = () => {
    window.addEventListener('mousedown', mouse_down, false);
};*/


//staro
/*
var lsValue = Number.parseInt(localStorage.getItem("TestTematskeSlikeBr"), 10);
if(lsValue == undefined || lsValue == null || Number.isNaN(lsValue) || lsValue > 17)
	lsValue = 0;
var prValue = Number.parseInt(localStorage.getItem("PersonalRefsBr"), 10);
if(prValue == undefined || prValue == null || Number.isNaN(prValue) || prValue >= 8)
	prValue = 0;
var srValue = Number.parseInt(localStorage.getItem("PicSeqBr"), 10);
*/
/*
var srHTML = "";
if(!srValue)
{    
  srValue = 0;
  srHTML = "./R%202Slova/index.html";
}
else
{
  switch (srValue)
  {
    case srValue = 0: 
      srHTML = "./R%202Slova/index.html";
      break;
    case srValue = 1:
      srHTML = "./R%204Slova/index.html";
      break;
    default:
      srHTML = "./R%202Slova/index.html";
      srValue = -1;
      break;
  }
}
var katValue = Number.parseInt(localStorage.getItem("KatBr"), 10);
var katHTML = "";
if(katValue == undefined || katValue == null || Number.isNaN(katValue))
{    
  katValue = 0;
  katHTML = "./KK%20Kategorije/indexOsBiZiSt.html";
}
else
{
  switch (katValue)
  {
    case katValue = 0: 
      katHTML = "./KK%20Kategorije/indexOsBiZiSt.html";
      break;
    case katValue = 1:
      katHTML = "./KK%20Kategorije/indexOsiliDvOs.html";
      break;
    case katValue = 2:
      katHTML = "./KK%20Kategorije/index024Noge.html";
      break;
    case katValue = 3:
      katHTML = "./KK%20Kategorije/indexVocPov.html";
      break;
    case katValue = 4:
      katHTML = "./KK%20Kategorije/indexMuZe.html";
      break;
    case katValue = 5:
      katHTML = "./KK%20Kategorije/indexPiHrIgMoVo.html";
      break;
    case katValue = 6:
        katHTML = "./KK%20Kategorije/indexMuZeSr.html";
        katValue = -1;
        break;
      default:
      katHTML = "./KK%20Kategorije/indexOsBiZiSt.html";
      katValue = -1;
      break;
  }
}
var mtValue = Number.parseInt(localStorage.getItem("mtPrep"), 10);
var mtHTML = "";
if(mtValue == undefined || mtValue == null || Number.isNaN(mtValue))
{    
  mtValue = 0;
  mtHTML = "./KM%20SiDiJ/index.html";
}
else
{
  switch (mtValue)
  {
    case mtValue = 0: 
      mtHTML = "./KM%20SiDiJ/index.html";
      break;
    case mtValue = 1:
      mtHTML = "./KM%20RavneIliZakrivljeneCrte/index.html";
      break;
    case mtValue = 2:
      mtHTML = "./KM%20OtvoreneIliZatvoreneCrte/index.html";
      break;
    case mtValue = 3:
      mtHTML = "./KM%20CrtanjeGeom/index.html";
      break;
    case mtValue = 4:
        mtHTML = "./KM%20VeceManjeJednako100rijeci/index1.html";
        mtValue = -1;
        break;
    default:
      mtHTML = "./KM20SiDiJ/index.html";
      mtValue = -1;
      break;
  }
}
var hjValue = Number.parseInt(localStorage.getItem("hjPrep"), 10);
var hjHTML = "";
if(hjValue == undefined || hjValue == null || Number.isNaN(hjValue))
{    
  hjValue = 0;
  hjHTML = "./6Upisivanje/hjVelikoMaloSlovo.html";
}
else
{
  switch (hjValue)
  {
    case hjValue = 0: 
      hjHTML = "./6Upisivanje/hjVelikoMaloSlovo.html";
      break;
    case hjValue = 1:
      hjHTML = "./6Upisivanje/hjUpitIzajvUsklikRec.html";
      break;
    case hjValue = 2:
      hjHTML = "./6Upisivanje/indexIdeUpis.html";
      break;
    case hjValue = 3:
      hjHTML = "./6Upisivanje/hjJesneNijecneRec.html";
      break;
    case hjValue = 4:
      hjHTML = "./6Upisivanje/indexCijeUpis.html";
      hjValue = -1;
      break;
    default:
      hjHTML = "./6Upisivanje/hjVelikoMaloSlovo.html";
      hjValue = -1;
      break;
  }
}
var dpHTML = "";
var cpHTML = "";
var djHTML = "";
var pitHTML = "";
var pisHTML = "";
var cpValue = Number.parseInt(localStorage.getItem("PicSeqBr"), 10);
if(cpValue == undefined || cpValue == null || Number.isNaN(cpValue))
{    
  cpValue = 0;
  dpHTML = "./R%20ObjA/indexCBoje.html";
  cpHTML = "./TestSlikeRazumjevanja/index_slike.html";
  djHTML = "./KORazred/index.html"; 
  pitHTML = "./UTkoStoGdjePitanja/indexIdeUpis.html";
  pisHTML = "./PisanjePisanihSlovaNumeriraneTocke/index.html";
}
else
{
  switch (cpValue)
  {
    case cpValue = 0: 
      dpHTML = "./R%20ObjA/indexCBoje.html";
      cpHTML = "./TestSlikeRazumjevanja/index_slike.html";
      djHTML = "./KORazred/index.html"; 
      pitHTML = "./UTkoStoGdjePitanja/indexIdeUpis.html"; 
      pisHTML = "./PisanjePisanihSlovaNumeriraneTocke/index.html";
      break;
    case cpValue = 1:
      dpHTML = "./R%20ObjA/indexCVoce.html";
      cpHTML = "./TestSlikeRazumjevanja/index_ponavljanjeskola.html";
      djHTML = "./KORazred/indexTkoJeTo.html"; 
      pitHTML = "./UTkoStoGdjePitanja/indexCijeUpis.html"; 
      pisHTML = "./PisanjePisanogTekstaTocke/index.html";
      break;
    case cpValue = 2:
      dpHTML = "./R%20ObjA/indexCPovrce.html";
      cpHTML = "./TestSlikeRazumjevanja/index_ponavljanjeskola.html";
      djHTML = "./KORazred/indexTkoJeTo.html"; 
      pitHTML = "./UTkoStoGdjePitanja/indexPricaUpis.html"; 
      pisHTML = "./PisanjePSlovaNumeriraneTocke/index.html";
      cpValue = -1;
      break;
    default:
      dpHTML = "./R%20ObjA/indexCBoje.html";
      cpHTML = "./TestSlikeRazumjevanja/index_slike.html";
      djHTML = "./KORazred/index.html"; 
      pitHTML = "./UTkoStoGdjePitanja/indexIdeUpis.html"; 
      pisHTML = "./PisanjePSlovaNumeriraneTocke/index.html";
      cpValue = -1;
      break;
    }
}*/
/*
var dirs = [
//NACD igre
["./R%20ObjA/indexAOCi.html", "IAOSeq novo", "6.png"],
["./TestRazumjevanja/CreateSentenceFromAWord.html", "AudCatSeq ", "24.png"],
["./R%20ObjA/indexConceptualWordsU.html", "UACatSeq ", "6.png"],
["./TestSlikeRazumjevanja/indexMob.html", "CogPhts ", "56.png"],
["./R%20ObjA/indexObjSeqU.html", "AObjSeq ", "6.png"],
["./8/sdIspricajPricu.html", "hjPr Pr ", "8.png"],
["./7Upisivanje/seqTjelesniu.html", "WDS tje ", "58.png"],
["./7Upisivanje/hjCitanjeG1.html", "HjG h ", "38.png"],
["./TestRazumjevanja/FinishSentence.html", "Fsent ", "14.png"],
["./8/testSk.html", "TstSk a", "2.png"],
["./7Upisivanje/matTablicaMnozenja2.html", "Tablica ", "19.png"],
["./7Upisivanje/hjZapamtiRecenicu.html", "HRec hj ", "19.png"],
["./TestSlikeRazumjevanja/indexMobPonavljanje.html", "CogPhts ", "56.png"],
["./R%20ObjA/indexObjSeqU.html", "AObjSeqB ", "10.png"],
["./8/sdPronadji.html", "SDPro a", "4.png"],
["./7Upisivanje/indexIv3UA.html", "Pitanja test", "62.png"],
["./R%202Brojevi/index.html", "ABrojeviSeq ", "8.png"],
["./7Upisivanje/matZbrOduz15_2.html", "ZbrOduz ", "41.png"],
["https://www.coolmathgames.com/0-maze", "Boje ", "59.png"],
["./Citanje/index1.html", "ČitPon a", "1.png"],
["./TSIActiveBoost/NACDActiveBoost1.html", "NACD a", "38.png"],

["./TestRazumjevanja/MMlibGlazba.html", "Pjesme a", "38.png"],
["./7Upisivanje/dr2301.html", "Dr01.23 govor", "69.png"],
["./7Upisivanje/dr2301u.html", "DrU govor", "70.png"],
["./7Upisivanje/dr2301g.html", "DrG govor", "71.png"],
["./7Upisivanje/hjUNaIspod.html", "UNaIsp ", "50.png"],
["./7Upisivanje/geografijaBorna.html", "Borna govor", "11.png"],
["./TestTematskeSlike/index_pon18.html", "Tje ", "58.png"],
["./R%20ObjA/indexObjSeqb.html", "ASOSeq ", "10.png"],
["./Citanje/index1.html", "ČitPon a", "1.png"],

//["https://wordwall.net/hr/resource/51969670/pubertet", "Puber pri ", "39.png"],
//["https://wordwall.net/hr/resource/1498237/priroda-i-dru%c5%a1tvo/pubertet", "Puber pri ", "39.png"],
//["https://wordwall.net/hr/resource/23802933/hrvatski-jezik/jednina-i-mno%c5%beina", "HJBroj HJ ", "29.png"],
//https://wordwall.net/hr/resource/632416/hrvatski-jezik/imenice-jednina-i-mno%c5%beina
//["./7Upisivanje/hjJedninaMnozina.html", "JedMnož ", "49.png"],
//["./7Upisivanje/hjBicaPojaveStvariK.html", "BiPoSt hj ", "9.png"],
//["./7Knjige/2306 zoo.html", "ExB test", "35.png"],
//["./PODD pitanja/PODDPitanja.html", "CogPhtsP ", "56.png"],
//["./7Upisivanje/seqTjelesniu1.html", "WDS tje ", "58.png"],
//["./7Testiranje/hj2307 price.html", "hjPr Pr ", "28.png"],
//["./TestRazumjevanja/indexFDS2.html", "FuncSeq ", "57.png"],
//["https://www.investinus.hr/7Upisivanje/videoizborG2.html", "Govor reč", "38.png"],
//["./Citanje/index.html", "Čitanje a", "1.png"],
//["./7Upisivanje/hjBicaPojaveK.html", "BiPo hj ", "49.png"],
//["./7Upisivanje/hjJedninaMnozinaKR.html", "JedMnož ", "50.png"],
//["https://wordwall.net/hr/resource/1238202/matematika/razlomci", "MRazlom ", "40.png"],
//["https://wordwall.net/hr/resource/8611255/priroda-i-dru%c5%a1tvo/brinem-se-o-osobnom-zdravlju", "Zdravlje ", "50.png"],
//["./7Testiranje/mat2306.html", "MPrije test", "30.png"],
//["https://wordwall.net/hr/resource/52187813/hrvatski-jezik/imenice-bi%c4%87a-stvari-pojave", "HJ bića ", "20.png"],
//["./7Upisivanje/hjSlovoRijecRecenicaU.html", "SlRiRe ", "28.png"],
//["./7Upisivanje/hjVMSlovo.html", "VMSlovo hj ", "49.png"],
//["./7Testiranje/mat2305.html", "MPrije test", "30.png"],
//["./7Upisivanje/pri2303 RH.html", "Dru test", "31.png"],
//["./7Upisivanje/hjBicaStvariR2.html", "BiPo hj ", "49.png"],
//["./7Upisivanje/hjUNaIspodU.html", "UNaIsp hj ", "29.png"],
//["./7Upisivanje/matTablicaMnozenja.html", "Tablica ", "19.png"],
//["./7Upisivanje/matBrojeviPisanje.html", "M1000 ", "20.png"],
//["./7Upisivanje/hjJedninaMnozinaKR.html", "JedMnož ", "49.png"],
//["https://www.friv4school.com/z/games/colormazepuzzle/game.html", "Boje ", "59.png"],
//["https://poki.com/en/g/bubble-sorting", "Boje ", "59.png"],
//https://plays.org/game/maze/
//["./7Upisivanje/videoizborG2.html", "Govor reč", "38.png"],
//["./6KPDaNePitanja/index.html", "DaNe parok", "21.png"],
//["./TestTematskeSlike/index_pon18.html", "Tje ", "58.png"],
//["./7Upisivanje/uMatDuljina.html", "MDulj a", "11.png"],
//["./7Knjige/2212 tramvaj.html", "ExpBooks čitanje knjiga", "55.png"],
//["./7Upisivanje/dr2301.html", "Dr01.23 govor", "69.png"],
//["./7Knjige/2302 GISKO.html", "ExpBooks čitanje knjiga", "55.png"],
//["./7Upisivanje/dr2301u.html", "Dr01.23 govor", "69.png"],
//["./7Upisivanje/priTijelou.html", "Pri23 ", "20.png"],
//["https://www.investinus.hr/7Upisivanje/dr2301g.html", "Dr01.23 govor", "20.png"],
//["./7Testiranje/pri2212.html", "Pri2212 ", "20.png"],
//["./7Upisivanje/matZbrOduz15.html", "ZbrOduz ", "41.png"],
//["./7Testiranje/mat2210.html", "MjrDulj ", "40.png"],
//["./7Knjige/2302%20SUVAGLogoped.html", "ExpBooks čitanje knjiga", "55.png"],
//["./7Knjige/2212 kukuriku_kutija.html", "ExpBooks čitanje knjiga", "55.png"],
//["https://wordwall.net/hr/resource/52297222", "DKarta 2", "51.png"],
//["./7Testiranje/mat2211.html", "MOduz", "30.png"],
//["https://wordwall.net/hr/resource/39810154/priroda-i-dru%c5%a1tvo/kosti-i-mi%c5%a1i%c4%87i#", "PTijelo 2", "49.png"],
//["./7Upisivanje/priVoda.html", "PriVoda ", "41.png"],
//["./7Testiranje/pri2211.html", "Pri2211 ", "20.png"],
//["https://wordwall.net/hr/resource/10810098/organi-za-disanje", "PDisa 2", "60.png"],
//["https://wordwall.net/hr/resource/52681577", "DPlan 2", "60.png"],
//["./R%20ObjA/indexConceptualWordsU.html", "UACatSeq ", "6.png"],
//["https://wordwall.net/hr/resource/12785550/priroda-i-dru%c5%a1tvo/ljudsko-tijelo", "PTijelo 1", "48.png"],
//["https://wordwall.net/hr/resource/31857864/gradovi-hrvatske", "DGradovi 2", "50.png"],
//["https://wordwall.net/hr/resource/13620309/dr%C5%BEave-s-kojima-grani%C4%8Di-hrvatska", "DSusjedi 2", "49.png"],
//["./R%20ObjA/indexBrojevi.html", "ABrSeq ", "7.png"],
//["https://wordwall.net/hr/resource/51886045/priroda-i-dru%c5%a1tvo/probavni-sustav", "PProba 2", "51.png"],
//["./7Upisivanje/hjJesneNijecneRecN.html", "Jesne ", "22.png"],
//["./7Upisivanje/hjUpitIzajvUsklikRec.html", "TipReč ", "23.png"],
//["./7Upisivanje/hjIjeJeIE.html", "HjIjeJe ", "21.png"],
//["./R%20ObjA/indexConceptualWords.html", "AConcSeq ", "6.png"],
//["./7Upisivanje/hjJesneiNijecne.html", "Jesne reč", "31.png"],
//["https://wordwall.net/hr/resource/23060919/priroda-i-dru%c5%a1tvo/hrvatska-i-susjedne-dr%c5%beave-4r", "DSusjedi 2", "49.png"],
//ljudsko tijelo
//["./7Testiranje/index ddz praznina.html", "HJDžiĐ reč", "32.png"],
//["./7Testiranje/index ijeje praznina.html", "HJIjeJe reč", "33.png"],
//["./6KHDiDz/indexSlike.html", "ĐiDž ", "40.png"],
//["./KH IjeJe/indexSlike.html", "IjeJe ", "41.png"],
//["./KH C.C/index.html", "ČĆ ", "42.png"],
//https://wordwall.net/hr/resource/1460065/matematika/usporedni-i-okomiti-pravci
//https://wordwall.net/hr/resource/17436081/matematika/geometrija-3r
///////////////
//["./TestTematskeSlike/index_pon18.html", "Tje ", "58.png"],
//["./6Upisivanje/indexTkoSto.html", "UTkoS test", "63.png"],
//["" + djHTML, "Razred ", "41.png"],
//["./IObitelj/index.html", "Ob ", "41.png"],
//["./6Upisivanje/hjJesneNijecneRec.html", "Ob ", "41.png"],
//["./6IGlazbeni/narodiNamSe.html", "Gl ", "40.png"],
//["./6IPriroda/6pr_vode.html", "PriVod ", "41.png"],
//["./6OpisLika/OpisLika" + (katValue + 1) + ".html", "Opis 3", "3.png"],
//["./6IPriroda/6pr_vrijeme.html", "PriSat ", "40.png"],
//["./TestUpisivanjePriroda/index5.r.html", "Pri test", "66.png"],
//["./TestSlikeRazumjevanja/index.html", "2RazumFot ", "56.png"],
//["./TestPersonalRefs/PersonalReferences" + prValue.toString() + ".html", "1PerRef ", "54.png"],
//["./TestPersonalRefs/PersonalReferences11.html", "1PerRef ", "54.png"],
//["./KT PriUmjMaterijali/index.html", "Teh ", "41.png"],
//["./KG Glazbala/index.html", "Gla ", "41.png"],
//["./R%20BrA/indexv.html", "VBrSeq ", "6.png"],
["https://wordwall.net/hr/resource/28920598/priroda-i-dru%c5%a1tvo/strane-svijeta", "PStrSvi pri", "74.png"],
//["./TestKnjigeCitanje/index.html", "ExpBooks čitanje knjiga", "55.png"],
//["https://wordwall.net/hr/resource/26682715/priroda-i-dru%c5%a1tvo/geografska-karta-strane-svijeta", "PStrSvi pri", "73.png"],
["https://wordwall.net/hr/resource/1054040/zrak-uvjet-%C5%BEivota-4razred", "Pri voda", "65.png"], 
//["https://wordwall.net/hr/resource/27031295/voda-uvjet-%C5%BEivota-4razred", "Pri voda", "65.png"], 
["https://wordwall.net/hr/resource/897727/voda-uvjet-%C5%BEivota-4razred", "PVoda pri", "66.png"],
["./TestRazumjevanja/indexACS_Visual.html", "1AFqSeq ", "64.png"],
["./TestSlikeRazumjevanja/indexMobPonavljanje.html", "CPMobN ", "56.png"],
["./R%20ObjA/indexConceptualWords.html", "ASCSeq ", "6.png"],
["./6Upisivanje/matZbMnDj.html", "Mat ", "41.png"],
["./R%20ObjA/indexObjSeq.html", "ASOSeq ", "6.png"],
["./R%20ObjA/indexObjSeqb.html", "ASOSeq ", "10.png"],
["./Citanje/index1.html", "ČitPon a", "1.png"],
["./TestRazumjevanja/indexACS_Visual.html", "1AFqSeq ", "64.png"],
["./KP%20MC2Pitanja/indexIv3U.html", "UMCPit test", "62.png"],
["./6Upisivanje/indexTkoSto.html", "UTkoS test", "63.png"],
["./TestTematskeSlike/index_pon18.html", "Tje ", "58.png"],
["./TestSlikeRazumjevanja/indexMobPonavljanje.html", "CPMobN ", "56.png"],
["./R%20ObjA/indexConceptualWords.html", "ASCSeq ", "6.png"],
//["./6Upisivanje/matZbMnDj.html", "Mat ", "41.png"],
["./R%20ObjA/indexObjSeq.html", "ASOSeq ", "6.png"],

//["./KG%20NegacijaText/index.html", "Negacija test", "24.png"],
//["./KH%20IjeJe/index.html", "Ije je", "41.png"],
//["./TestTematskeSlike/index_pon19.html", "1TSPon ", "59.png"],
//["./KG MCGlazbala/index.html", "Gl ", "41.png"],
//["./KK%20PiceHranaIgra/index.html", "KPiće hrana", "41.png"],
//["./KK%20OsobeZivotinjeBiljkeStvari/index2.html", "Knoge hrana", "41.png"],
//["./R%20BrA/index.html", "ABrSeq ", "6.png"],
//["./TestKnjigeCitanje/index.html", "ExpBooks čitanje knjiga", "55.png"],
//["./UTkoStoGdjePitanja/indexIde.html", "Pit Tko ", "64.png"],
//["./6IPriroda/6 2205 pr_otpad.html", "Pri otp", "5.png"],
//["./6Upisivanje/priVode.html", "PriVod ", "41.png"],
//["./RKarteSaMedomA/index.html", "1AObjSeq ", "8.png"],
//["./KG%20Negacija/index.html", "Negacija test", "24.png"],
//["./KP%20MC2Pitanja/index.html", "Pitanja test", "62.png"],
//["./TestSlikeRazumjevanja/indexMobPonavljanje.html", "2RFNovo ", "56.png"],
//["" + cpHTML, "Razred ", "41.png"],
//["./TestSlikeRazumjevanja/index_slike.html", "2RFotPon ", "56.png"],
//["./R%20BrA/indexAB.html", "ABSeqB ", "6.png"],
//["./TestTematskeSlike/index_pon" + lsValue.toString() + ".html", "1TSPon ", "59.png"],
//["./TestTematskeSlike/index_pon17.html", "Teh ", "59.png"],
//["./KT%20Pribor/index.html", "Teh", "41.png"],
//["./Testpjesmica/index.html", "1EBPon pjesmica", "1.png"],
//["./Test%20Razumjevanje5/index.html", "1AFqSeq ", "64.png"],
//["" + srHTML, "ASeqSl ", "6.png"],
//["./TestSlikeRazumjevanja/indexMobPonavljanje.html", "CpMobP ", "56.png"],
//["./RKarteSHelloKityA/index.html", "AKitty ", "10.png"],
//["./Citanje/index.html", "Čitanje ", "1.png"],
//["./UTkoStoGdjePitanja/indexCije.html", "Pit Cije ", "64.png"],
//["./TestUpisivanjeMat/indexa.html", "UZ012 test", "71.png"],
["./6Upisivanje/matOduzimanjePrijenos.html", "Mat test", "71.png"],
//["./6Kategorije/indexHranaZdNez.html", "Hrana instr", "5.png"],
//["./TestRazumjevanja/indexACS.html", "1AFqSeq ", "64.png"],
//["./6KMCrtanjeGeom/indexTR.html", "Geom crtanje", "22.png"],
//["./KM%20CrtanjeGeom/indexMC.html", "Geom crtanje", "22.png"],
//["" + cpHTML, "CogPh ", "56.png"],
//["./TestSlikeRazumjevanja/index_ponavljanjeskola.html", "2RFSk ", "56.png"],
//["./R%202Slova/index.html", "2SeqS ", "6.png"],
//["" + hjHTML, "6HjUp ", "41.png"],
//["./6Upisivanje/hjVelikoMaloSlovo.html", "Hj ", "41.png"],
//["./RKarteSaSnjeguljicomA/index.html", "APrinc ", "10.png"],
//["./KP%20MC2Pitanja/index3.html", "Pitanja test", "62.png"],
["./TestKnjigeCitanje/index_ponavljanje.html", "EBPon čitanje knjiga", "55.png"],
//["./KG%20Slikorjecnik/index.html", "Slike test", "24.png"],
//["./KP%20Negacija/index.html", "Negacija test", "24.png"],
//["./KM%20VeceManjeJednako100rijeci/index1.html", "Matematika <=>", "27.png"],
//["./KH%20SloziRijec/index5RijeciURec.html", "5Rec test", "41.png"],
//["./6Upisivanje/priOkolis.html", "Pri O ", "41.png"],
//["" + srHTML, "ASeqSl ", "6.png"],
//["" + pitHTML, "UPit ", "41.png"],
//["" + katHTML, "Kat ", "27.png"], 
//["./6IPriroda/priUSat.html", "USat ", "41.png"],
//["./6IPriroda/6pr_tijelo.html", "Pri tijelo", "5.png"],
//["./6IPriroda/6 2204 pr_zdravlje.html", "Pri tijelo", "5.png"],
//["./6Upisivanje/priRHZg2.html", "PriRH ", "41.png"],
//["./6Upisivanje/matGeom2.html", "UGeo ", "41.png"],
//["./6Upisivanje/hjUpitIzajvUsklikRec.html", ".?! ", "41.png"],
//["./Testiranje/index.html", "TestM ", "39.png"],
//["./Testpjesmica/index.html", "1EBPon pjesmica", "1.png"],
//["./KP%20PitanjaTkoStoGdjePisano/indexa.html", "Tko sto ", "6.png"],
//["./KK%20OsobeZivotinjeBiljkeStvari/index3.html", "KOso živ", "59.png"],
//["./TestTematskeSlike/index_pon" + lsValue.toString() + ".html", "TSPon ", "59.png"],
//["./KP%20MC2Pitanja/index2U.html", "UMCPit test", "62.png"],
//["./KH%20DiDzRijec/indexSlova.html", "Hj", "41.png"],
//["" + pisHTML, "Pis ", "37.png"], 
//["./PisanjePisanogTekstaTocke/index.html", "Pisanje ", "37.png"],
//["./TestTematskeSlike/index_pon16.html", "1TSPis ", "59.png"],
//["./KM%20ZbrajanjeDo101G11D1T/index.html", "Zbroj do 10", "28.png"],
//["./KH%20PisaneRecenice/index.html", "Pisanje rec", "41.png"],
//["./KT%20Pribor/index.html", "Teh", "41.png"],
//["./KT%20MC2Pitanja Crte/index.html", "Teh", "41.png"],
//["./KH%20C.C/index.html", "Č i Ć", "41.png"],
//["./KM%20CrtanjeGeom/index.html", "Geom crtanje", "22.png"],
//["./Testpjesmica/indexSaoniceMaleSanje.html", "1EBPon pjesmica", "1.png"],
//["./PisanjePisanogTekstaTocke/indexB.html", "Pisanje test", "37.png"],
//["./PisanjePSlovaNumeriraneTocke/index.html", "Pisanje test", "37.png"],
//["./6Testiranje/mat2205.html", "TestM ", "39.png"],
//["./6Kategorije/indexVodeTekSta.html", "Vode instr", "5.png"],
//["./6IPriroda/6pr_tijelo.html", "RH karte", "5.png"],
//["" + mtHTML, "MatPon ", "21.png"], 
//["./6KMCrtanjeGeom/indexTRMC.html", "Geom crtanje", "22.png"],
//["./6GlazInstrumenti/indexMC.html", "Gl instr", "4.png"],
//["./6Testiranje/mat2202.html", "TestM ", "39.png"],
//["./6Upisivanje/matDijeljenje.html", "Mat test", "71.png"],
//["./6Testiranje/pri2205.html", "TestP ", "39.png"],
//["https://wordwall.net/hr/resource/3293631/priroda-i-dru%c5%a1tvo/mjeseci-u-godini", "WW ", "49.png"],
//["https://rasturam.com/jesne-i-nijecne-recenice/", "Rasturam ", "50.png"], 
//["./KORazred/indexTkoJeTo.html", "Tko ", "41.png"],
//["./KK%20OsobeZivotinjeBiljkeStvari/index4.html", "KOso živ", "59.png"],
//["./6Testiranje/hj2111.html", "Test P ", "39.png"],
//["./Testiranje/index6RPSpojiTocke.html", "Spo ji", "39.png"],
//["./Testiranje/index6RHInicijalni.html", "Hj ji", "39.png"],
//["https://wordwall.net/hr/resource/29185841/priroda-i-dru%c5%a1tvo/razvrstavanje-otpada", "Otpad 1 ", "39.png"],
//["https://wordwall.net/hr/resource/1115710/priroda-i-dru%c5%a1tvo/razvrstavanje-otpada", "Otpad 2 ", "40.png"],
//["https://wordwall.net/hr/resource/16707744/priroda-i-dru%c5%a1tvo/zdenko-slovojed-pojeo-je-rije%c4%8di-koje", "Ljeto P ", "41.png"],
//["https://wordwall.net/hr/resource/564088/priroda-i-dru%c5%a1tvo/ljeto", "Ljeto P ", "42.png"],
//["https://wordwall.net/hr/resource/3266178/priroda-i-dru%c5%a1tvo/ljeto", "Ljeto P ", "43.png"],
//["./KK%20kategorije/indexMuZe.html", "KMŽ živ", "60.png"],
//["./KK%20kategorije/indexOsiliDvOs.html", "KJedMno živ", "63.png"],
["./KG NegacijaText/index.html", "Neg text", "57.png"],
["./6IPriroda/6 2207 TBF-Pas.html", "Pjes ma", "60.png"],
["./KK%20kategorije/indexMuZeSr.html", "KMŽS živ", "61.png"],
["./KP%20RecenicniZnakovi1G3D1T/index.html", "RečZ znakovi", "22.png"],
["./KK%20kategorije/indexOsBiZiSt.html", "KOsBi živ", "62.png"],
["./Citanje/index1.html", "ČitPon a", "1.png"],
//["./KK%20kategorije/index024Noge.html", "KNoge živ", "59.png"],
//["./KK%20kategorije/indexPiHrIgMoVo.html", "KStv živ", "64.png"],
//["./KM%20ZbrajanjeDo101G11D1T/index.html", "Zbroj do 10", "28.png"],
//["./KM%20SiDiJ/index.html", "Stot test", "26.png"],
//["" + katHTML, "Kateg živ", "21.png"],
//["./6OpisLika/OpisLika4.html", "Opis 4", "2.png"],
//["./KT5TipoviCrta/PronadiOpis.html", "Tehn ", "54.png"],
//["./KT5MC2Pitanja Crte/index.html", "Tehn ", "54.png"],
//["./KT5Pribor/index.html", "Tehn ", "54.png"],
//["./KT5PriUmjMaterijali/index.html", "Tehn ", "54.png"],
//["./TestPersonalRefs/PersonalReferences" + prValue.toString() + ".html", "1PerRef ", "54.png"],
//["./KP%20MC2Pitanja/index2.html", "Pitanja test", "62.png"],
//["./KP%20DaNePitanja/index.html", "DaNe test", "74.png"],
//["./Testiranje/index.html", "TestM ", "39.png"],
//["./KM VeceManjeJednako100rijeci/index2.html", "Matematika <=>", "27.png"],
//["./Testiranje/index1.html", "TestM ", "39.png"],
//["./TestTematskeSlike/index_pon16.html", "1TemSlike ", "58.png"],
//["./KK%20PiceHranaIgra/index.html", "KPiće hrana", "41.png"],
//["./TestTematskeSlike/index_pon17.html", "Teh ", "59.png"],
//["./PisanjePisanogTekstaLinije/index2.html", "Pisanje test", "37.png"],
//["./TestUpisivanje/indexHJ 5-1.html", "UpHJ slova", "37.png"],
//["./PisanjePisanihSlovaNumeriraneTocke/index.html", "Pisanje test", "37.png"],
//["./TestUpisivanjePriroda/index.html", "UpPri roda", "70.png"],
//["./Testiranje/index.html", "Test P ", "39.png"],
//["./KM VeceManjeJednako100rijeci/index1.html", "Matematika <=>", "27.png"],
//["https://wordwall.net/hr/resource/30096061/priroda-i-dru%c5%a1tvo/zagreb-i-republika-hrvatska", "RH1 test", "26.png"],
//["https://wordwall.net/hr/resource/2704815/priroda-i-dru%c5%a1tvo/republika-hrvatska-i-susjedne-zemlje", "Karta1 test", "27.png"],
//["https://wordwall.net/hr/resource/1245379/republika-hrvatska-i-susjedne-zemlje", "Karta2 test", "28.png"],
//["https://wordwall.net/hr/resource/291646/republika-hrvatska-i-susjedne-zemlje", "Karta3 test", "29.png"],
//["./KP%20RecenicniZnakovi1G3D1T/index.html", "Znak test", "72.png"],
//["./KM%20SiDiJ/index.html", "Desetice test", "26.png"],
//["./KH%20FaliSlovo/index.html", "Popuni test", "25.png"],
//["./KP%20PitanjaTkoStoGdjePisano/indexa.html", "Pitanja pitanja i odgovori", "62.png"],
//["./KM%20VeceManjeJednako100/index.html", "VeceManje test", "27.png"],
//["./TestUpisivanje/index1.html", "U4sl test", "66.png"],
//["./TestUpisivanjeMat/index7.html", "UZ10 test", "71.png"],
//["./KM%20JSKMjesto/index.html", "Mjesto test", "73.png"],
//["./KH%20SloziRijec/index.html", "SRij test", "41.png"],
//["./KH%20SloziRijec/index1.html", "SRec test", "41.png"],
//["./TestiranjeLavirint/index.html", "Upis test", "67.png"],
//["./KC%20Djeca1-44G6D1T VPisano/index.html", "Čitanje indirektno - osobe", "3.png"],
//["./KP%20DaNePitanja/index.html", "DaNe test", "74.png"],
//["./KP%20DaniMC/index.html", "Učenje dani u tjednu", "41.png"],
//["./TestUpisivanjeGeometrija/index.html", "MGeom ike", "70.png"],
//["./TestUpisivanjeMat/indexfinala.html", "Mat test", "71.png"],
//["./Kinect%20VideoTest/index.html", "Video test", "68.png"],
//["./TestRazgovorChrome/index.html", "Chrome ", "65.png"],
["KM ZbrajanjeOduzimanje/index.html", "Mat zbroj ", "27.png"],
["./TestUpisivanje/index7A.html", "URecA test", "65.png"],
//["./UTkoStoGdjeGovor/indexIdeU.html", "Chrome ", "65.png"],
//["./UTkoStoGdjeGovor/indexSlike.html", "Chrome ", "65.png"],
//["./6Upisivanje/priJesenGovor.html", "Chrome ", "65.png"],
//["./PisanjePisanogTekstaLinije/index.html", "Pisanje test", "37.png"],
["./KM%20JSKMjesto/index.html", "Mjesto test", "73.png"],
["./UTkoStoGdjePitanja/indexIde.html", "Upis test", "65.png"],
//["./TestUpisivanjePrometniZnakovi/index.html", "PromZ ike", "70.png"],
["./Testpjesmica/index1.html", "1EBPon pjesmica", "1.png"],
["./KP%20PitanjaTkoStoGdjePisano/index1a.html", "Upis1 Pitanja ", "62.png"],
["./KM%20JSKMjesto/index.html", "Mjesto test", "73.png"],
["./KP%20PitanjaTkoStoGdjePisano/index.html", "Upis Pitanja ", "62.png"]
["./Kinect%20VideoTest/index.html", "Video test", "68.png"],
["./KM%20PrstiDo10/index.html", "Prsti test", "31.png"],
["./PisanjeTekstaLinije/index.html", "Pisanje test", "37.png"],
["./KM%203ili4Ili5GoreTocke1G2D1T/index.html", "Matematika 3,4,5 točke", "19.png"],
["./TestUpisivanjeSlike/index.html", "UpisSl ike", "70.png"],
["./TestUpisivanje/index7.html", "URec test", "66.png"],
["./PisanjeSlovaNumeriraneTocke/index.html", "Pisanje test", "37.png"],
["./TestUpisivanje/index1.html", "Upis1 test", "66.png"],
["./TestUpisivanje/index5.html", "Upis5 test", "65.png"],
["./TestUpisivanje/index3.html", "Upis3 test", "65.png"]
];

/*

//["./TestTematskeSlike/index_pon" + Math.round(Math.random() * 15) + ".html", "1TSPon ", "59.png"],
//["./TestUpisivanjeMat/index6.html", "UZ34 test", "71.png"],
//["./PisanjeTekstaLinije/index.html", "Pisanje test", "36.png"],
//["./TestUpisivanjeMat/indexa.html", "UZ012 test", "71.png"],
//["./KP%20Pitanja1-15G4D1TPisano/index.html", "Učenje pitanja i odgovori", "46.png"],
//["./TestiranjeLavirint/index.html", "Upis test", "67.png"],
//["./TestUpisivanje/index7A.html", "URecA test", "65.png"],
//["./KC%20KarteSaMedom1-30G10D1T VPisano/index.html", "Čitanje indirektno - karte sa medom", "2.png"],
//["./KC%20Djeca1-44G6D1T VPisano/index.html", "Čitanje indirektno - osobe", "3.png"],
//["./TestRazgovorChrome/index.html", "Chrome ", "65.png"],
//["./R%20BrA/index1.html", "1ABrSeq ", "6.png"],
//["./RKarteSaMedomA/index1.html", "MedoA ", "8.png"],
//["./RKarteSaSnjeguljicomA/index.html", "PrinA ", "8.png"],
//["./TestGlazbeni/index.html", "Glazbeni pjesme", "64.png"],
//["./Testiranje/index1.html", "TestM ", "39.png"],
//["./TestUpisivanje/index6A.html", "U4slA test", "65.png"],
//["./TestUpisivanjeMat/index.html", "UMZ012 test", "71.png"],
//["./TestUpisivanjeMat/index1.html", "UMatZ3 test", "71.png"],
//["./TestUpisivanjeMat/index2.html", "UO123 test", "71.png"],
//["./KP%20PitanjaTkoStoGdjePisano/index1.html", "Upis1 Pitanja ", "62.png"],
//["./KP%20PitanjaTkoStoGdjePisano/index.html", "Upis Pitanja ", "62.png"]

["./TestiranjeCrtanje/index.html", "Upis test", "68.png"],
["./TestiranjeCrtanje/index.html", "Upis test", "68.png"],
["./TestiranjeCrtanje/index.html", "Upis test", "68.png"],
["./TestUpisivanje/index6A.html", "Upis test", "66.png"],
["./TestUpisivanje/index5A.html", "Upis5A test", "65.png"],
["./TestUpisivanje/index3A.html", "Upis3A test", "65.png"],
["./TestUpisivanje/index6A.html", "Upis6A test", "65.png"],
["./TestiranjeLavirint/index.html", "Lavirint test", "67.png"],
["./PisanjeTekstaLinije/index.html", "Pisanje test", "36.png"],
["./PisanjeTekstaSlike/index.html", "Pisanje test", "37.png"],
["./KP%20PitanjaTkoStoGdjePisano/index1a.html", "A Pitanja ", "62.png"],
["./KP%20PitanjaTkoStoGdjePisano/indexa.html", "1A Pitanja ", "62.png"],
["./Test%20Razumjevanje" + Math.round(Math.random() * 3) + "/index.html", "RazumČitanja ", "52.png"],
["./PisanjeZnakova4/index.html", "Pisanje riječi linije", "36.png"],
["./TestGlazbeni/index.html", "Glazbeni pjesme", "64.png"],
["./Testiranje/index1.html", "TestM ", "39.png"],
["./Testiranje/index1.html", "TestM ", "39.png"],
["./TestTematskeSlike/index_cvijece.html", "1TemSlike ", "58.png"],
["./TestTematskeSlike/index_mlinar.html", "1TemSlike ", "59.png"], 
["./TestMatematikaPred/index.html", "3PreMath ", "60.png"],
["./TestMatematikaP1/index.html", "3MathP1 ", "60.png"],
["./Citanje/index_test.html", "ČitTst ", "1.png"],
["./RKarteSaMedomA/index.html", "MedoA ", "8.png"],
["./RKarteSaSnjeguljicomA/index.html", "PrinA ", "8.png"],
["./Test%20Razumjevanje0/index.html", "RazumČitanja ", "52.png"],
["./TestiranjePisanje/index.html", "SpontSkript ", "53.png"],
["./Testiranje/index.html", "TestiranjeH ", "39.png"],
["./Testiranje/index1.html", "TestiranjeM ", "39.png"],
["./KP%20PitanjaTkoStoGdjePisano/index.html", "TGSPitanja ", "62.png"],
["./KP%20 PitanjaTkoStoGdjePisano/indexKakav.html", "Kakav Pitanja ", "62.png"],
["./KP%20PitanjaTkoStoGdjePisano/indexKakva.html", "Kakva Pitanja ", "62.png"],
["./TestKnjigeCitanje/index_ponavljanje.html", "1EBPon čitanje knjiga", "55.png"],
["./CitanjePrica/index.html", "Citanje prica", "57.png"],
["./PisanjeZnakova3/index.html", "Pisanje slova linije", "33.png"],
["./PisanjeZnakova4/index.html", "Pisanje riječi linije", "36.png"],
["./PisanjeZnakova2/index.html", "Pisanje slova točke", "32.png"],
["./KP%20Radnje1-15G4D1T/index.html", "Učenje radnje", "50.png"],
["./KM%20JSKMjesto/index.html", "Učenje mjesto u prostoru", "23.png"],
["./KP%20 Emocije1-8G5D1T/index.html", "Učenje emocije", "44.png"],
["./RKarteSaSnjeguljicomAV/index.html", "Koncept Snjeguljica", "10.png"],
["./RKarteSaMedomVN/index.html", "Koncept N medo", "9.png"],
["./PisanjeZnakovaSlike/index.html", "Pisanje riječi točke", "35.png"],
["./KM%20ZbrajanjeDo5 1G3D1T/index.html", "Matematika zbrajanje do 5", "29.png"],
["./KM%203ili4Ili51G3D1T/index.html", "Matematika 3,4,5", "16.png"],
["./PisanjeZnakovaSlovaSlike/index.html", "Pisanje slova slike", "34.png"],
["./PisanjeZnakovaSlike/index.html", "Pisanje riječi slike", "37.png"],
["./KM PribrojiJedan1G3D1T/index.html", "Matematika pribroji 1", "26.png"],
["./KM ZbrajanjeDo101G11D1T/index.html", "Matematika zbrajanje do 10", "28.png"],
["./KM ZbrajanjeDo5 1G3D1T/index.html", "Matematika zbrajanje do 5", "29.png"],
["./KM 3ili4Ili5GoreTocke1G2D1T/index.html", "Matematika 3,4,5 točke", "19.png"],
["./KM OtvoreneIliZatvoreneCrte1G5D3T/index.html", "Matematika otvorene i zatvorene linije", "25.png"],
["./KM VeceManjeJednako1G3D1T/index.html", "Matematika <=>", "27.png"],
["./KM ZOduzimanjeDo5 1G3D1T/index.html", "Matematika oduzimanje do 5", "30.png"],
["./PisanjeZnakovaSlike/index mat.html", "Pisanje matematike slike", "38.png"],
["./KP GodisnjaDoba1G7D2T/index.html", "Učenje godišnja doba - zima", "45.png"],
["./KP Promet2G4D2T/index.html", "Učenje promet", "49.png"],
["./KM Negacija1G8D4T/index.html", "Učenje negacija", "24.png"],
["./TestiranjeAudio/index.html", "Testiranje audio", "40.png"],
["./KP TkoSPavaZimi2G6D3T/index.html", "Učenje zimski san", "51.png"],
["./KM BrojanjeDoPet5G6D6T/index.html", "Matematika 1,2,3,4,5", "20.png"],
["./KM JedanIliDva2G8D4T/index.html", "Matematika 1 ili 2", "21.png"],
["./KM GeometrijskaTijela1-4G7D1T/index.html", "Matematika geometrijaska tijela", "22.png"],
["./RRijeciV/index.html", "Koncept riječi", "12.png"],
["./RSlovaA/index.html", "Koncept N slova", "13.png"],
["./KS Boje6G6D/index.html", "Učenje slaganje boja", "14.png"],
["./KS BojeZadano8D8G/index.html", "Učenje slaganje boja", "15.png"],
["./RAutiAV/index.html", "Koncept auti", "4.png"],
["./RAutiAVN/index.html", "Koncept N auti", "5.png"],
["./RBrojeviVN/index.html", "Koncept N brojevi", "7.png"],
["./KP Kalendar12G12D/index.html", "Učenje mjeseci ugodini", "47.png"],
["./KP LosePonasanje1G7D3T/index.html", "Učenje loše ponašanje", "48.png"],
["./KP Dani7G7D/index.html", "Učenje dani u tjednu", "41.png"],
["./KP DobroIliLosePonasanje2G5D2T/index.html", "Učenje dobro i loše ponašanje", "42.png"],
["./KP DobroPonasanje1G5D4T/index.html", "Učenje dobro ponašanje", "43.png"],
["./RZastaveAV/index.html", "Koncept zastave", "11.png"],
["./RZastaveAVN/index.html", "Koncept N zastave", "17.png"],*/
/*
lsValue = lsValue + 1;
localStorage.setItem("TestTematskeSlikeBr", lsValue.toString());
prValue = prValue + 1;
localStorage.setItem("PersonalRefsBr", prValue.toString());
srValue = srValue + 1;
localStorage.setItem("PicSeqBr", srValue.toString());
katValue = katValue + 1;
localStorage.setItem("KatBr", katValue.toString());
cpValue = cpValue + 1;
localStorage.setItem("CogPhtsSeqBr", cpValue.toString());
mtValue = mtValue + 1;
localStorage.setItem("mtPrep", mtValue.toString());
hjValue = hjValue + 1;
localStorage.setItem("hjPrep", hjValue.toString());
*/
