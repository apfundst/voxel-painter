var container = document.body;
var createGame = require("voxel-engine");
var createHighlight = require('voxel-highlight')
var createPlayer = require("voxel-player");
var oculus = require('voxel-oculus');
var explode = require('voxel-debris');

var game = createGame({
	texturePath: "./textures/",
	generateChunks: true,
	chunkDistance: 3,
	generate: function(x, y, z) {
		return y === 1 ? 1 : 0;
	},
	keybindings: {
		'W': 'forward'
		, 'A': 'left'
		, 'S': 'backward'
		, 'D': 'right'
		, 'R': 'view'
		, 'N': 'material_change'
		, '<mouse 1>': 'fire'
		, '<mouse 2>': 'firealt'
		, '<space>'  : 'jump'
		, '<shift>'  : 'crouch'
		, '<control>': 'alt'
	}
});
game.appendTo(container);

// player
var player = createPlayer(game)("skin/christmas.png", { gravity: true });
player.possess();
player.yaw.position.set(0, 20, 0);

// effects
// highlight blocks when you look at them
var blockPosPlace, blockPosErase
var highlighter = createHighlight(game, {
  color: 0xffff00
  , distance: 100
  , selectActive: createToggler('select')
  , animate: false
})
highlighter.on('highlight', function (voxelPos) {
	blockPosErase = voxelPos;
})
highlighter.on('remove', function (voxelPos) {
	blockPosErase = null;
})
var debris = new explode(game, { power : 1.5 });
debris.on('collect', function (item) {
    console.log(game.materials[item.value - 1]);
});

var effect = new oculus(game, { distortion: 0.2, separation: 6 });

// block interaction stuff, uses highlight data
var materials = [
  ['grass', 'dirt', 'grass_dirt'], // top, bottom, sides
  'diamond',
  'obsidian',
  'brick',
  'grass',
  'plank'
];
var currentMaterial = 1;
var triggerMaterialChange = createNonRepeater('material_change', function () {
  currentMaterial = ++currentMaterial % materials.length;
  if (!currentMaterial) {
	currentMaterial = 1;
  }
})

game.on('tick', update);

function update() {
	triggerMaterialChange();
}

game.on('fire', function (target, state) {
  var position = blockPosPlace;
  if (position) {
    game.createBlock(position, currentMaterial);
  }
  else {
    position = blockPosErase;
    if (position) {
		game.setBlock(position, 0);
	}
  }
});

// misc
function createToggler(keyControl) {
  var active, canToggle;
  return function () {
    if (!game.controls.state[keyControl]) {
      canToggle = true;  // key released, reset
    } else if (canToggle) {
      canToggle = false;
      active = !active;
    }
    return active;
  }
}

function createNonRepeater(keyControl, fn) {
  var canActivate;
  return function () { // will only return true once per long keypress
    if (!game.controls.state[keyControl]) {
      canActivate = true;  // key released, reset
    } else if (canActivate) {
      canActivate = false;
      if (typeof fn === 'function') fn()
      return true;
    }
    return false;
  }
}

