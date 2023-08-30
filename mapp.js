var inputClick = 0;
function MMouse_down(e) {
    //e.preventDefault();
    //e.stopPropagation();
    MStartEvent(e.clientX, e.clientY);
}
function MTouch_start_gesture(e) {
    //e.preventDefault();
    //e.stopPropagation();
    // get the current mouse position
    if (e.touches.length === 1) {
        var touch = e.touches[0];
    }
    else {
        return;
    }
    MStartEvent(touch.pageX, touch.pageY);
}
function MStartEvent(x, y) {
    //console.log("StartEvent: x:" + x + ", y:" + y + " counter:" + a.counter);
    //provjeri da li se trazi selekcija videa
    if (mm.waitForVideoSelection) {
        mm.waitForVideoSelection = false;
      
        mm.startRightVideo(x, y);
    }
}
function InputClick()
{
    inputClick = inputClick + 1;
}
function Provjeri()
{
    if(inputClick > 3)
    {
        leavePage = true;
        mm.numberOfFalseAnswers = -1;
        mm.retriesBeforeReward = 0;
        mm.OK();
    }
    else
    {
        leavePage = true;
        mm.NOK();
    }

    inputClick = 0;
}
function MStart()
{
    location.reload;
}
window.onload = function () {
    window.addEventListener('touchstart', MTouch_start_gesture, true);
    window.addEventListener('mousedown', MMouse_down, false);
    mm = new MM(null);
    //true - ne čekaj korisnički dodir ekrana 
    //Start(true);
}
