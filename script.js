var leden = db.collection("leden").doc("2WZA7jq9QM4YfaQfzmVg")
var events = db.collection("events").doc("w53rEPYliAS9TeEZWmne")
var stamnames = db.collection("stamnaam").doc("RNO5xfQXLWlyzu4HW75c")
var games = db.collection("hermansgames").doc("z7lsp7lk2A9gLbyvCjrr")
var game =  db.collection("hermansgames").doc("games")
var currentUser = ''
var userStage =0;
var field = firebase.firestore.FieldValue
var interval;
games.onSnapshot(function(doc) {
        reload(doc.data())
});
game.onSnapshot(function(doc){
  reload_ready(doc.data())
})

function reload_ready(data){
  var users = data.ready_players;
  $('#ready').empty()
  for(var i in users){
  $('#ready').append('<span class="user">'+ users[i] + '</span>')
  }
  var stage= data.stage;
  if(currentUser){
  if(stage == 1 && userStage != 1){
    alert('Het spel is begonnen!')
    $('#home').hide()
    $('#invullen').show()
  }
  else if(stage == 2 && userStage != 2){
    userStage = 2;
    $('#waiting').hide();
    $('#lastCount').show()
    $('#first_player').text(data.current_player)
    if(data.current_player == currentUser){
      $('#start').show()
    }
  }
  else if(stage == 3 && userStage != 3){
    $('#round1').show()

  }
  if(data.countdown > 0 && $('#countdown').text() == 0){
    $('#countdown').show()
    var i = data.countdown;
    interval = window.setInterval(function(){
      if(i == 0){
        $('#countdown').hide()
        clearInterval(interval)
      }
      $('#countdown').text(i);
      i--
    },1000)

  }
}
}
function join(){
  currentUser = $('#name').val()
  if(currentUser.length>0){
    games.update({online:field.arrayUnion(currentUser)}).then(function(){
      games.get().then(function(doc){
        reload(doc.data())
      })
    })
    $('#landing').hide()
    $('#home').show()
    $('#greeting').text(currentUser);
}
else{
  alert('Voer een naam in')
}}
function leave()
{
  games.update({online:field.arrayRemove(currentUser)}).then(function(){
    $('#name').val('')
    $('#online').text('')
    $('#home').hide()
    $('#landing').show()
  })
  currentUser = ''
}
function reload(data){

  $('#online').empty()
  var users = data.online;
  for(var i in users){
    $('#online').append('<span class="user">'+ users[i] + '</span>')
  }
//  $('#online').text($('#online').text().substring(0, $('#online').text().length -2))
}
function begin(){
  $('#home').hide()
  $('#invullen').show()
  userStage = 1;
  game.get().then(function(doc){
    var first_player = doc.data().ready_players[0];
    game.update({'stage': 1, 'countdown': 29, 'current_player': first_player});
    window.setTimeout(function(){
      $('#countdown').text(0);
      clearInterval(interval)
      game.update({'stage': 2, 'countdown': 0, 'terms_copy': doc.data().terms})
    }, 30000)
  })

}
function klaar(){
  var term1 = $('#term1').val()
  var term2 = $('#term2').val()
  var term3 = $('#term3').val()

  if(term1.length == 0 || term2.length == 0|| term3.length == 0){
    alert('Voer 3 dingen in')
    return;
  }
  else if(term1 == term2 || term2 == term3 || term1 == term3){
    alert('Voer 3 verschillende dingen in')
    return;
  }

  game.get().then(function(doc){
    var terms = doc.data().terms;
    if(terms.indexOf(term1) != -1){
      $('#term1').val('')
      alert('Iemand heeft al 1 van je dingen ingevoerd. Deze is leeggemaakt.')
    }
    else if(terms.indexOf(term2) != -1){
      $('#term2').val('')
      alert('Iemand heeft al 1 van je dingen ingevoerd. Deze is leeggemaakt.')
    }
    else if(terms.indexOf(term3) != -1){
      $('#term3').val('')
      alert('Iemand heeft al 1 van je dingen ingevoerd. Deze is leeggemaakt.')
    }
    else{
      game.update({terms:field.arrayUnion(term1, term2, term3)}).then(function(){
        game.update({ready_players: field.arrayUnion(currentUser)})
        $('#invullen').hide()
        $('#waiting').show()
        game.get().then(function(doc){
          userStage = 1;
          // reload_ready(doc.data());
        })
      })

  }
 
})
}

function start(){
  // you are now in a round!
  userStage=3;
  $('#round1').show();
  game.get().then(function(doc){
    var terms = doc.data().terms
    game.update({'stage': 3});
  })


}
