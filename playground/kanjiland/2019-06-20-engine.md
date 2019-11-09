# Kanjiland - The Engine

So, I decided to work on a new game again, and one of the first things to decide from a technical point of view,
 is the engine to use. This decision mainly depends on the desired style for the game and what you are already familiar with.

## The Style
Since the idea arose when I saw Stardew Valley, a 2D top-down game, this was the initial start for the game's style. I was thinking about going 3D briefly, but for the purpose of teaching kanji by replacing in-game objects with their respective kanjis, I found the 2D top-down style way better. And since I also have next to no experience in creating 3D assets, I didn't want to add this additional learning curve on top.

For the art, I decided to go with a pixelated look. Mainly because this is something I can create by myself in a decent quality, but also does this allow me to emphasize the kanji by making them the only thing in the game that is not pixelated. Instead, the kanji will be smooth and anti-aliased. This is also done to focus on the learning aspect, as it keeps the look of the kanji clean and makes it easier to recognize the strokes.

## Components of an Engine - Graphics
With the art style decided and 3D off the table, it was time to decide how to realize those 2D images that currently only existed in my head. I had created a small game engine before, using the HTML Canvas to draw 2D scenes. However, this engine was far from finished and had many open points regarding what else could be done when rendering the textures onto the canvas.

But luckily, I stumbled on [PixiJS](https://www.pixijs.com/), which looked like everything I needed. It provides the 2D drawing capability I want, using either the HTML Canvas or when possible WebGL for better performance. PixiJS also brings a few more useful tools to the table, but the best thing is: you don't have to use all of them.

## Components of an Engine - The Loop
Beside the ability to render graphics, the probably most important part of the engine is the loop or game loop. The game loop is the heart of the engine. While the loop is running, it triggers the updates to all objects in the game and also tells the renderer to draw something. When the loop stops, the engine stops. PixiJS brings its own loop, but I decided to use the loop I built for my older engine and only use PixiJS to do the actual rendering.

The loop will do two things (mainly):
* Tell PixiJS to draw as often as possible. While PixiJS is drawing, the loop can't continue, so the number of how often something is drawn depends on the power of the system the engine is running on and on how much there is to draw. This number per second are the FPS, frames (drawn) per second.
* Update the objects inside the game, e.g. if there is an object moving across the screen, update its position and move it a few pixels to the right. Same as with the drawing, this takes some time depending on the number of objects and compute power. My engine reports this as UPS, updates per second.

Now, there is one more thing to consider with the updates. If you treat them just like the render calls, the number of updates might be higher or lower on different devices, meaning the e.g. position of an object is updated more times or fewer. If you then change the position of an object by fixed amount of movement per update call, the object would move faster on the device with the better performance, and slower on the one with less compute power.

One way to fix this problem is to give the object a certain velocity, something like `v = 10` for "move 10 pixels per second". When updating its position now, we also take into account the time that has elapsed, let's call it `dt`, since the last update of the object's position. Now we can simply calculate how far the object moves during our update call: `pixels = v * dt`.

This general approach isn't limited to moving the object around. Since the engine will be sprite based, we could also use this approach to determine which image of an animation sequence shall be shown (based on the animation speed instead of the velocity this time).

So, the approach with the update-velocity works, but there are still some flaws to it. Imagine the following simplified engine loop:

```
while (engine.running) {
    engine.update();
    engine.draw();
}
```

This loop will update all objects and then draw them, repeating until the engine is stopped. This gives the same priority to updating as to drawing our objects. This isn't too bad at the first glance, however this directly ties our possible UPS to the FPS. And when our FPS drop, because there are too many explosions on screen or another process on the device suddenly needs more resources, our UPS will drop as well. Of course, this is also valid the other way round, where a slow update would pull down the FPS.

The actual problem here is the user input. Because, where would be a good place to handle user input and e.g. move the user's character? Yes, inside the `update()` procedure. But if a player with a high end device has more update calls than a user with a low end device, then the high end user's game can handle more input commands per second than the low end user's game. This could mean, that the game experience varies depending on how performant the device is - something we absolutely want to avoid! And if the UPS drops due to the explosions, the game's responsiveness also suddenly drops. Just imagine something like this in a competitive game.

To tackle the input problem, it would be best if `update()` is always called the same number of times, independent from device performance and FPS drops - and this is exactly how I am going to build the engine: with a fixed UPS and as many FPS as the device can handle after it is done with `update()`.

But what is a good number for my UPS? As a first reference for the number, I took a look at the APM (actions per minute, roughly inputs per minute) some professional gamers can reach. The record is 818 APM, which is ~13.6 actions per second. My game will be far from any of the fast paced games, and will more likely require around 1 action per second.

Does this mean I could go with something like 1 or maybe 5 UPS? Definitely not. Because after the user's input, the user has to wait for the next update call to see the result of his actions. And if we run at 1 UPS, the user has to wait about 999 milliseconds in the worst case to see anything happen - the game would look super laggy. So, maybe 14 UPS evenly distributed over one second? In this case the user only has to wait ~71ms in the worst case.

I eventually went with 25 UPS, which means the user has to wait at max 40ms. Now, 25 is nearly twice the 13.6 actions per second an absolute pro gamer could reach - why so high? For one, I wanted an UPS limit that gives me nice numbers (1000ms / 25 UPS = 40ms/UPS, where 1000ms / 14 UPS = 71.42… ms/UPS). And I found 40ms an acceptable delay between user input and resulting action (compare it somewhat to your ping in an online game).

The resulting loop now looks like this:

```
let t = now();
let updateLag = 0;
let updateDelay = 40;

while (engine.running) {
    // get the time dt that elapsed since the last loop
    let n = now();
    let dt = n - t;
    t = n;

    // increase the time we waited to call update()
    updateLag += dt;

    while (updateLag >= updateDelay) {
        // when we waited long enough, call update()
        // as often as required to catch up
        engine.update();
        updateLag -= updateDelay;
    }
    engine.draw();
}
```

How it works:
- It uses a timestamp to determine the elapsed time since the last update (update lag)
- If the update lag if greater than the defined update delay (40ms for 25 UPS), the loop focuses on catching up with the updates before allowing the next draw call.
- If the update lag is less than the update delay, the loop does not update and continues to the next draw call.