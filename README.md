# Jump 'n Bump (JavaScript)

![Screenshot](/public/screenshot.png 'Screenshot')

> **Play in your browser at https://jumpnbump.net** 🐰✨
>
> Alternatively available at https://jumpnbump.netlify.app

A JavaScript port of the original Jump 'n Bump game.

Play the classic Jump 'n Bump game directly in your browser! Choose from 200+ levels, customize game options, and enjoy the original multiplayer bunny action with friends around one keyboard or with game controllers.

Jump 'n Bump was originally a DOS game by Brainchild Design, which was open sourced under the GPL license and ported to SDL, and then SDL2, and now JavaScript!

## Controls

The controls are keyboard layout-independent, which means that regardless of
the layout that you are using (e.g. AZERTY or Dvorak), they are located as if
it were QWERTY.

The controls on a **QWERTY** keyboard are:

- A, W, D to steer Dot
- ←, ↑, → to steer Jiffy
- J, I, L to steer Fizz
- 4, 8, 6 to steer Mijji (on the numeric pad)

- ? (SHIFT + /) toggles the shortcut overlay
- F (SHIFT + f) toggles fullscreen
- ESC ends the current game. When pressed from the menu screen it will exit to the Web UI landing page.

### Game Controllers

Game controllers (gamepads) are supported via the Web Gamepad API. When a controller is connected, it will appear as an option in the player control dropdowns on the start screen.

Some controllers have built-in default mappings (e.g. 8BitDo Micro, Nintendo Joy-Con). For other controllers, you can use the **Configure** button to map your own left, right, and jump inputs. Both buttons and analog stick axes are supported. If you would like to contribute mappings for your own controllers, please submit a PR with the details!

## Extra levels

Additional levels can be loaded from the Web UI `Change level` button.

You can also play any valid `.dat` level file from your computer. Select the `Load Custom Level` button and choose the file from your Computer.

## Compilation

Requires Node.js 20+ to be installed on your machine.

1. Clone this repository
1. Change to the root directory of the repository
1. Run `npm install`
1. Run `npm run dev`
1. _(Optionally)_ To build final static assets run `npm run build`

## License

Jump 'n Bump is distributed under the GNU General Public License, version 2, or
(at your option) any later version (GPL-2.0+). See the AUTHORS file for
credits.
