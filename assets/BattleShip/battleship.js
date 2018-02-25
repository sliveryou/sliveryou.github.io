// model对象：生成所有的潜艇模型
var model = {
	boardSize: 7,  // 定义7*7的网格
	numShips: 3,  // 定义三艘潜艇
	shipLength: 3,  // 定义潜艇占据三格位置
	shipsSunk: 0,  // 初始化击沉数目
	
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],  // 初始化三艘潜艇，ships是modle的属性

	fire: function(guess) { // 如A0会转化为00传给guess
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);  // 得到猜测的位置的index，如果不匹配，返回-1
			
			if (ship.hits[index] === "hit") {
				view.displayMessage("You already hit that location!");
				return true;  // 重复击打位置是不累计加分的
			} else if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);  // 成功位置处显示潜艇
				view.displayMessage("HIT!!!");  // index大于0，说明位置匹配成功，并显示击中信息

				if (this.isSunk(ship)) {  // 判断这艘潜艇是否击沉
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);  // 失败位置处显示miss
		view.displayMessage("You missed.");
		return false;
	},  // 定义fire方法，攻击潜艇

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++)  {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
	    return true;
	},  // 判断某艘潜艇是否击沉

	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();  // 不断生成一艘潜艇的位置，并判断是否有位置冲突，有冲突则继续循环，重新生成位置
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array: ");
		console.log(this.ships);
	},  // 生成3艘潜艇的位置

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);  // 随机生成横纵轴方向，1为横轴，0位纵轴
		var row, col;

		if (direction === 1) {
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
		} else {
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;  // 返回一个新的潜艇位置
	},  // 生成潜艇

	collision: function(locations) {  // 传入的是位置数组
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;  // 存在冲突则返回true
				}
			}
		}
		return false;
	}  // 判断现有的潜艇位置是否有冲突
}; 

// view对象：带来浏览器界面视觉的变化
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");  // 添加hit的类型
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");  // 添加miss的类型
	}
}; 

// controller对象：中央控制器
var controller = {
	guesses: 0,

	processGuess: function(guess) {
		var location = parseGuess(guess);
		if (location) {
			this.guesses++;
			var hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips) {
					view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses!");
					alert("You sank all my battleships, in " + this.guesses + " guesses!");
			}
		}
	}
}

// 解析函数：将坐标输入的<字母+数字>字符串转化为<纯数字>字符串
function parseGuess(guess) {
	var mapDict = ["A", "B", "C", "D", "E", "F", "G"];  // 映射字典

	if (guess === null || guess.length !== 2) {
		alert("Sorry, please enter a letter and a number on the board.");
	} else {
		var first = guess.charAt(0);  // 得到猜测的第一个字符
		var row = mapDict.indexOf(first);  // 得到横坐标
		var column = guess.charAt(1);  // 得到猜测的第二个字符，也就是纵坐标
		
		if (isNaN(row) || isNaN(column)) {
			alert("Sorry, that isn't on the board.");
		} else if (row < 0 || row >= model.boardSize ||
		           column < 0 || column >= model.boardSize) {
			alert("Sorry, that's off the board!");
		} else {
			return row + column;
		}
	}
	return null;
}

// 获取玩家输入的值
function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value.toUpperCase();

	controller.processGuess(guess);  // 控制器打开猜测进程
	guessInput.value = "";  // 清空已数入的值
}

// 处理按键触发事件
function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");
	e = e || window.event;

	if (e.keyCode === 13) {
		fireButton.click();
		return false;  // false挂载这个事件，true重新得到事件
	}
}

// 初始化整个游戏进程
window.onload = init;

function init() {
	// 对 Fire! 按钮的 onclick 事件进行绑定
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;

	// 输入完后回车也可以触发 click 事件
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	// 放置生成的潜艇，开始游戏
	model.generateShipLocations();
}
</纯数字></字母+数字>