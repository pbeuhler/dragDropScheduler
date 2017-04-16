var lotInfoDB;
var oReq = new XMLHttpRequest();
oReq.open("GET", "https://people.eecs.ku.edu/~jfreeman67/448.db", true);
oReq.responseType = "arraybuffer";
oReq.onload = function(e) {
  var uInt8Array = new Uint8Array(this.response);
    classDB = new SQL.Database(uInt8Array);
};
oReq.send();

var semestersArray = ['Prereqs', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
var dropArr = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
var notInDatabase = ['KUCore1', 'KUCore2', 'KUCore3', 'KUCore4', 'Tech1', 'KUCore5', 'Tech2', 'Tech3', 'KUCore6'];
var Used = [];
var preReq = [];
var num_drops;

		

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
	dragStart(ev);
  ev.dataTransfer.setData("text", ev.target.id);
}

function Position(data,target,rank){
	this.course_id = data;
	this.target = target;
	this.rank = rank;
	
	//refresh course position
	this.refresh = function(num_drops){
		for(i in Used){
				var a = this.course_id;
				var b = Used[i].course_id;
				//same id tag
				if(a == b && i<Used.length-1){
					this.course = Used[i].course_id;
					this.rank = num_drops;
					var ind = Used.indexOf(Used[i]);
					Used.splice(num_drops-1,1);
				}
			}
	}
}

function drop(ev) {	
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  
  //if target is valid, it is in the semester array, then diff will be < 8
  var diff = 0;
  for(i in dropArr){
	  if(ev.target.id != dropArr[i]){
		  diff++;  
	  }
  }
  if(diff < 8){
	  

		//succesful drop
		num_drops = num_drops+1;
	    ev.target.appendChild(document.getElementById(data));
		var prereqsMet = checkPrerequisitesMet(document.getElementById(data).id);
		var coreqsMet = checkCorequisitesMet(document.getElementById(data).id);
		var semesterRight = checkSemesters(document.getElementById(data).id);
		var credits = getCreditsSemester(ev.target.id);
		//Info.innerHTML = getValue('Description',document.getElementById(data).id);
		
		//console.log(document.getElementById(data).id);
		//console.log(prereqsMet);
		//console.log(coreqsMet);
		//console.log(semesterRight);
		//console.log(credits);
		var id = document.getElementById(data).id;

			
			
				//generates position
				var y = new Position(id, ev.target.id,num_drops);
				Used.push(y);
				num_drops = num_drops+1;
				//refresh all coruses location // substitute old location
				y.refresh(num_drops);
				pre(y,prereqsMet);	
			
  }



  // else if(!semesterRight){
  //   sem(data);
  /* // }
  if(!coreqsMet){
    cor(data);
  } */
  //console.log(Used);
  console.log("-------");
}//end drop

//color
function pre(obj, array){

var no_conflict = true;
	//console.log(array);
  if(array[0] != ""){
	  for(i in array){
		for(j in Used){
			//if prerequisite is in droped array
			//if(Used[j].course_id == array[i].course_id){
				//look placed before
				//string comparison
				console.log("loc" + (Used[j].course_id));
				console.log("loc" + (obj.course_id));
				if((Used[j].target >= obj.target) ||(obj.course_id == preReq[i][1]) ||(preReq.indexOf(Used[j]) != -1)){
					//source
					document.getElementById(obj.course_id).style = "background:red";
					////prerequisite
					document.getElementById(array[i]).style = "background:pink";
					//object being moved
				    console.log("pass");
					//prerequisite
					preReq.push([obj,array[i],Used[j].target]);
			//	}
			}
		}
	  }
	  
	  
	  for(i in preReq){
		  //course dragged is in conflict
		  //dropped before course that requires it
		  console.log("Requirements");
		//console.log(preReq[i][0]);
		//console.log(obj.course_id);
		  //console.log((array[i] == object.target) && (obj.target < preReq[i][0]));
		if((preReq[i][1] == obj.course_id) && (obj.target < preReq[i][0].target )){
		//prerequisite
		console.log("change white");
		document.getElementById(preReq[i][0].course_id).style = "background:white";
		//source 
		document.getElementById(obj.course_id).style = "background:white";
		
			//var ind = preReq.indexOf(preReq[i][0]);
			//preReq.splice(ind,1);
		}
	  }
  }
  
}//end
function cor(ev){
  document.getElementById(ev).style = "background:yellow";
}
function sem(ev){
  document.getElementById(ev).style = "background:pink";
}



function getCreditsSemester(divID) {
  var semesterCourses = getChildren(divID);
  var totalCredits = 0;
  for (i in semesterCourses) {
    totalCredits += parseInt(getValue('Credits', semesterCourses[i]));
  }
  return totalCredits;
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
    coreqArray = corequisites.split('+');
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
  else {
    var newStr = '';
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
