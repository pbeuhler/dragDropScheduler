//Team 6 Aerospace Course Planner Website
//Written by John Freeman
//Debugged by John Freeman
//Tested by John Freeman

//Initialize the database for use in javascript via sql.js
//Sourced from https://github.com/kripken/sql.js/
//Used under MIT License copyright
var lotInfoDB;
var oReq = new XMLHttpRequest();
oReq.open("GET", "https://people.eecs.ku.edu/~jfreeman67/Lab5/448.db", true);
oReq.responseType = "arraybuffer";
oReq.onload = function(e) {
  var uInt8Array = new Uint8Array(this.response);
    classDB = new SQL.Database(uInt8Array);
};
oReq.send();

//Global arrays for use in logic
var semestersArray = ['Prereqs', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']; //all the semesters including the already met
var dropArr = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']; //all the semesters not including already met
var notInDatabase = ['KUCore1', 'KUCore2', 'KUCore3', 'KUCore4', 'Tech1', 'KUCore5', 'Tech2', 'Tech3', 'KUCore6']; //all the generic electives
var unmet = []; //courses with unmet pre/coreqs

//returns an array containing the ids of children of a passed div ID
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

//handles html drag functionality
function dragStart(ev) {
   ev.dataTransfer.effectAllowed='move';
   ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
   ev.dataTransfer.setDragImage(ev.target,0,0);

}

//handles html drop functionality
function allowDrop(ev) {
  ev.preventDefault();
  //info();
}

//displays course info, refreshes the highlighting of courses
function hover(ev) {
  refresh();
  refreshWhite();
  divId = ev.getAttribute('id');
  //if the course is an elective, set the color to green
  for (i in notInDatabase) {
    if (divId == notInDatabase[i]) {
      document.getElementById(divId).style = "background:PaleGreen";
      return true;
    }
  }
  
  //update the info box
  document.getElementById('Info').children[0].innerHTML = getValue('Name',divId);
  document.getElementById('Info').children[1].innerHTML = "<br />" + getValue('Description',divId);
  
  //logic for checking pre and corequisites
  notMetPreArray = checkPrerequisitesMet(divId);
  notMetCoArray = checkCorequisitesMet(divId);
  
  //special logic for AE 590
  if (getValue("Prerequisites", divId) == 'senior') {
    if ((document.getElementById(divId).parentNode.id == 'Required') || (document.getElementById(divId).parentNode.id == 'Prereqs') || (document.getElementById(divId).parentNode.id == 's7')) {
      document.getElementById(divId).style = "background:PaleGreen";
      return true;
    }
    else {
      return true;
    }
  }
  
  //if prereqs and coreqs met
  if ((notMetPreArray == true) && (notMetCoArray == true)) {
    document.getElementById(divId).style = "background:PaleGreen";
    return true;
  }
  
  //if coreqs not met
  else if (notMetPreArray == true) {
    document.getElementById(divId).style = "background:IndianRed";
    for (i in notMetCoArray) {
      document.getElementById(notMetCoArray[i]).style = "background:Wheat";
    }
  }
  
  //if prereqs not met
  else if (notMetCoArray == true) {
    document.getElementById(divId).style = "background:IndianRed";
    for (i in notMetPreArray) {
      document.getElementById(notMetPreArray[i]).style = "background:Pink";
    }
  }
  
  //if both not met
  else {
    document.getElementById(divId).style = "background:IndianRed";
    for (i in notMetPreArray) {
      document.getElementById(notMetPreArray[i]).style = "background:Pink";
    }
    for (i in notMetCoArray) {
      document.getElementById(notMetCoArray[i]).style = "background:Wheat";
    }
  }
}

//out of date, currently no use
function leave(ev) {
  // divId = ev.getAttribute('id');
  // for (i in notInDatabase) {
  //   if (divId == notInDatabase[i]) {
  //     document.getElementById(divId).style = "background:white";
  //     return true;
  //   }
  // }
  // document.getElementById(divId).style = "background:white";
  // notMetPreArray = checkPrerequisitesMet(divId);
  // notMetCoArray = checkCorequisitesMet(divId);
  // if (notMetCoArray != true) {
  //   for (i in notMetCoArray) {
  //     document.getElementById(notMetCoArray[i]).style = "background:white";
  //   }
  // }
  // if (notMetCoArray != true) {
  //   for (i in notMetPreArray) {
  //     document.getElementById(notMetPreArray[i]).style = "background:white";
  //   }
  // }
}

//handles drag functionality
function drag(ev) {
	dragStart(ev);
  ev.dataTransfer.setData("text", ev.target.id);
}

//refreshes changing backgrounds from red to white, removes values from not met array as necessary
function refresh() {
  var prereqs = 0;
  var coreqs = 0;
  var index = 0;
  var splicedFlag = false;
  for (iters in unmet) {
    prereqs = checkPrerequisitesMet(unmet[iters]);
    coreqs = checkCorequisitesMet(unmet[iters]);
	//if prereqs and coreqs are met or the parent is required or the parent is already met
    if (((prereqs == true) && (coreqs == true)) || (document.getElementById(unmet[iters]).parentNode.id == "Required") || (document.getElementById(unmet[iters]).parentNode.id == "Prereqs")) {
      document.getElementById(unmet[iters]).style = "background:white";
      unmet.splice(iters,1);
      splicedFlag = true;
      iters = 10000;
    }
  }
  if (splicedFlag == true) {
    refresh();
  }
}

//refreshes the global array of all courses that are in a semester and don't have their prereqs met
function refreshUnmetArray() {
  var curArray = [];
  var prereqsMet = [];
  var coreqsMet = [];
  var data = "";
  //iterate through the semesters
  for (unmetIters in dropArr) {
	  //get the courses in the semester
    curArray = getChildren(dropArr[unmetIters]);
	//iterate through courses
    for (childIter in curArray) {
      data = curArray[childIter];
      prereqsMet = checkPrerequisitesMet(data);
      coreqsMet = checkCorequisitesMet(data);
	  //if prereqs or coreqs are not met
      if ((prereqsMet != true) || coreqsMet != true) {
        document.getElementById(data).style = "background:IndianRed";
		//if the course is not in the unmet database and should be, add it to the array
        if (!(unmet.indexOf(document.getElementById(data).id) > -1)) {
          if ((document.getElementById(document.getElementById(data).id).parentNode.id != 'Required') && (document.getElementById(document.getElementById(data).id).parentNode.id != 'Prereqs')) {
            unmet.push(document.getElementById(data).id);
          }
        }
      }
    }
  }
}

//refreshes the number of hours displayed in the semesters and their highlighting
function refreshSemesterHours() {
  var currentTitle = "";
  var lastNum = 0;
  var credits = 0;
  for (semesterIters in dropArr) {
    credits = getCreditsSemester(dropArr[semesterIters]);
    currentTitle = document.getElementById(dropArr[semesterIters]).children[0].innerHTML;
    if (credits > 19) {
      document.getElementById(dropArr[semesterIters]).children[0].style = "background:DarkOrange";
    }
    else {
      document.getElementById(dropArr[semesterIters]).children[0].style = "background:#3366ff";
    }
    lastNum = 0;
    for (titleIter in currentTitle) {
      if ((!(isNaN(currentTitle[titleIter]))) && (currentTitle[titleIter] != " ")) {
        lastNum = currentTitle[titleIter];
        currentTitle = currentTitle.substring(0,titleIter);
        break;
      }
    }
    currentTitle = currentTitle + lastNum.toString() + " (" + credits.toString() + " Cr)";
    document.getElementById(dropArr[semesterIters]).children[0].innerHTML = currentTitle;
  }
}

//iterates through draggables and resets them to white unless they are in the unmet array on drop or hover leave
function refreshWhite() {
	//get all the semesters
  var x = document.querySelectorAll("*[draggable=true]");
    for (whiteIter in x) {
      if ((typeof x[whiteIter]) == 'object') {
		  //if not unmet and the semester placement is valid, make it white, otherwise make it red, or gold if pre/coreqs met and semester is invalid
        if ((!(unmet.indexOf(x[whiteIter].id) > -1) && (checkSemesters(x[whiteIter].id) == true))) {
          x[whiteIter].style = "background:white";
        }
        else if (checkSemesters(x[whiteIter].id) == false) {
          x[whiteIter].style = "background:gold";
        }
        else {
          x[whiteIter].style = "background:IndianRed";
        }

      }
    }
}

//drop functionality, handles checking if the semester is valid, refreshing, updating info, etc.
function drop(ev) {
	//initialize logic variables
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  var targetDiv = ev.target;
  var firstFlag = false;
  var parentFlag = false;
  //make sure the course appends to the right parent
  for (checkIter in semestersArray) {
    if (targetDiv.id == semestersArray[checkIter]) {
      firstFlag = true;
    }
    if ((targetDiv.parentNode.id == semestersArray[checkIter]) || (targetDiv.parentNode.id == 'Required')) {
      parentFlag = true;
    }
  }
  //special logic for dropping into required div
  if (targetDiv.id == "Required") {
    targetDiv.appendChild(document.getElementById(data));
	//refresh course coloring
    refresh();
    refreshSemesterHours();
    refreshUnmetArray();
    refreshWhite();
	//update info box
    document.getElementById('Info').children[0].innerHTML = getValue('Name',data);
    document.getElementById('Info').children[1].innerHTML = "<br />" + getValue('Description',data);
    return true;
  }
  //set target to parent of target if necessary, otherwise break
  if (firstFlag == false) {
    if (parentFlag == true) {
      targetDiv = targetDiv.parentNode;
    }
    else {
      return false;
    }
  }
  //refresh coloring
  targetDiv.appendChild(document.getElementById(data));
  refresh();
  refreshSemesterHours();
  refreshUnmetArray();
  refreshWhite();
  //get course requirement info
	var prereqsMet = checkPrerequisitesMet(document.getElementById(data).id);
	var coreqsMet = checkCorequisitesMet(document.getElementById(data).id);
	var semesterRight = checkSemesters(document.getElementById(data).id);
	var credits = getCreditsSemester(targetDiv.id);
  notFlag = false;
  //if the course is an elective, don't update the info
  for (i in notInDatabase) {
    if (divId == notInDatabase[i]) {
      notFlag = true;
    }
  }
  if (notFlag == false) {
    document.getElementById('Info').children[0].innerHTML = getValue('Name',data);
    document.getElementById('Info').children[1].innerHTML = "<br />" + getValue('Description',data);
  }
  //if semester is invalid, make the background gold
  if (semesterRight == false) {
    document.getElementById(data).style = "background:gold";
  }
  //if the semester is valid, check pre/coreqs and color accordingly
  else {
    if (unmet.indexOf(document.getElementById(data).id) > -1) {
      document.getElementById(data).style = "background:IndianRed";
    }
    else {
      document.getElementById(data).style = "background:white";
    }
  }
  // console.log(document.getElementById(data).id);
  // console.log("coreqs: " + coreqsMet);
  // console.log("prereqs: " + prereqsMet);
  // console.log("------------------");
}


//returns the number of credits in a given semester
function getCreditsSemester(divID) {
  var semesterCourses = getChildren(divID);
  var totalCredits = 0;
  for (i in semesterCourses) {
    if (getValue('Credits', semesterCourses[i]) == null) {
      totalCredits += 3;
    }
    else {
      totalCredits += parseInt(getValue('Credits', semesterCourses[i]));
    }
  }
  return totalCredits;
}

//queries the database based on an id and a column name, returns a value or null
function getValue(colVal, id) {
  //returns null if there is an error
  val = classDB.exec("SELECT " + colVal + " FROM project WHERE ID='" + id +"'");
  try {
    return (val[0].values[0][0]);
  }
  catch(err) {
    return null;
  }
}

//check if the semester placed in is valid
function checkSemesters(courseID) {
  for (i in notInDatabase) {
    if (courseID == notInDatabase[i]) {
      return true;
    }
  }
  //returns false if the course is not offered in the attempted semester, true otherwise
  var semestersOffered = getValue('Semesters', courseID);
  var curSemester = document.getElementById(courseID).parentNode.id;
  if ((curSemester == 'Required') || (curSemester == 'Prereqs')) {
    return true;
  }
  //special logic for ae 590
  if (getValue('Prerequisites', courseID) == 'senior') {
    if (curSemester == 's7') {
      return true;
    }
    else {
      return false;
    }
  }
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

//checks if coreqs are met, returns true or an array of unmet
function checkCorequisitesMet(courseID) {
  for (i in notInDatabase) {
    if (courseID == notInDatabase[i]) {
      return true;
    }
  }
	//iterate through all courses in all divs and compare to check whether coreqs are met
  var corequisites = getValue('Corequisites', courseID);
  var curSemester = document.getElementById(courseID).parentNode.id;
  
  //if there are no coreqs, return true
  if (corequisites == '-') {
    return true;
  }
  
  //split along + into individual id
  var coreqArray = [corequisites];
  if (corequisites.indexOf('+') > -1) {
    coreqArray = corequisites.split('+');
  }
  //if the current semester is required, return them all
  if (curSemester == 'Required') {
    return coreqArray;
  }
  //iterate through all courses in semesters before or at the current, return true if one is a coreq, array otherwise
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

//checks if prereqs are met, returns true or an array of unmet
function checkPrerequisitesMet(courseID) {
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
	//check if prereqs are or or and
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
  if (curSemester == 'Required') {
    return prereqArray;
  }
  //logic for checking prereqs by incrementing a counter of prereqs
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
  //met array corresponds to met prereqs, if they are all met that length and the prereq array length should be the same
  if ((metArray.length == prereqArray.length) && (prereqType == '&')) {
    prereqMetFlag = true;
  }
  if (prereqType == '+') {
    prereqMetFlag = orFlag;
  }
  
  //logic for ae 590
  if (prerequisites == 'senior') {
    prereqMetFlag = true;
  }
  
  //no prereqs
  if (prerequisites == '-') {
    prereqMetFlag = true;
  }
  if (prereqMetFlag) {
    return true;
  }
  //create not met array and return it if there are missing prereqs
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
