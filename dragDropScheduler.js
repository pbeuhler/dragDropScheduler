function dragStart(ev) {
   ev.dataTransfer.effectAllowed='move';
   ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
   ev.dataTransfer.setDragImage(ev.target,0,0);

   return true;
}

function allowDrop(ev) {
ev.preventDefault();
info();
}
function drag(ev) {
ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
ev.preventDefault();
var data = ev.dataTransfer.getData("text");
ev.target.appendChild(document.getElementById(data));
}

function h(){
var start = document.getElementById("first").value;
var end = document.getElementById("last").value;

if(start > end || start < 2014){
   alert("Incorrect inputs in Semester Generator section");
 }
 //else{
   //var x = (end - start)*2;
   //while(x!=0){
   //document.open();
   //window.document.write("<p>pasopa</p>")
   //var btn = document.getElementById("s1").innerHTML = "Fall 2018";
   //document.write("<h1>hola</h1>");
   //x = x-1;
   //}
 //document.close();
 //}
}
