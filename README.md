# Color Burst Clicker

A fast-paced, colorful clicker game with multiple game modes, power-ups, and progression systems. Built with vanilla JavaScript, HTML5 Canvas, and modern web technologies.

## 🎮 Game Features

### Game Modes
- **Classic Mode**: Traditional clicker gameplay with increasing difficulty
- **Time Attack**: Race against the clock to achieve the highest score
- **Zen Mode**: Relaxing endless mode without pressure

### Game Elements
- **Orbs**: Click to score points and build combos
- **Bombs**: Avoid clicking these or lose points
- **Stars**: Special items that give bonus points and power-ups
- **Decoys**: Trick orbs that look like stars but give no points

### Power-ups
- **Slow Time**: Slows down orb movement temporarily
- **Multi-Score**: Doubles points for a short duration
- **Clear Screen**: Removes all bombs from the screen

### Progression System
- **Level System**: Progress through increasingly challenging levels
- **High Scores**: Track your best scores for each mode
- **Statistics**: Detailed gameplay statistics and achievements
- **Settings**: Customize audio, visual effects, and difficulty

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended for development)

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing!

### Development Setup
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## 🏗️ Project Structure

```
colourburst/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main styles
│   └── animations.css      # Animation definitions
├── js/
│   ├── game-engine.js      # Main game controller
│   ├── game.js            # Core game logic
│   ├── entities.js        # Game entities (orbs, bombs, etc.)
│   ├── particles.js       # Particle effects system
│   ├── audio.js           # Audio management
│   ├── powerups.js        # Power-up system
│   ├── ui.js             # User interface manager
│   ├── settings.js        # Settings and preferences
│   └── main.js           # Legacy file (replaced by game-engine.js)
└── README.md
```

## 🎯 How to Play

### Basic Controls
- **Click/Tap**: Pop orbs to score points
- **Space**: Pause/unpause the game
- **Escape**: Return to main menu

### Scoring
- **Regular Orbs**: 10 points each
- **Combos**: Multiplier increases with consecutive pops
- **Stars**: 50 points + power-up
- **Bombs**: -25 points if clicked

### Tips for Success
1. **Build Combos**: Try to pop orbs quickly to build combo multipliers
2. **Watch for Stars**: Stars give power-ups and bonus points
3. **Avoid Bombs**: Be careful not to click bombs
4. **Use Power-ups**: Strategic use of power-ups can boost your score
5. **Adjust Difficulty**: Choose the right difficulty for your skill level

## ⚙️ Customization

### Settings
Access settings from the main menu to customize:
- **Audio**: Enable/disable sound effects and music
- **Visual Effects**: Toggle particle effects and animations
- **Difficulty**: Choose between easy, normal, and hard modes
- **Vibration**: Enable/disable haptic feedback (mobile)

### Development
The game is built with modular JavaScript. Key files to modify:

- **Game Balance**: Modify `js/game.js` for difficulty scaling
- **Visual Effects**: Adjust `js/particles.js` and `css/animations.css`
- **Audio**: Add new sounds in `js/audio.js`
- **New Features**: Extend `js/game-engine.js` for new game modes

## 🎨 Customization Ideas

### Easy Modifications
- Change orb colors in `js/entities.js`
- Modify scoring values in `js/game.js`
- Adjust particle effects in `js/particles.js`
- Add new power-ups in `js/powerups.js`

### Advanced Features
- Add new game modes
- Implement multiplayer support
- Create custom themes
- Add leaderboards

## 📱 Mobile Support

The game is fully responsive and works on:
- **iOS Safari**: Touch controls and haptic feedback
- **Android Chrome**: Full touch support
- **Tablets**: Optimized for larger screens
- **Desktop**: Mouse and keyboard controls

## 🐛 Troubleshooting

### Common Issues

**Game won't load**
- Check browser console for errors
- Ensure all files are in the correct directory
- Try a different browser

**Audio not working**
- Check if audio is enabled in settings
- Ensure browser allows audio autoplay
- Try refreshing the page

**Performance issues**
- Reduce particle effects in settings
- Try a different browser
- Close other tabs/applications

**Touch controls not working**
- Ensure touch events are enabled in browser
- Try refreshing the page
- Check for browser updates

## 🔄 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 80+     | ✅ Full support |
| Firefox | 75+     | ✅ Full support |
| Safari  | 13+     | ✅ Full support |
| Edge    | 80+     | ✅ Full support |
| IE      | Any     | ❌ Not supported |

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📊 Performance

The game is optimized for:
- **60 FPS**: Smooth gameplay on modern devices
- **Low memory usage**: Efficient particle and entity management
- **Responsive design**: Adapts to any screen size
- **Progressive enhancement**: Works without JavaScript (basic HTML)

## 🎵 Audio Credits

All audio is procedurally generated using Web Audio API. No external audio files required.

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Online leaderboards
- [ ] Achievements system
- [ ] Custom themes
- [ ] Multiplayer modes
- [ ] Mobile app
- [ ] VR support
- [ ] Level editor

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

---

Enjoy playing Color Burst Clicker! 🌈✨