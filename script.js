function:showtime(){
    document.getElementById("time").innerHTML = new Date().toUTCString();
}
showtime();
setInterval(function(){
    showtime();
}
, 1000);