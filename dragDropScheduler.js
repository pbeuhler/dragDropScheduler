var lotInfoDB;
var oReq = new XMLHttpRequest();
oReq.open("GET", "./448.db", true);
oReq.responseType = "arraybuffer";
oReq.onload = function(e) {
  var uInt8Array = new Uint8Array(this.response);
    classDB = new SQL.Database(uInt8Array);
};
oReq.send();

var semestersArray = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
var notInDatabase = ['KUCore1', 'KUCore2', 'KUCore3', 'KUCore4', 'Tech1', 'KUCore5', 'Tech2', 'Tech3', 'KUCore6'];

function getChildren(divID) {
  var div = document.getElementById(divID);
  var children = div.childNodes;
  var elements = [];
  for (var i = 0; i < div.childNodes.length; i++) {
    var child = div.childNodes[i];
    elements.push(child.id);
  }
  elements.shift();
  return elements;
}

function dragStart(ev) {
   ev.dataTransfer.effectAllowed='move';
   ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
   ev.dataTransfer.setDragImage(ev.target,0,0);
   return true;
}

function allowDrop(ev) {
  ev.preventDefault();
  //info();
}
  function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
  var prereqsMet = checkPrerequisitesMet(document.getElementById(data).id);
  var coreqsMet = checkCorequisitesMet(document.getElementById(data).id);
  var semesterRight = checkSemesters(document.getElementById(data).id);

  console.log(document.getElementById(data).id);
  console.log(prereqsMet);
  console.log(coreqsMet);
  console.log(semesterRight);
  console.log("-------------------------");
}

function getValue(colVal, id) {
  var val = classDB.exec("SELECT " + colVal + " FROM project WHERE ID='" + id +"'");
  return (val[0].values[0][0]);
}

function checkSemesters(courseID) {
  for (i in notInDatabase) {
    if (courseID == notInDatabase[i]) {
      return true;
    }
  }
  //returns false if the course is not offered in the attempted semester, true otherwise
  var semestersOffered = getValue('Semesters', courseID);
  var curSemester = document.getElementById(courseID).parentNode.id;
  var season = '';
  if ((curSemester == 's1') || (curSemester == 's3') || (curSemester == 's5') || (curSemester == 's7')) {
    season = 'fall';
  }
  else {
    season = 'spring';
  }
  if ((season=='fall') && (semestersOffered[0] == 0)) {
    return false;
  }
  if ((season=='fall') && (semestersOffered[0] == 1)) {
    return true;
  }
  if ((season=='spring') && (semestersOffered[1] == 0)) {
    return false;
  }
  if ((season=='spring') && (semestersOffered[1] == 1)) {
    return true;
  }
}

function checkCorequisitesMet(courseID) {
  for (i in notInDatabase) {
    if (courseID == notInDatabase[i]) {
      return true;
    }
  }

  var corequisites = getValue('Corequisites', courseID);
  var curSemester = document.getElementById(courseID).parentNode.id;
  if (corequisites == '-') {
    return true;
  }
  var coreqArray = [corequisites];
  if (corequisites.indexOf('+') > -1) {
    coreqArray = coreqArray.split('+');
  }

  var coreqMetFlag = false;
  var semesterCourses = [];
  for (i in coreqArray) {
    for (j in semestersArray) {
      if (semestersArray[j] > curSemester) {
        break;
      }
      semesterCourses = getChildren(semestersArray[j]);
      for (k in semesterCourses) {
        for (l in coreqArray) {
          if (coreqArray[l] == semesterCourses[k]) {
            coreqMetFlag = true;
            return true;
          }
        }
      }
    }
  }
  if (coreqMetFlag == false) {
    return coreqArray;
  }
  else {
    return true;
  }
}

function checkPrerequisitesMet(courseID) {
  //Only works if course div is in its semester to be checked
  //Returns a 2d array of prerequisites/corequisites if not met
  //several lazy shortcuts so if the database is updated we'll need to go through this again
  for (i in notInDatabase) {
    if (courseID == notInDatabase[i]) {
      return true;
    }
  }

  var prerequisites = getValue('Prerequisites', courseID);
  var curSemester = document.getElementById(courseID).parentNode.id;

  if (prerequisites == '-') {
    return true;
  }

  var prereqType = '';
  var prereqArray = [];
  var metArray = [];
  if (prerequisites.indexOf('+') > -1) {
    prereqArray = prerequisites.split('+');
    prereqType = '+';
  }
  if (prerequisites.indexOf('&') > -1) {
    prereqArray = prerequisites.split('&');
    prereqType = '&';
  }
  if (prereqType == '') {
    prereqArray = [prerequisites];
    prereqType = '+';
  }
  var prereqMetFlag = false;
  var orFlag = false;
  for (i in prereqArray) {
    for (j in semestersArray) {
      if ((semestersArray[j] >= curSemester) && (prereqMetFlag == false)) {
        break;
      }
      semesterCourses = getChildren(semestersArray[j]);
      for (k in semesterCourses) {
        if (prereqArray[i] == semesterCourses[k]) {
          metArray.push(semesterCourses[k]);
          orFlag = true;
        }
      }
    }
  }
  if ((metArray.length == prereqArray.length) && (prereqType == '&')) {
    prereqMetFlag = true;
  }
  if (prereqType == '+') {
    prereqMetFlag = orFlag;
  }
  if (prerequisites == 'senior') {
    if ((document.getElementById(courseID).parentNode.id == 's7') || (document.getElementById(courseID).parentNode.id == 's8')) {
      prereqMetFlag = true;
    }
  }
  if (prerequisites == '-') {
    prereqMetFlag = true;
  }
  if (prereqMetFlag) {
    return true;
  }
  else {
    var notMetArray = [];
    var metFlag = false;
    for (i in prereqArray) {
      metFlag = false;
      for (j in metArray) {
        if (prereqArray[i] == metArray[j]) {
          metFlag = true;
        }
      }
      if (metFlag == false) {
        notMetArray.push(prereqArray[i]);
      }
    }
    return notMetArray;
  }
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
