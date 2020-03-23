var leden = db.collection("leden").doc("2WZA7jq9QM4YfaQfzmVg")
var events = db.collection("events").doc("w53rEPYliAS9TeEZWmne")
var stamnames = db.collection("stamnaam").doc("RNO5xfQXLWlyzu4HW75c")
var games = db.collection("hermansgames").doc("z7lsp7lk2A9gLbyvCjrr")
var currentUser = ''
var field = firebase.firestore.FieldValue

games.onSnapshot(function(doc) {
        reload(doc.data())
});
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
    $('#greeting').text(currentUser)


}
else{
  alert('Voer een naam in')
}
}
function leave(){

  games.update({online:field.arrayRemove(currentUser)}).then(function(){
    $('#name').val('')
    $('#online').text('')
    $('#home').hide()
    $('#landing').show()
  })
  currentUser = ''
}
function reload(data){

  $('#online').text('')
  var users = data.online;
  for(var i in users){
    $('#online').text($('#online').text() + users[i] + ', ')
  }
  $('#online').text($('#online').text().substring(0, $('#online').text().length -2))
}
