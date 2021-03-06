export class cardHotbarPopulator {
    constructor() { 
        this.macroMap = this.chbGetMacros();
    }

    async addCardToHand(cardId) {
        let empty = this.macroMap.filter(function (card) {
            return card === null;
          });
        console.debug("Card Hotbar | Adding card to hand...");
        //generate macro for card
        //TODO: better consolidate with code in index.js in hotbarDrop hook (call hook? make function at least?)
        // Make a new macro for the Journal
        let journal = {};
        let firstEmpty = this.macroMap.findIndex(null);
        //check for invalid input
        if (!cardID.length) {
            ui.notifications.notify.error("Please provide an array of cardIDs");
            return false;
        } 
        for (let i = 0; i < cardID.length; i++) { 
            if ( this.macroMap.length > i + firstEmpty ) {
                journal = game.journal.get(cardId[i]);
                Macro.create({
                    name: `Card: ${journal.name}`,
                    type: "script",
                    flags: {
                    "world": {
                        "cardID": `${journal.id}`,
                    }
                    },
                    scope: "global",
                    //Change first argument to "text" to show the journal entry as default.
                    //NOTE: In order for this macro to work (0.6.5 anyway) there MUST be text (content attribute must not be null).
                    command: `game.journal.get("${journal.id}").show("image", false);`,

                    img: `${game.journal.get(journal.id).data.img}`
                }).then(macro => {
                    window.cardHotbar.chbSetMacro(macro.id, firstEmpty+i);
                });
            } else {
                ui.notifications.notify.warn("Not enough space in hand, at least 1 card not added.");
                ui.cardHotbar.render();
                return -1;
            }
        }
        return ui.cardHotbar.render();
    }
    
    compact() {
        let filled = this.macroMap.filter(function (card) {
            return card != null;
          });
        filled.unshift(null);
        console.debug("Card Hotbar | Compacting... ");
        console.debug(filled);
        return filled;
    }

    //TO DO: Create single chbGetMacro function for completeness and convenience.
    
    /**
     * Returns all cardHotbar macros
     * @return {string[]} [slot]: macroId
     */
    chbGetMacros() {
        return game.user.getFlag('cardsupport', 'chbMacroMap') || [];
    }

    /**
     * Set or replace a macro on one of the card hotbar slots.
     * @param {string} macroId
     * @param {number} slot 
     * @return {Promise<unknown>} Promise indicating whether the macro was set and the hotbar was rendered.
     */
    chbSetMacro(macroId, slot) {
        console.debug("card Hotbar |", "Setting macro", slot, macroId);
        this.macroMap[slot] = macroId;
        this.macroMap = duplicate( this.compact() );
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => { 
            return ui.cardHotbar.render();
        });
    }

    /**
     * Replace all card hotbar slots.
     * @param {string[]} macros ([slot]: macroId)
     * @return {Promise<unknown>} Promise indicating whether the macros were set and the hotbar was rendered.
     */
    async chbSetMacros(macros) {
        /**
         * !
         * ! Assumes a single page card hotbar with slots 1-10
         * !
         */
        for (let slot = 1; slot < 11; slot++) {
            this.macroMap[slot] = macros[slot];
        }
        this.macroMap = duplicate( this.compact() );
        await this._updateFlags();
        return ui.cardHotbar.render();
    }

    /**
     * Remove the macro from the card hotbar slot.
     * @param {number} slot
     * @return {Promise<unknown>} Promise indicating whether the macro was removed.
     */
    chbUnsetMacro(slot) {
        this.macroMap[slot] = null;
        this.macroMap = duplicate( this.compact() );
        return this._updateFlags();
    }

    /**
     * Remove all macros from the card hotbar.
     * @return {Promise<unknown>} Promise indicating whether the macros were removed.
     */
    chbResetMacros() {
        this.macroMap = [];
        return this._updateFlags();
    }

    async _updateFlags() {
        await game.user.unsetFlag('cardsupport', 'chbMacroMap');
        return game.user.setFlag('cardsupport', 'chbMacroMap', this.macroMap);
    }
}
