export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.initElements();
    }
    
    initElements() {
        this.elements = {
            hud: document.getElementById('hud'),
            score: document.getElementById('scoreDisplay'),
            lives: document.getElementById('lives'),
            level: document.getElementById('levelDisplay'),
            bombs: document.getElementById('bombs'),
            slow: document.getElementById('slow'),
            bossHealth: document.getElementById('bossHP'),
            bossWrap: document.getElementById('bossWrap'),
            shopPanel: document.getElementById('shop'),
            mainMenu: document.getElementById('mainMenu'),
            gameOverMenu: document.getElementById('gameOver')
        };
    }
    
    updateHUD() {
        if (this.elements.score) {
            this.elements.score.textContent = this.game.stats.pts;
        }
        if (this.elements.lives) {
            this.elements.lives.textContent = `❤${this.game.stats.lives}`;
        }
        if (this.elements.level) {
            this.elements.level.textContent = this.game.stats.lvl;
        }
        if (this.elements.bombs) {
            this.elements.bombs.textContent = this.game.bombs;
        }
        if (this.elements.slow) {
            this.elements.slow.textContent = this.game.slowC;
        }
    }
    
    updateShop() {
        const bombPrice = Math.floor(50 * Math.pow(1.2, this.game.bombs));
        const slowPrice = Math.floor(100 * Math.pow(1.3, this.game.slowC));
        
        const bombBtn = document.getElementById('buyBomb');
        const slowBtn = document.getElementById('buySlow');
        
        if (bombBtn) {
            bombBtn.textContent = `Bomb (${bombPrice})`;
            bombBtn.disabled = this.game.stats.pts < bombPrice;
        }
        
        if (slowBtn) {
            slowBtn.textContent = `Slow (${slowPrice})`;
            slowBtn.disabled = this.game.stats.pts < slowPrice;
        }
    }
    
    updateBossHealth() {
        if (!this.game.boss.active) {
            if (this.elements.bossWrap) {
                this.elements.bossWrap.style.display = 'none';
            }
            return;
        }
        
        if (this.elements.bossWrap) {
            this.elements.bossWrap.style.display = 'block';
        }
        
        if (this.elements.bossHealth) {
            const healthPercent = (this.game.boss.health / this.game.boss.maxHealth) * 100;
            this.elements.bossHealth.style.width = healthPercent + '%';
        }
    }
    
    toggleShop() {
        if (this.elements.shopPanel) {
            const isVisible = this.elements.shopPanel.style.display === 'block';
            this.elements.shopPanel.style.display = isVisible ? 'none' : 'block';
            this.updateShop();
        }
    }
    
    showMainMenu() {
        if (this.elements.mainMenu) {
            this.elements.mainMenu.style.display = 'block';
        }
        if (this.elements.gameOverMenu) {
            this.elements.gameOverMenu.style.display = 'none';
        }
        if (this.elements.hud) {
            this.elements.hud.style.display = 'none';
        }
    }
    
    showGameOver() {
        if (this.elements.gameOverMenu) {
            this.elements.gameOverMenu.style.display = 'block';
        }
        if (this.elements.mainMenu) {
            this.elements.mainMenu.style.display = 'none';
        }
        if (this.elements.hud) {
            this.elements.hud.style.display = 'none';
        }
        
        const finalScore = document.getElementById('finalScore');
        if (finalScore) {
            finalScore.textContent = this.game.stats.pts;
        }
    }
    
    showGame() {
        if (this.elements.hud) {
            this.elements.hud.style.display = 'block';
        }
        if (this.elements.mainMenu) {
            this.elements.mainMenu.style.display = 'none';
        }
        if (this.elements.gameOverMenu) {
            this.elements.gameOverMenu.style.display = 'none';
        }
    }
    
    levelUp() {
        // Add level up visual effect if needed
        this.updateHUD();
    }
    
    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 600);
    }
}