# Kanjiland - Sprites and Animations
In the [last part](/playground/kanjiland/02-engine.md) I briefly talked about the art style for kanjiland: top-down, 2D and pixelated. The easiest way to achieve this look  probably is to use sprites, images of the objects you need in your game (e.g. a toaster) with the desired look and no background, and draw them on the screen. And because I am going for a pixelated look, it is enough to create small images and scale them up for drawing. The only thing to remember when doing this, is to turn of anti-aliasing, or all the crisp pixels will get smoothened away.

So, the most difficult part of this "easy" way is to actually create these sprites. This could be done with the good old MS Paint, but there are probably better tools out there. I worked with GIMP for a while and it wasn't too bad, but after looking around a bit, I finally invested $9 for [Pyxel Edit](https://pyxeledit.com/), and it was absolutely worth it. But independent from the tool, you will have to spend some time learning the tool and then learning to actually draw. There are lots of helpful resources out there to get you started, and after this, it is simply learning by doing, doing, doing and doing.

![A simple toaster](/playground/kanjiland/img/2019-11-15-toaster-single.png){contain bg-bright}

Once you got the sprite, actually drawing it is very easy, thanks to PixiJS. After the drawing context is initially created, the engine can pass it some `Sprite` objects to draw. PixiJS also brings a texture loader, which makes loading the `toaster.png` a simple call and stores the loaded image in a dictionary. This way, the image needs to be loaded only once and can easily be assigned to multiple `Sprite` objects.

## Coordinates
The only thing I had to adjust for the PixiJS `Sprites` were the coordinates. PixiJS uses pixel values to position a sprite on the screen. This isn't a big deal if you know your canvas (the area you draw on) will always be 800x800 pixels large. For kanjiland, I want to be able to play it in my browser on a desktop computer and on a mobile phone as well. This means I will have drastically different resolutions to deal with, which will probably even affect how large a single sprite will be drawn.

I could now check the current resolution whenever a sprite is about to be drawn and adjust the values accordingly. But then there is also things like velocity, which might have to be adjusted, and probably other places as well. 

So, instead of adjusting pixel values at many places, I add another coordinate system that will be used everywhere in the game: setting the size of a sprite, adding some velocity to a sprite's position, ... This overlaying coordinate system is based on the size of the player's character, where by definition the size of the player sprite is 1x1 units. Everything else is adjusted based on this, so a toaster might have only half the size 0.5x0.5, while a dragon might be 3x2 large and 3.14 units away. Movement speed for the player now is something like 1.5 units/second, and so on.

Before I can use these unit values to draw a PixiJS `Sprite`, they have to be converted back to actual pixel values. To do this, I define a `pixelPerUnit` value, by which the unit values can be multiplied to get the pixel values. The `pixelPerUnit` value is determined when the engine is initialized and can there be adjusted to fit a desktop browser with larger device pixels or a mobile phone screen in portrait mode.

To make handling the `pixelPerUnit` conversion easier, I created my own `SpriteObject` that wraps the  PixiJS `Sprite`. The engine only interacts with the `SpriteObject`, and the `SpriteObject` will convert the units to pixels when it is time to draw the PixiJS `Sprite`.

As a small bonus, this unit system also makes it very simple to play around with the "camera distance" in the beginning, until I got some values that feel good. By "camera distance" in this case I mean how large is the player in relation to the visible area and how much of the space around the player is shown on screen. 

## Animated Sprites

Animations are integral for a living world, and of course kanjiland will need some as well. Since I already integrated static sprites, the easiest way to go for animations are the good, old sprite sheets. These are images that contain all the frames of an animation. To play the animation, the individual frames are played in a sequence at a certain speed.

![The sprite sheet for the toaster with 3 frames](/playground/kanjiland/img/2019-11-15-toaster.png){contain bg-bright}

So no complex transformations or bones to manipulate, the only thing we have to do is cutting out the correct part of the sprite sheet for the current step of the animation and increase this animation step at the correct speed.

The fixed 25 updates per second from the last chapter now come in pretty handy:
- They limit the maximum number of individual images of an animation to 25 per second (ok, to be honest, my animations will use more like 4-8 images per second)
- Once we know how many steps an animation contains, we can easily tune the playback speed

PixiJS brings along some tools for animated sprites, but I decided to build my own, simple `AnimatedSpriteObject` based on the `SpriteObject` I already have. The `AnimatedSpriteObject` keeps track of the current frame of the animation. The frame number increases until the last frame is reached, and then is reset back to the first frame. Based on the current frame number, the `AnimatedSpriteObject` determines which rectangle of the sprite sheet will be cut out and rendered to the screen. And since PixiJS takes care of actually cutting out the frame, this is all the `AnimatedSpriteObject` has to do (for now).

![The animated toaster](/playground/kanjiland/img/2019-11-15-toaster.gif){contain bg-bright}

```
// pseudo code for a sprite sheet with 5 frames in one row

let currentFrame = 0;
let frameCount = 5;
let animationSpeed = 1 / 25;
let frameWidth = 100; // pixel
let frameHeight = 100; // pixel
let cutoutRect = new Rectangle(0, 0, frameWidth, frameHeight);
let texture = new Texture("toaster.png");

// called 25 times per second
function updateAnimation() {
    // % is the modulo operator
    currentFrame = (currentFrame + animationSpeed) % frameCount;
    cutoutRect.x = Math.floor(currentFrame) * frameWidth;
}

function render() {
    // not an actual functions of PixiJS
    PixiJS.Sprite.renderCutout(texture, cutoutRect);
}
```