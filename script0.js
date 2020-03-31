var leden = db.collection("leden").doc("2WZA7jq9QM4YfaQfzmVg")
var events = db.collection("events").doc("w53rEPYliAS9TeEZWmne")
var stamnames = db.collection("stamnaam").doc("RNO5xfQXLWlyzu4HW75c")
var games = db.collection("hermansgames").doc("z7lsp7lk2A9gLbyvCjrr")
var game =  db.collection("hermansgames").doc("games")
var currentUser = ''
var userStage =0;
var field = firebase.firestore.FieldValue
var interval;
var ready = false;
var yourturn = false;
var user_player;
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
    userStage = 1;
    $('#home').hide()
    $('#invullen').show()
  }
  else if(stage == 2 && userStage != 2){
    if(!ready){
      alert("Je bent te laat!")
      $('#home').show()
      $('#invullen').hide()
    }
    userStage = 2;
    $('#waiting').hide();
    $('#lastCount').show()
    $('#first_player').text(data.current_player)
    if(data.current_player == currentUser){
      $('#start').show()
    }
  }

  if(data.countdown > 0 && $('#countdown').text() == 0){
    $('#countdown').show()
    var i = data.countdown;
    clearInterval(interval)
    interval = window.setInterval(function(){
      if(i == 0){
        $('#countdown').hide()
        clearInterval(interval)
      }
      $('#countdown').text(i);
      i--
    },1000)

  }
  if(data.stage == 4 || data.stage==6){
    //break
    $('#round').hide()
    $('#sleepingRound').hide()
    $('#lastCount').show()
    if(currentUser == data.current_player){
      $('#start').hide()
    }
    game.get().then(function(doc){
      $('#first_player').text(doc.data().current_player)
    })
  }
  if(data.current_player == currentUser && (data.stage == 3 || data.stage == 5 || data.stage == 7) && !yourturn){
    $('#sleepingRound').hide()
    start();
  }

  if(data.current_player != user_player && data.current_player != currentUser && data.stage > 2){
    $('#current_player').text(data.current_player);
    $('#round').hide()
    $('#lastCount').hide()
    $('#sleepingRound').show()
    $('#start').hide()
    userStage = data.stage;
  }
  else if(data.current_player != user_player && data.current_player == currentUser){
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
  game.get().then(function(doc){
    if(doc.data().stage != 0){
      alert("Er is al een spel bezig.")
      return;
    }
  })
  game.update({'ready_players': [], 'stage': 0, 'terms': [], 'terms_copy': []})
  $('#home').hide()
  $('#invullen').show()
  userStage = 1;
  game.get().then(function(doc){

    game.update({'stage': 1, 'countdown': 29});
    window.setTimeout(function(){
      if(!ready){
        alert('Je bent te laat met invullen.')
      }
      $('#countdown').text(0);
      clearInterval(interval)
      game.get().then(function(doc){
        var first_player = doc.data().ready_players[0];
        if(!first_player){
          alert('Niemand heeft iets ingevuld.')
        }
        game.update({'stage': 2, 'countdown': 0, 'terms_copy': doc.data().terms, 'current_player': first_player})
        $('#round_number').text('1')
      })

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
        ready=true;
        game.get().then(function(doc){
          userStage = 1;
          // reload_ready(doc.data());
        })
      })

  }

})
}
var time = true;
function start(){
  // you are now in a round!
  game.get().then(function(doc){
    if(doc.data().stage % 2 ==0){
      //we're in a pause, let's begin
      game.update({'stage': doc.data().stage + 1})
    }
  })
  yourturn = true;
  console.log('starting')
  $('#lastCount').hide()
  $('#round').show();
  game.update({'countdown': 29})
  time = true;
  window.setTimeout(function(){
    alert('turn over')
    yourturn = false;
    time = false
    game.get().then(function(doc){
      var index=  doc.data().ready_players.indexOf(currentUser);
      if(doc.data().ready_players[index+1]){
        next_player = doc.data().ready_players[index+1];
      }
      else{
        next_player = doc.data().ready_players[0]
      }
      game.update({'current_player': next_player, 'countdown': 0})
    })

  }, 30000);
  nextTerm()
}
function nextTerm() {
  console.log('next term')
  if(time){
  game.get().then(function(doc){
    var terms = doc.data().terms
    //get random term
    if(terms.length == 0){
      nextRound()
      return;
    }
    var term = terms[Math.floor(Math.random()*terms.length)];
    console.log(term);
    //remove term from terms list
    game.update({'terms': field.arrayRemove(term)});
    $('#termCard').text(term)
  })
}
  else{
    //
  }
}
function nextRound(){
  if(userStage>6){
    endGame()
  }
  else{
    game.get().then(function(doc){
      var data= doc.data()
      game.update({
        'stage': data.stage + 1,
        'terms': data.terms_copy,
        'current_player': data.ready_players[0]
      })
    })
    $('#round_number').text(Number($('#round_number').text()) + 1)
  }
}
function endGame(){

}
