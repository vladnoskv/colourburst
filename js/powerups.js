export class PowerUpManager {
    constructor(game) {
        this.game = game;
    }
    
    blast() {
        if (this.game.bombs <= 0) return;
        
        this.game.bombs--;
        this.game.ui.updateShop();
        this.game.ui.updateHUD();
        
        const entities = this.game.entities.entities;
        const toRemove = [];
        
        entities.forEach(entity => {
            if (entity.type !== 'bomb') {
                this.game.particles.createExplosion(entity.x, entity.y, entity.color);
                this.game.stats.pts += 10;
                toRemove.push(entity);
            }
        });
        
        toRemove.forEach(entity => this.game.entities.remove(entity));
        
        this.game.audio.play('bomb');
    }
    
    slow() {
        if (this.game.slowC <= 0) return;
        
        this.game.slowC--;
        this.game.slowT = 5;
        this.game.ui.updateShop();
        this.game.ui.updateHUD();
        
        this.game.audio.play('slow');
    }
}