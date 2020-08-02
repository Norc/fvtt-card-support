import { Decks } from './deck.js';
export const mod_name = 'sdf-decks'
export const log = (...args: any[]) => {
  return console.log("Deck Importer | " + args);
};

Hooks.once("ready", async () => {
  //Creates A "Decks" folder where to unzip SDF Files

  let src = "data";
  //@ts-ignore
  if(typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge){
    src = "forgevtt"
  }
  let target = 'Decks'
  let result = await FilePicker.browse(src, target)
  if(result.target != target){
    await FilePicker.createDirectory(src, target, {});
  }

  //Registers the Decks Object 
  game.decks = new Decks()
  game.decks.init();
})


Hooks.on('renderJournalDirectory', (app, html, data) => {
  const deckImportButton = $(`<button class="importButton">${game.i18n.localize("DECK.Import_Button")}</button>`);
  html.find(".directory-footer").append(deckImportButton);

  const deckImportDialog = `
  <div class="form-group" style="display:flex; flex-direction:column">
    <h1 style="flex:2">${game.i18n.localize("DECK.Dialog_Title")}</1>
    <input id="file" type="file" />  
  </div>
  `
  
  deckImportButton.click( (ev) => {
    new Dialog({
      title: game.i18n.localize("DECK.Dialog_Title"),
      content: deckImportDialog,
      buttons: {
        ok: {
          label: game.i18n.localize("DECK.Import_Button"),
          callback: async (form) => {
            game.decks.create($(form).find('#file')[0]['files'][0])
          }
        }, 
        cancel: {
          label: game.i18n.localize("DECK.Cancel")
        }
      }
    }).render(true)
  })
})