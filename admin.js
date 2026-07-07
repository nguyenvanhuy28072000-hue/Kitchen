window.db.collection("courses").get().then(snapshot=>{
    console.log("取得件数:", snapshot.size);
    
    const select=document.getElementById("courseSelect");

    snapshot.forEach(doc=>{
        console.log(doc.id);
        
        select.innerHTML+=`
        <option value="${doc.id}">
            ${doc.id}
        </option>
        `;

    });

    loadCourse();

});

document.getElementById("courseSelect")
.addEventListener("change",loadCourse);

function loadCourse(){

    const id=document.getElementById("courseSelect").value;

    window.db.collection("courses")
    .doc(id)
    .get()
    .then(doc=>{

        const data=doc.data();

        document.getElementById("duration").value=data.duration;

        document.getElementById("dishes").value=
        data.dishes.join("\n");

    });

}

function saveCourse(){

    const id=document.getElementById("courseSelect").value;

    const duration=
    Number(document.getElementById("duration").value);

    const dishes=
    document.getElementById("dishes")
    .value
    .split("\n")
    .filter(x=>x!="");

    window.db.collection("courses")
    .doc(id)
    .update({

        duration:duration,

        dishes:dishes

    });

    alert("保存しました");

}