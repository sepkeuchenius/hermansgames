var leden = db.collection("leden").doc("2WZA7jq9QM4YfaQfzmVg")
var events = db.collection("events").doc("w53rEPYliAS9TeEZWmne")
var stamnames = db.collection("stamnaam").doc("RNO5xfQXLWlyzu4HW75c")
var game =  db.collection("hermansgames").doc("games")


// window.onunload = pageleave;
// var currentUser = prompt('Name')
var userStage =0;
var field = firebase.firestore.FieldValue
var currentTerm;
var ready = false;
var yourturn = false;
var stage;
var showing = false;
var online;
var count  = 1;
var jumpin = new Date().getTime();
var dif = jumpin - (Math.floor(jumpin / 1000) * 1000)
// console.log(dif)

game.onSnapshot(function(doc){
  reload(doc.data())
})

// window.setInterval(function(){
//   game.update({'ping': Math.random()})
// }, 1000)
function stuur(){
  //if already in list, bounce

  if($('#card').val().length == 0){
    alert('Je moet wel iets invullen!')
    return;
  }
  if($('#card').val() > 30){
    alert('MAND')
    return;
  }
  if($('#card').val() == 'ikbenbaas'){
    $('#actions').show()
    return;
  }
  game.get().then(function(doc){
    if(doc.data().terms.indexOf($('#card').val()) != -1){
      alert('Ooeps, deze is al ingestuurd!')
      return;
    }
    else{
      game.update({'terms': field.arrayUnion($('#card').val())})
      $('#stuur').text('Gelukt')
      window.setTimeout(function(){
          $('#stuur').text('Stuur')
      },1000)
      $('#card').val('')
    }
  })

}
function reload(data){

  stage = data.stage;
  $('#round').text(stage)
  if(data.term_online){
    $('#newCard').show()
  }
  else{
    $('#newCard').hide()
  }
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

    // console.log(term);
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
  if(currentTerm){
  game.update({'terms_copy': field.arrayUnion(currentTerm)});
}
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
function scoreMin(){
  // alert('Hoi Berend')
  $('#scoreCard').text(Number($('#scoreCard').text()) - 1)}
function scorePlus(){ $('#scoreCard').text(Number($('#scoreCard').text()) + 1)}
function nextRound(){
  game.get().then(function(doc){
    var terms_copy = doc.data().terms_copy
    var terms = doc.data().terms
    game.update({'stage': stage + 1,  'terms': terms.concat(terms_copy), 'terms_copy': [], 'kijken':false})
  })
}
function newGame(){
  game.update({'stage': 1,  'terms': [], 'terms_copy': []})
  $('#scoreCard').text(0)
  show();
}

function startTimer(){
  var interval;
  $('#timebutton').hide()

  var i = 29.99
  $('#time').text(i.toFixed(2))
  interval = window.setInterval(function(){
    i = i - 0.01
    $('#time').text(i.toFixed(2))
    var perc = (1 - (i / 30))*100;

    $('#bar').width(perc + '%')
  },10)
  window.setTimeout(function(){
    clearInterval(interval)
    $('#timebutton').show()
    $('#time').text(29.99)
    show();
    $('#playbutton').show()
    $('#cards').hide();
  }, 29990)

}
$('#playbutton').on('click', startturn);
function startturn(){
  startTimer();
  $('#playbutton').hide()
  $('#cards').show();
  show()
}
