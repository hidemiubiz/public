var DUMMYCODE_01 = '\
class Queue {\n\
    constructor(){\n\
	this.__a = new Array();\n\
	this.__b = new Array();\n\
    }\n\
    enqueue(o){\n\
	this.__a.push(o);\n\
	this.__b[this.__b.length] = o;\n\
    }\n\
    dequeue (){\n\
	if(this.__a.length > 0){\n\
	    return this.__a.shift();\n\
	}\n\
	return null;\n\
    }\n\
    getCopy(){\n\
	var q = new Queue();\n\
	for(var i=0; i<this.__b.length; i++){\n\
	    q.enqueue(this.__b[i].cloneNode(true));\n\
	}\n\
	return q;\n\
    }\n\
}\n\
\n\
class ScoreInfo {\n\
    constructor(minScore,name,image){\n\
	this.minScore=minScore;\n\
	this.name=name;\n\
	this.image=image;\n\
    }\n\
}\n\
\n\
class UserInfo {\n\
    constructor(){\n\
	this.uuid = "";\n\
	this.name = "";\n\
	this.highscore = 0;\n\
	this.country = "";\n\
    }\n\
    load_from_storage(){\n\
	this.uuid = load_data("uuid");\n\
	if(this.uuid != ""){\n\
	    this.name      = load_data("name");\n\
	    this.country   = load_data("country");\n\
	    this.highscore = Number(load_data("highscore"));\n\
	}\n\
	else {\n\
	    this.uuid = createUuid();\n\
	}\n\
	console.log("userInfo.load_from_storage(" + this.uuid + "," + this.name + "," + this.country + "," + this.highscore + ")");\n\
    }\n\
    save_to_storage(){\n\
	console.log("UserInfo.save_to_stoar(" + this.uuid + "," + this.name + "," + this.country + "," + this.highscore + ")");\n\
	save_data("uuid", this.uuid);\n\
	save_data("name", this.name);\n\
	save_data("country", this.country);\n\
	save_data("highscore", this.highscore);\n\
    }\n\
    clear_from_storage(){\n\
	this.name = "";\n\
	this.highscore = 0;\n\
	this.country = "";\n\
	localStorage.removeItem("name");\n\
	localStorage.removeItem("country");\n\
	localStorage.removeItem("high_score");\n\
    }\n\
    load_from_ui(){\n\
	this.name = document.getElementById("name").value;\n\
	this.highscore = document.getElementById("highscore_text").value;\n\
	this.country = document.getElementById("select_country").value;\n\
    }\n\
    reflect_to_ui(){\n\
	document.getElementById("name").value = this.name;\n\
	document.getElementById("name_label").value = this.name;\n\
	document.getElementById("highscore_text").value = this.highscore ;\n\
	document.getElementById("select_country").selectedIndex = get_country_index_by_value(this.country);\n\
	document.getElementById("rank_text").value =  this.highscore + "  " + getClassInfo(this.highscore).name;\n\
	document.getElementById("rank_insignia").src = getClassInfo(this.highscore).image;\n\
	console.log(document.getElementById("rank_text").value);\n\
\n\
	\n\
	for(var i=0; i<SCORE_INFO.length; i++){\n\
	    var tag_id = "pos_" + SCORE_INFO[i].minScore;\n\
	    console.log(tag_id);\n\
	    document.getElementById(tag_id).value = "";\n\
	}\n\
\n\
	for(var i=0; i<SCORE_INFO.length; i++){\n\
	    var tag_id = "pos_" + SCORE_INFO[i].minScore;\n\
	    if(this.highscore >= SCORE_INFO[i].minScore){\n\
		document.getElementById(tag_id).value = "  <<<< You are here.";\n\
		break;\n\
	    }\n\
	}\n\
    }\n\
}\n\
\n\
\n\
var SERVER_BASE="http://localhost";\n\
\n\
\n\
// Score and rand, isignia map.\n\
var SCORE_INFO = new Array();\n\
var sidx=0; \n\
SCORE_INFO[sidx] = new ScoreInfo(601,"Fleet Admiral","FleetAdmiral_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(551,"Admiral","Admiral_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(501,"Vice Admiral","ViceAdmiral_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(451,"Read Admiral Upper Half","RearAdmiralUH_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(401,"Rear Admiral Lower Half","RearAdmiralLH_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(351,"Captain","Captain_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(301,"Commander","Commander_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(271,"Lieutnant Commander","LieutenantCommander_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(221,"Lieutenant","Lieutenant_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(201,"Lieutenan Junior Grade","LieutenantJunior_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(151,"Ensign","Ensign_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(101,"Sergeant","Sergent_l.png");  sidx++;\n\
SCORE_INFO[sidx] = new ScoreInfo(0,"Private","Private_l.png");  sidx++;\n\
    \n\
\n\
var nGameCount=0;\n\
var USERINFO = new UserInfo();\n\
var original_queue = new Queue();\n\
var queue;\n\
\n\
var isGameStart=0;\n\
var startTime=0;\n\
var timerId_Main=0;\n\
var timerId_VSCode=0;\n\
var nScore=0;\n\
var nMaxTime=5;\n\
var nCountDown;\n\
\n\
var lastInputted=""; \n\
var VSCODE_PROGRESS=0;\n\
\n\
//------------------------------------\n\
// body load. \n\
//------------------------------------\n\
function init()\n\
{\n\
    prepare_country_select();\n\
\n\
    document.getElementById("base").addEventListener(\'keypress\', keyPress);\n\
    \n\
    USERINFO.load_from_storage();\n\
    USERINFO.reflect_to_ui();\n\
    \n\
    resize();\n\
    prepare_game_start();\n\
    get_highscore(1);\n\
\n\
    prepareDummyVS();\n\
    queue = original_queue.getCopy();\n\
}\n\
\n\
//------------------------------------\n\
// Get code from country index and code string("1 ABW")\n\
//------------------------------------\n\
function get_country_index_by_value(cvalue)\n\
{\n\
    var n_country = 0;\n\
    if(cvalue != null){\n\
        var tmp = cvalue.split(\' \');\n\
        n_country = parseInt(tmp[0]);\n\
    }\n\
    return n_country;\n\
}\n\
\n\
//------------------------------------\n\
// Get index from country index and code string("1 ABW")\n\
//------------------------------------\n\
function get_country_code_by_value(cvalue)\n\
{\n\
    if(cvalue != null){\n\
	var tmp = cvalue.split(\' \');\n\
	country = tmp[1];\n\
	return country;\n\
    }\n\
    else {\n\
	return " "\n\
    }\n\
}\n\
\n\
//------------------------------------\n\
// Get class informaton from score.\n\
//------------------------------------\n\
function getClassInfo(score){\n\
    console.log("getClassInfo(" + score + ")   len=" + SCORE_INFO.length);\n\
    for(var i=0; i<SCORE_INFO.length; i++){\n\
	if(score >= SCORE_INFO[i].minScore){\n\
	    console.log("OK getClassInfo[" + i + "]  " + score + "," + SCORE_INFO[i].minScore);\n\
	    return SCORE_INFO[i];\n\
	}\n\
	else {\n\
	    console.log("NG getClassInfo[" + i + "]  " + score + "," + SCORE_INFO[i].minScore);\n\
	}\n\
    }\n\
    return SCORE_INFO[SCORE_INFO.length-1]\n\
}\n\
\n\
//------------------------------------\n\
// resize\n\
//------------------------------------\n\
function resize(){\n\
    var w = document.body.scrollWidth;\n\
    var h = document.body.clientHeight;\n\
\n\
    var aw =document.body.scrollWidth;\n\
    var aw_right = document.body.scrollWidth - 320;\n\
    if(document.body.clientWidth  > 1000){\n\
	aw       = document.body.clientWidth;\n\
	aw_right = document.body.clientWidth - 320;\n\
    }\n\
    \n\
    document.getElementById("menu_table").style.width =  aw + "px";;\n\
    document.getElementById("main_table").style.width =  aw + "px";;\n\
    \n\
    var eh = h*0.5;\n\
    document.getElementById("vs_edit").style.height= eh  + "px";;\n\
\n\
    var adjust=110;\n\
    var ehl = h - eh - adjust;\n\
    document.getElementById("information").style.height= ehl + "px";\n\
    document.getElementById("vs_edit").style.widrth = aw_right + "px";\n\
    \n\
    var ehl = h - eh - adjust - 40;\n\
    document.getElementById("information_tab1").style.height= ehl + "px";\n\
    document.getElementById("information_tab1").style.width = aw_right + "px";\n\
    document.getElementById("information_tab2").style.height= ehl + "px";\n\
    document.getElementById("information_tab2").style.width = aw_right + "px";\n\
    document.getElementById("information_tab3").style.height= ehl + "px";\n\
    document.getElementById("information_tab3").style.width = aw_right + "px";\n\
    document.getElementById("information_tab4").style.height= ehl + "px";\n\
    document.getElementById("information_tab4").style.width = aw_right + "px";\n\
\n\
    document.getElementById("vs_left").style.height = h-100 + "px";\n\
    document.getElementById("statusbar").style.width= aw + "px";\n\
}\n\
\n\
//------------------------------------\n\
// Prepare for a new game.\n\
//------------------------------------\n\
function prepare_game_start(){\n\
    console.log("INIT()");\n\
    document.getElementById("timer").value  = getFormatString(0);\n\
    document.getElementById("score").value  = getFormatString(0);\n\
    document.getElementById("question").value= "Push START Button or Retun Key to start a game.";\n\
    document.getElementById("input").value  = "";\n\
\n\
    document.getElementById("timer").value = getFormatString(nMaxTime);\n\
    document.getElementById("score").value = getFormatString(nScore);\n\
}\n\
\n\
//------------------------------------\n\
// Timer process on the game.\n\
//------------------------------------\n\
function mainLoop(){ \n\
    var nowTime = new Date();\n\
    nowTime = Math.floor((nowTime - startTime)/1000);\n\
    var remainTime = nMaxTime - nowTime;\n\
\n\
    document.getElementById("timer").value = getFormatString(remainTime);\n\
    \n\
    if(nowTime >= nMaxTime){\n\
	stopGame();\n\
    }\n\
    else {\n\
	isGameStart=1;\n\
    }\n\
\n\
}\n\
\n\
//------------------------------------\n\
// Stop a game.\n\
//------------------------------------\n\
function stopGame(){\n\
    document.getElementById("question").value= "GAME OVER";\n\
    isGameStart=0;\n\
    if(timerId_Main != 0){\n\
	clearInterval(timerId_Main);\n\
	clearInterval(timerId_VSCode);\n\
	timerId_Main = 0;\n\
	timerId_VSCode = 0;\n\
    }\n\
    \n\
    if(nScore > USERINFO.highscore){\n\
	USERINFO.highscore = nScore;\n\
	document.getElementById("input").value = "High Score!!";\n\
	USERINFO.save_to_storage();\n\
	USERINFO.reflect_to_ui();\n\
    }\n\
    else {\n\
	document.getElementById("input").value = "";\n\
    }\n\
\n\
    var className = getClassInfo(nScore).name; \n\
    var strClass = " You are " + isStartWithA(className) + " " + className + ".    " + "Push START Button or Retun Key to start a game."\n\
    document.getElementById("input").value += strClass;\n\
    lastInputted = document.getElementById("input").value;\n\
\n\
}\n\
\n\
//------------------------------------\n\
// Check if the word starts with "a"\n\
//------------------------------------\n\
function isStartWithA(word)\n\
{\n\
    var c = word.toLowerCase();\n\
    if(c.startsWith("a")){\n\
	return "an";\n\
    }\n\
    else {\n\
	return "a";\n\
    }\n\
}\n\
\n\
//------------------------------------\n\
// Set a new questions.\n\
//------------------------------------\n\
function setQuestion(){\n\
    document.getElementById("input").value= "";\n\
    document.getElementById("question").value= "";\n\
    lastInputted=""; \n\
    \n\
    for(i=0; i<5; i++){\n\
	var qIndex = Math.floor(Math.random()*strWordList.length);\n\
	document.getElementById("question").value += strWordList[qIndex];\n\
	if(i<4)    document.getElementById("question").value += " ";\n\
    }\n\
}\n\
\n\
//------------------------------------\n\
// Start count down.\n\
//------------------------------------\n\
function countDownStart(){\n\
    document.getElementById("timer").value= getFormatString(nMaxTime);\n\
    document.getElementById("score").value = getFormatString(0);\n\
    if(timerId_Main != 0){\n\
	return;\n\
    }\n\
\n\
    if(nCountDown==0){\n\
	clearInterval(timerId_Main);\n\
	timerId_Main = 0;\n\
    }\n\
    timerId_Main = setInterval("countDown();",1000);\n\
    nCountDown=3;\n\
    document.getElementById("timer").value= getFormatString(nMaxTime);\n\
    document.getElementById("score").value = getFormatString(0);\n\
    document.getElementById("question").value = nCountDown;\n\
    document.getElementById("input").value    = "";\n\
    document.getElementById("input").focus();\n\
    lastInputted=""; \n\
\n\
    if(nGameCount > 10){\n\
	clearDummyVSArea();\n\
    }\n\
    nGameCount++;\n\
}\n\
\n\
//------------------------------------\n\
// Countdown.\n\
//------------------------------------\n\
function countDown(){\n\
  nCountDown--;\n\
  document.getElementById("question").value = nCountDown;\n\
  if(nCountDown==0){\n\
    clearInterval(timerId_Main);\n\
    timerId_Main = 0;\n\
    gameStart();\n\
  }\n\
}\n\
\n\
//------------------------------------\n\
// Statrt a game.\n\
//------------------------------------\n\
function gameStart(){\n\
    if(timerId_Main != 0){\n\
	clearInterval(timerId_Main);\n\
	timerId_Main = 0;\n\
    }\n\
\n\
    document.getElementById("input").focus();\n\
    prepare_game_start();\n\
    isGameStart=1;\n\
    startTime = new Date();\n\
    nScore=0;\n\
    timerId_Main = setInterval("mainLoop();", 10);\n\
    timerId_VSCode = setInterval("vsCodeEditroLoop();", 10);\n\
    lastInputted=""; \n\
    setQuestion();\n\
\n\
}\n\
';
