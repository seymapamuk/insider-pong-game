(function () {
	// to make sure the code runs from pasting it to the console!
	var CSS = {
		game : {
            background: 'green',
            position: 'fixed',
            width: '100%',
            height: '80%',
            objectPosition: "0px 50%"
		},

        playground : {
			position: 'absolute',
			margin: 'auto',
			background: 'blue',
			width: '90%',
			height: '90%'
        },
        ball : {
			position: 'absolute',
			height: '15px',
			width: '15px',
			borderRadius: '50%',
			background: 'red'	
        },
        paddle : {
        	position: 'absolute',
			width: '12px',
			height: '85px',
			background: 'red'
        },
        score : {
			position: 'absolute',
			height: '20px',
			width: '150px',
			color: 'black'
		},
		middleText : {
			position: 'absolute',
			fontSize: '30px',
			height: '100px',
			width: '350px',
			color: 'black'
		}
    };

    function draw() {
        $('<div/>', {id: 'game'}).css(CSS.game).appendTo('body');
        $('<div/>', {id: 'playground'}).css(CSS.playground).appendTo('#game');
        $('<div/>', {id: 'ball'}).css(CSS.ball).appendTo('#playground');
        $('<div/>', {id: 'left'}).css(CSS.paddle).appendTo('#playground');
        $('<div/>', {id: 'right'}).css(CSS.paddle).appendTo('#playground');
        $('<div/>', {id: 'p1'}).css(CSS.score).appendTo('#playground');
        $('<div/>', {id: 'p2'}).css(CSS.score).appendTo('#playground');
        $('<div/>', {id: 'middleText'}).css(CSS.middleText).appendTo('#playground');
    }

// screen elements
var game = {};
var playground = {};
var left = {};
var right = {};
var ball = {};

var balls = [];
var ball_count = 0;

var p1 = {};
var p2 = {};

var middleText;

// gameplay elements
var lastTick = 0;
var keysPressed = {};

var constants = {
	paddleSpeed : 200 / 1000,
	ballSpeed : 300 / 1000
}

var controls = {
    player1UP : "w",
    player1DOWN : "s",
    player2UP : "ArrowUp",
    player2DOWN : "ArrowDown",
    START : "z",
    SAVE : "p",
    EXTRA_BALL : " ",
    CPU : "q"
}

var start = false;
var cpu = false;

var SAVE_KEY = 'save';
var state = {
	load : false,
	p1score : 0,
	p2score : 0,
	ball_xpos : 0,
	ball_ypos : 0,
	ball_dir : {},
	left_xpos : 0,
	left_ypos : 0,
	right_xpos : 0,
	right_ypos : 0
}

function init(){
	draw();

    load();
    initGOs();

    document.addEventListener("keydown", function (keyEvent){
        keysPressed[keyEvent.key]  = true;

    });

    document.addEventListener("keyup", function (keyEvent){
        keysPressed[keyEvent.key] = false;
    });

    window.addEventListener('resize', function (event){
        console.log(event);
        console.log(window.innerWidth);
    });

    requestAnimationFrame(loop);
}

function loop(ts){

    var delta = ts - lastTick;

    handleInput(delta);

    if(start){
    	for(var i = 0; i <= ball_count; i++)
    		updateGame(delta, balls[i]);

    	if(cpu)
    		cpuMovement(delta);
    }

    lastTick = ts;

    requestAnimationFrame(loop);
}

function handleInput(dt){
	if(keysPressed[controls.START]){
		start = true;
		middleText.innerHTML = "";
	}

	if(keysPressed[controls.SAVE])
		save(state);

	if(keysPressed[controls.EXTRA_BALL]){
		balls[++ball_count] = randomBall();
		keysPressed[controls.EXTRA_BALL] = false;
	}

	if(keysPressed[controls.CPU])
		cpu = true;

    if(keysPressed[controls.player1UP]){
        left.y -= dt * constants.paddleSpeed;
    }
    if(keysPressed[controls.player1DOWN]){
        left.y += dt * constants.paddleSpeed;
    }
    if(keysPressed[controls.player2UP]){
        right.y -= dt * constants.paddleSpeed;
    }
    if(keysPressed[controls.player2DOWN]){
        right.y += dt * constants.paddleSpeed;
    }

    if(left.y < 0){
        left.y = 0;
    }
    if(left.y > playground.height - left.height){
        left.y = playground.height - left.height;
    }
    if(right.y < 0){
        right.y = 0;
    }
    if(right.y > playground.height - right.height){
        right.y = playground.height - right.height;
    }

    updateDOMFromGO(left);
    updateDOMFromGO(right);
}

function updateGame(delta, ball){
    ball.x += delta * constants.ballSpeed * Math.sin(ball.direction.x * Math.PI / 180);
    ball.y -= delta * constants.ballSpeed * Math.cos(ball.direction.y * Math.PI / 180);

    if(ball.x < 0){
        ball.x = 0;
        ball.direction.x = -1 * (180 - ball.direction.x);

        p2.score += 1;

        if(p2.score >= 5){
        	middleText.innerHTML = "PLAYER 2 WON!";
        	start = false;
        }
        else{
        	p2.dom.innerHTML = "Player 2 Score = " + p2.score;
        	clearBalls();
        	initDynamicObjects();
        	start = false;
        }
    }
    if(ball.x > playground.width - ball.width){
        ball.x = playground.width - ball.width;
        ball.direction.x = -1 * (180 - ball.direction.x);

        p1.score += 1;
        if(p1.score >= 5){
        	middleText.innerHTML = "PLAYER 1 WON!";
        	start = false;
        }
        else{
        	p1.dom.innerHTML = "Player 1 Score = " + p1.score;
        	clearBalls();
        	initDynamicObjects();
        	start = false;
        }
    }
    if(ball.y < 0){
        ball.y = 0;
        ball.direction.y = -1 * (180 - ball.direction.y);
    }
    if(ball.y > playground.height - ball.height){
        ball.y = playground.height - ball.height;
        ball.direction.y = -1 * (180 - ball.direction.y);
    }

    if(aabbCollision(ball, left)){
        ball.direction.x = -1 * (180 - ball.direction.x);
    }
    if(aabbCollision(ball, right)){
        ball.direction.x = -1 * (180 - ball.direction.x);;
    }

    updateDOMFromGO(ball);
}

function initGOs(){ 
    game.x = 0;
    game.y = 100;
    game.dom = document.getElementById("game");
    game.dom.focus();
    game.width = game.dom.offsetWidth;
    game.height = game.dom.offsetHeight;

    updateDOMFromGO(game);

    playground.dom = document.getElementById("playground");
    playground.width = playground.dom.offsetWidth;
    playground.height = playground.dom.offsetHeight;
    playground.x = (game.width - playground.width) / 2;
    playground.y = (game.height - playground.height) / 2;

    updateDOMFromGO(playground);

    //init middle text
    middleText = document.getElementById("middleText");
    middleText.style.left = (playground.width - (middleText.offsetWidth)) / 2 + "px";
    middleText.style.top = (playground.height / 2) - middleText.offsetHeight + "px";
    middleText.innerHTML = "CONTROLS: <br> Z TO START <br> P TO SAVE <br> SPACE FOR EXTRA BALL <br> Q FOR CPU PLAY";

    //init scoreboards
    p1.dom = document.getElementById("p1");
    p1.dom.style.left = (playground.width / 2) - p1.dom.offsetWidth + "px";
    p1.dom.style.top = p1.dom.offsetHeight + "px";
    if(!state.load)
    	p1.score = 0;
    else
    	p1.score = state.p1score;
    p1.dom.innerHTML = "Player 1 Score = " + p1.score;

    p2.dom = document.getElementById("p2");
    p2.dom.style.left = (playground.width / 2) + p2.dom.offsetWidth / 4 + "px";
    p2.dom.style.top = p2.dom.offsetHeight + "px";
    if(!state.load)
    	p2.score = 0;
    else
    	p2.score = state.p2score;
    p2.dom.innerHTML = "Player 2 Score = " + p2.score;

    //function because i need to use it in multiple places
    initDynamicObjects();

    state.load = false;
}

function initDynamicObjects(){
	// left paddle
	left.dom = document.getElementById("left");
    left.width = left.dom.offsetWidth;
    left.height = left.dom.offsetHeight;

    if(!state.load){
	    left.x = left.width;
	    left.y = (playground.height - left.height) / 2;
	}
	else{
		left.x = state.left_xpos;
	    left.y = state.left_ypos;
	}

    updateDOMFromGO(left);

    // right paddle
    right.dom = document.getElementById("right");
    right.width = right.dom.offsetWidth;
    right.height = right.dom.offsetHeight;
  
    if(!state.load){
 		right.x = playground.width - right.width * 2;
    	right.y = (playground.height - right.height) / 2;
	}
	else{
		right.x = state.right_xpos;
	    right.y = state.right_ypos;
	}

    updateDOMFromGO(right);

    balls = [];
    ball_count = 0;

    // ball
	ball.dom = document.getElementById("ball");
    ball.width = ball.dom.offsetWidth;
    ball.height = ball.dom.offsetHeight;

    if(!state.load){
	    ball.x = (playground.width - ball.width) / 2;
	    ball.y = (playground.height - ball.height) / 2;
	    ball.direction = {
	        x : (Math.floor(Math.random() * 120) + 30),
	        y : (Math.floor(Math.random() * 120) + 30)
	    }
	}
	else{
		ball.x = state.ball_xpos;
		ball.y = state.ball_ypos;
		ball.direction = state.ball_dir;
	}

    updateDOMFromGO(ball);
    balls[0] = ball;
}

function clearBalls(){
	for(var i = 1; i <= ball_count; i++){
    	balls[i].dom.remove();
    	delete balls[i];
    }
}

function updateDOMFromGO(go){
    go.dom.style.width = go.width + "px";
    go.dom.style.height = go.height + "px";
    go.dom.style.top = go.y + "px";
    go.dom.style.left = go.x + "px";
}

// collision control
function aabbCollision(go1, go2){
    if(go1.x < go2.x + go2.width && go1.x + go1.width > go2.x
        && go1.y < go2.y + go2.height && go1.y + go1.height > go2.y){
        return true;
    }
    else{
    return false;
    }
}

function save(state) {
  state.p1score = p1.score;
  state.p2score = p2.score;
  state.ball_xpos = ball.x;
  state.ball_ypos = ball.y;
  state.ball_dir = ball.direction;
  state.left_xpos = left.x;
  state.left_ypos = left.y;
  state.right_xpos = right.x;
  state.right_ypos = right.y;
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  state = JSON.parse(localStorage.getItem(SAVE_KEY));
  if(state != null)
  	state.load = true;
  else
  	state = {
	load : false,
	p1score : 0,
	p2score : 0,
	ball_xpos : 0,
	ball_ypos : 0,
	ball_dir : {},
	left_xpos : 0,
	left_ypos : 0,
	right_xpos : 0,
	right_ypos : 0
	};
}

function randomBall(){
	var ball = {};

	ball.dom = document.createElement("div");
	ball.width = 20;
	ball.height = 20;
	ball.dom.style.borderRadius = "50%";
	ball.direction = {
	    x : (Math.floor(Math.random() * 120) + 30),
	    y : (Math.floor(Math.random() * 120) + 30)
	}

	switch(Math.floor(Math.random() * 5) + 1){
		case 1: ball.dom.style.backgroundColor = "pink";
				ball.color = 1;
			break;
		case 2: ball.dom.style.backgroundColor = "yellow";
				ball.color = 2;
			break;
		case 3: ball.dom.style.backgroundColor = "orange";
				ball.color = 3;
			break;
		case 4: ball.dom.style.backgroundColor = "green";
				ball.color = 4;
			break;
		case 5: ball.dom.style.backgroundColor = "red";
				ball.color = 5;
			break;
		case 6: ball.dom.style.backgroundColor = "purple";
				ball.color = 6;
			break;
	}

	ball.x = (playground.width - ball.width) / 2;
	ball.y = (playground.height - ball.height) / 2;

	ball.dom.style.position = "absolute";

	playground.dom.appendChild(ball.dom);

	return ball;
}

function cpuMovement(dt){

	if(ball.x - left.x < playground.width / 2){
		if(ball.y - left.y > 0)
			left.y += dt * constants.paddleSpeed;
		else
			left.y -= dt * constants.paddleSpeed;
	}

	if(right.x - ball.x < playground.width / 2){
		if(ball.y - right.y > 0)
			right.y += dt * constants.paddleSpeed;
		else
			right.y -= dt * constants.paddleSpeed;
	}
}

init();

})();