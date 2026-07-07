firebase.auth().onAuthStateChanged(user => {

    if (!user) {
        alert("ログインしてください");
        location.href = "login.html";
        return;
    }

    loadCourses();

});

//-----------------------
// コース一覧取得
//-----------------------

function loadCourses(){

    window.db.collection("courses")
    .get()
    .then(snapshot=>{

        const select =
        document.getElementById("courseSelect");

        select.innerHTML="";

        snapshot.forEach(doc=>{

            select.innerHTML += `
            <option value="${doc.id}">
                ${doc.id}
            </option>
            `;

        });

        if(snapshot.size>0){
            loadCourse();
        }

    });

}

document
.getElementById("courseSelect")
.addEventListener("change",loadCourse);

//-----------------------
// コース読込
//-----------------------

function loadCourse(){

    const id =
    document.getElementById("courseSelect").value;

    if(id=="") return;

    window.db.collection("courses")
    .doc(id)
    .get()
    .then(doc=>{

        const data=doc.data();

        document.getElementById("duration").value=
        data.duration;

        document.getElementById("dishes").value=
        data.dishes.join("\n");

    });

}

//-----------------------
// 保存
//-----------------------

function saveCourse(){

    const id=
    document.getElementById("courseSelect").value;

    const duration=
    Number(
    document.getElementById("duration").value);

    const dishes=
    document.getElementById("dishes")
    .value
    .split("\n")
    .map(x=>x.trim())
    .filter(x=>x!="");

    window.db.collection("courses")
    .doc(id)
    .update({

        duration:duration,

        dishes:dishes

    })
    .then(()=>{

        alert("保存しました");

    });

}

//-----------------------
// コース追加
//-----------------------

function addCourse(){

    const name=
    prompt("新しいコース名");

    if(!name) return;

    window.db.collection("courses")
    .doc(name)
    .set({

        duration:90,

        dishes:[]

    })
    .then(()=>{

        alert("追加しました");

        loadCourses();

    });

}

//-----------------------
// コース削除
//-----------------------

function deleteCourse(){

    const id=
    document.getElementById("courseSelect").value;

    if(!confirm(id+"を削除しますか？")) return;

    window.db.collection("courses")
    .doc(id)
    .delete()
    .then(()=>{

        alert("削除しました");

        loadCourses();

    });

}

//-----------------------
// コース名変更
//-----------------------

function renameCourse(){

    const oldName=
    document.getElementById("courseSelect").value;

    const newName=
    prompt("新しいコース名");

    if(!newName) return;

    window.db.collection("courses")
    .doc(oldName)
    .get()
    .then(doc=>{

        return window.db
        .collection("courses")
        .doc(newName)
        .set(doc.data());

    })
    .then(()=>{

        return window.db
        .collection("courses")
        .doc(oldName)
        .delete();

    })
    .then(()=>{

        alert("変更しました");

        loadCourses();

    });

}