function login(){
　
firebase.auth().signInWithEmailAndPassword(
document.getElementById("email").value,
document.getElementById("password").value
)
.then(()=>{
window.location.href="index.html";
})
.catch(error=>{

if(
error.code === "auth/user-not-found" ||
error.code === "auth/wrong-password" ||
error.code === "auth/invalid-credential"
){
alert("メールアドレスまたはパスワードが間違っています。");
}
else{
alert(error.message);
}

});

}