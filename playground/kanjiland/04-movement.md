# Movement
With the [last part](/playground/kanjiland/03-animations.md) animations were added, and now the whole world of kanjiland is in motion. However, nothing actually moves (yet). The movement, and especially the player movement, is still missing.

I'll be honest, getting the movement right took me a few attempts. But let's start with the simple basics:

## Moving an Object
From the previous parts, we already know that all objects have a position in unit-space coordinates. Looking at physics, the movement of an object is called motion and describes the change of its position over time. How fast (or, how far within a set time frame) the object moves is described by its velocity.

With this, we already know what we have to do to move an object: change its position based on a certain velocity. Now, remember the Loop where I talked about the `update()` function? Inside this function will be the perfect place to make changes to an object's position. And remember how I decided to use a fixed number of update calls (25 per second)? This now makes it trivial to determine a velocity for an object. Assume we want to move the object by 1 unit per second:

```
let velocity = 1/25;
function update(dt, ts) {
    object.position.x += velocity;
}
```

And our object is moving. If we want to move it faster, we increase the velocity to e.g. 4/25. A more advanced object could now be extended with an acceleration, which increases the object's velocity over time until a set maximum velocity is reached:

```
let velocity = 0;
let maxVelocity = 4/25;
let acceleration = 1/25;

function update(dt, ts) {
    velocity = Math.min(maxVelocity, velocity + acceleration);
    object.position.x += velocity;
}
```

However, I will ignore the acceleration part for now and keep it binary: either the object moves at full velocity or does not move at all. Ok, but so far it was very simple, why did it take me several attempts? Well, let's have a look at what I did.

## Player Input
The first thing I wanted to move around was of course the player's avatar. This would allow the player to explore the map, go to different places and later perform other actions there. As a first step, the player shall be able to move his character using the arrow keys on the keyboard. Later, maybe the space bar will be added to trigger interactions, and maybe other keys as well. For now, all keys will be hardcoded, but already in bundled in a `Keyboard` object that listens to the keyboard events and stores them.

So, my first naive attempt looked something like this:

```
function update(dt, ts) {
    let vx = 0;
    let vy = 0;
    if (keyboard.right) {
        vx += 1;
    }
    if (keyboard.left) {
        vx -= 1;
    }
    if (keyboard.up) {
        vy -= 1;
    }
    if (keyboard.down) {
        vy += 1;
    }
    player.move(vx, vy);
}
```

I check if any of the direction keys is pressed during an update call of my loop and calculate a horizontal velocity `vx` and a vertical velocity `vy`. By individually checking all keys, I can set the velocity to 0 when two opposing keys are pressed simultaneously. Then I tell the player's character to move with this velocity, which looks like this:

```
function move(vx, vy) {
    this.position.x += vx * this.speed;
    this.position.y += vy * this.speed;
}
```

As you can see, I moved the player's speed to an extra variable, so it is decoupled from the update code.

The above code worked great, so what was the problem here?

The problem arises when you try to combine the movement with a matching animation. Where is the best place to choose the animation for moving right when the user presses the right arrow key?

Well, since it is the player object's animation, certainly not inside the `update` function. This leaves only the `move` function - but here is the problem: since at some point I want to move other object as well, not only the player. And because movement is the same for all objects, the `move` function was already pulled out of `player` object and written as a general function that could be reused by other objects. Because, well, reusing code is something good, isn't it?

But ok, the move function is small and simple, let's move it back into the `player` object and everything should be good. Except, it wasn't (surprise!). Because I also wanted to have the movement direction to affect the sprite when the player stops moving. If the player moves right, the sprite `moving-right` is used. When the player then stops, the sprite switched to `standing-right`, which is the player character standing still and looking into the direction it was previously moving in. And similar there are moving and standing sprites for the directions up, down and left as well.

To realize this, I had to store the movement direction so I could decide which direction the player is looking once he stops. This led to a rather large if-statement, however still manageable. But what about the animations for interaction? Those could maybe either be triggered while moving or while standing, but would also require a direction. And maybe some interactions can only be triggered while standing still. And there might be different interaction-animations, depending on what the player interacts with. As you can guess, this would lead to a nice if-tree, if not a complete if-forest.

But wait, large if-constructs to only allow certain actions or do certain things depending on a previous state, this sounds like a job for a...

## Finite State Machine
Yes, a state machine. Something I haven't played with in a long time since university. But how does this replace my ever-growing if-forest?

First, let's have a look at a single state:

```
class State {
    function input(keyboard, object) { }

    function enter(object) { }

    function leave(object) { }

    function update(dt, ts, object) { }
}
```

There are three important functions:
- `enter` is called when the state is entered
- `leave` is called when the state is left
- `update` is called during the regular update-loop
- `input` is called to determine whether the state transitions to another state, based on the given keyboard input
The `object` parameter given to each state is the object that is affected by the state. Or in other words, the state manipulates the object. This way, objects that shall behave similar (and share the necessary common features) can simply be given the same states.

So, how does this work in more detail? Let's have a look at a small example with two simple states:

```
class StateStanding extends State {
    function enter(object) {
        object.setAnimation("standing");
    }

    function input(keyboard, object) {
        if (keyboard.right) {
            return new StateMoving();
        }
        return null;
    }
}
```

```
class StateMoving extends State {
    function enter(object) {
        object.setAnimation("moving");
    }

    function input(keyboard, object) {
        if (!keyboard.right) {
            return new StateStanding();
        }
        return null;
    }

    function update(dt, ts,  object) {
        object.move(1, 0);
    }
}
```

And somewhere in our player class:

```
function update(dt, ts) {
    let newState = this.state.input(Global.keyboard, this);
    if (newState) {
        this.state.leave(this);
        this.state = newState;
        this.state.enter(this);
    }
    this.state.update(dt, ts, this);
}
```

Ok, so now that we have all the pieces, let's have a look at how they work together. First of all, the player must always have a state, no matter which one it is, but it can not have no state. So let's assume it gets initialized with `StateStanding`.

During the `update` call of the player, it checks how its current state reacts to the current keyboard input. Looking at `StateStanding`, we see that the `input(..)` function returns `null` unless the right arrow key is pressed, then it will return a new instance of `StateMoving`.

While `null` is returned, the player does not change state and keeps calling `update(..)` on the current `StateStanding`, where nothing happens. 

So now assume, the right arrow key is pressed. `input(..)` of the current `StateStanding` now returns a `StateMoving` as `newState`. The player object then calls the `leave(..)` function on its current `StateStanding` (nothing happens), then updates its current state to `newState` and calls `enter(..)` on its new `StateMoving`. Here it updates the player animation to the moving animation. At last, the player object calls `update(..)` on its `state`, which causes the player object to be moved.

While the right arrow key remains pressed, the `StateMoving` will return `null` and the player object remains in this state. When the arrow key is no longer pressed, `StateMoving` will return a `StateStanding` and the player object once again swaps its state, and by entering `StateStanding` has its animation updated to "standing".

This is the basic concept, which can now be extended as needed. The main benefit compared to the if-forest, is that we no longer need to painfully check which state we are currently in and what the player can do. Instead we always exactly know the current state, and explicitly declare which actions can take the player to another state (and to which other state). All other actions will have no effect on the current state.

This concept isn't limited to human keyboard inputs. The same states can easily be reused with keyboard inputs generated by some sort of AI. Or we can use the `update(..)` function to increment a timer, and only allow changing state after at least one second in the current state. And thinking of e.g. a buff and debuff system, the concept of a state machine has many other uses besides movement.