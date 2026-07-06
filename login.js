function login(){

firebase.auth().signInWithEmailAndPassword(
document.getElementById("email").value,
document.getElementById("password").value
)
.then(()=>{
window.location.href="index.html";
})
.catch(error=>{
alert(error.message);
});

}