(function(){
    var pos = {x:800, y:500};
    var signinWin = window.open("/auth/facebook", "SignIn", "width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + pos.x + ",top=" + pos.y);
    setTimeout(function(){}, 2000);
    signinWin.focus();
    return false;
})();