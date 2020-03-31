var leden = db.collection("leden").doc("2WZA7jq9QM4YfaQfzmVg")
var events = db.collection("events").doc("w53rEPYliAS9TeEZWmne")
var stamnames = db.collection("stamnaam").doc("RNO5xfQXLWlyzu4HW75c")
var game =  db.collection("hermansgames").doc("games")
var currentUser = ''
var userStage =0;
var field = firebase.firestore.FieldValue
var currentTerm;
var ready = false;
var yourturn = false;
var stage;
var showing = false;
game.onSnapshot(function(doc){
  reload(doc.data())
})
game.get().then(function (doc) {
  reload(doc.data())
})
function stuur(){
  game.update({'terms': field.arrayUnion($('#card').val())})
  alert('Gelukt!')
  $('#card').val('')
}
function reload(data){
  stage = data.stage;
  console.log(stage)
  $('#round').text(stage)
}
function show(){
  if(!showing){
  game.get().then(function(doc){
    var terms = doc.data().terms
    //get random term
    if(terms.length == 0 || doc.data().kijken){
      // $('#termCard').text('Geen Kaartjes')
      return;
    }
    var term = terms[Math.floor(Math.random()*terms.length)];

    console.log(term);
    //remove term from terms list
    game.update({'terms': field.arrayRemove(term), 'kijken': true});
    showing = true;
    currentTerm = term;
    $('#show').text('Verberg')
    $('#termCard').text(term)
  })
}
else{
  if(currentTerm){
  game.update({'terms': field.arrayUnion(currentTerm), 'kijken': false});
  }
  $('#termCard').text('?')
  currentTerm = false;
  showing = false;
  $('#show').text('Toon')

}
}
function next(){
  game.update({'terms_copy': field.arrayUnion(currentTerm)});
  game.get().then(function(doc){
    var terms = doc.data().terms
    //get random term
    if(terms.length == 0){
      // $('#termCard').text('Geen Kaartjes')
      game.update({'terms': field.arrayRemove(currentTerm)});
      $('#termCard').text('?')
      currentTerm = false;
      showing = false;
      $('#show').text('Toon')
      return;
    }
    var term = terms[Math.floor(Math.random()*terms.length)];

    console.log(term);
    //remove term from terms list
    game.update({'terms': field.arrayRemove(term)});
    showing = true;
    currentTerm = term;
    $('#show').text('Verberg')
    $('#termCard').text(term)
  })
}
function scoreMin(){ $('#scoreCard').text(Number($('#scoreCard').text()) - 1)}
function scorePlus(){ $('#scoreCard').text(Number($('#scoreCard').text()) + 1)}
function nextRound(){
  game.get().then(function(doc){
    var terms_copy = doc.data().terms_copy
    var terms = doc.data().terms
    game.update({'stage': stage + 1,  'terms': terms.concat(terms_copy), 'terms_copy': []})
  })
}
function newGame(){
  game.update({'stage': 1,  'terms': [], 'terms_copy': []})
  show();
}
