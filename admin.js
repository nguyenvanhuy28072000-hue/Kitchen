let currentDishes = [];
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

        alert("コース数：" + snapshot.size);

        const select =
        document.getElementById("courseSelect");

        select.innerHTML="";

        snapshot.forEach(doc=>{

            alert(doc.id);

            select.innerHTML += `
            <option value="${doc.id}">
                ${doc.id}
            </option>
            `;

        });

        if(snapshot.size>0){
            loadCourse();
        }

    })
    .catch(error=>{
        alert(error.message);
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

    const id =
    document.getElementById("courseSelect").value;

    const duration =
    Number(document.getElementById("duration").value);

    window.db.collection("courses")
    .doc(id)
    .update({

        duration: duration,

        dishes: currentDishes

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

function renderDishList(){

    const list =
    document.getElementById("dishList");

    list.innerHTML = "";

    currentDishes.forEach((dish,index)=>{

        list.innerHTML += `

        <div>

            <input
                value="${dish}"
                onchange="changeDish(${index},this.value)">

            <button
                onclick="deleteDish(${index})">

                削除

            </button>

        </div>

        `;

    });

}

function changeDish(index,value){

    currentDishes[index] = value;

}

function addDish(){

    currentDishes.push("新しい料理");

    renderDishList();

}

function deleteDish(index){

    currentDishes.splice(index,1);

    renderDishList();

}

window.addDish = addDish;
window.deleteDish = deleteDish;
window.changeDish = changeDish;