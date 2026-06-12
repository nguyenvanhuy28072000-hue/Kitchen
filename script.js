const courseData = {
"当日":[
  "お造り","サラダ","焼き鳥２種","串揚げ３種","デザート"
],
"4000円":[
  "お造り","サラダ","揚げ物２種","鳥バジルソース","カレーつくね","ちまき"
],
"4500円":[
  "お造り","サラダ","キス、なす天","つくねと万願寺","さわら","ちまき","デザート"
],
"5000円":[
  "お造り","湯葉","サラダ","エビ、なす天","はもユーリンチ","鶏のてりやき","ちまき","デザート"
],
"6000円":[
  "お造り","湯葉","サラダ","はも、生麩の揚げ出し","豚しゃぶ","さわら","ちまき","デザート"
],
"7000円":[
  "お造り","湯葉","サラダ","エビ、なす、万願寺の天","はもユーリンチ","鶏のてりやき","さわら","ちまき","デザート"
]
};

const courseDuration = {
  "当日":70,
  "4000円":90,
  "4500円":90,
  "5000円":100,
  "6000円":110,
  "7000円":120
};

function addCourse() {
  const time = document.getElementById("courseTime").value;
  const course = document.getElementById("courseSelect").value;
  const people = document.getElementById("people").value;
  const table = document.getElementById("tableNo").value;

  if (!time || !course || !people || !table) {
    alert("未入力があります");
    return;
  }

  window.db.collection("orders").add({
    time,
    course,
    people: Number(people),
    table,
  
  
    dishes: courseData[course].map(d => ({
      name: d,
      done: false
    })),
  
    extraDishes: [],
  
    createdAt: Date.now()
});

  document.getElementById("people").value = "";
  document.getElementById("tableNo").value = "";
}

window.db.collection("orders")
  .onSnapshot((snapshot) => {
    renderOrders(snapshot);
  });

function renderOrders(snapshot) {
  const body = document.getElementById("courseBody");
  body.innerHTML = "";

  snapshot.docs
.sort((a,b)=>{
  const timeCompare =
    a.data().time.localeCompare(b.data().time);

  if(timeCompare !== 0) return timeCompare;

  return (a.data().createdAt || 0) -
         (b.data().createdAt || 0);
})
.forEach(doc=>{
    const order = doc.data();
    const id = doc.id;

    const [h, m] = order.time.split(":");

    const lo = new Date();
    lo.setHours(Number(h));
    lo.setMinutes(Number(m) + courseDuration[order.course]);

    let loText =
      lo.getHours().toString().padStart(2,"0") +
      ":" +
      lo.getMinutes().toString().padStart(2,"0");

const now = new Date();

const remainMinutes =
  Math.floor((lo.getTime() - now.getTime()) / 60000);


let t = (nowMinutes - startMinutes) / duration;

// 0〜1に制限
t = Math.min(1, Math.max(0, t));

let progress = t * 100;

let loClass = "";
let progressClass = "";

if(remainMinutes < 0){

  loClass = "loRed";
  loText = "L.O.過ぎ";

  progressClass = "progressRed";

}
else if(remainMinutes <= 10){

  loClass = "loRed";
  progressClass = "progressRed";

}
else if(remainMinutes <= 30){

  loClass = "loYellow";
  progressClass = "progressYellow";

}

    let html = `
      <tr>

        <td>
          <button onclick="addExtraDish('${id}')">
            ＋料理
          </button>
        </td>
        
        <td>
          <button onclick="deleteOrder('${id}')">
            削除
          </button>
        </td>

        <td>
          <input type="time"
            value="${order.time}"
            onchange="updateField('${id}','time',this.value)">
        </td>

        <td>
          <select onchange="updateCourse('${id}',this.value)">
          
          <option value="当日" ${order.course==="当日"?"selected":""}>当日</option>
          <option value="4000円" ${order.course==="4000円"?"selected":""}>4000円</option>
          <option value="4500円" ${order.course==="4500円"?"selected":""}>4500円</option>
          <option value="5000円" ${order.course==="5000円"?"selected":""}>5000円</option>
          <option value="6000円" ${order.course==="6000円"?"selected":""}>6000円</option>
          <option value="7000円" ${order.course==="7000円"?"selected":""}>7000円</option>
          
          </select>
        </td>

        <td>
          <input type="number"
            value="${order.people}"
            onchange="updateField('${id}','people',this.value)"
            style="width:50px;">
          名
        </td>

        <td>
          <input type="text"
            value="${order.table}"
            onchange="updateField('${id}','table',this.value)">
        </td>

        <td class="${loClass}">
            ${loText}
        </td>
    `;

    order.dishes.forEach((dish, i) => {
      html += `
        <td
            class="dish dish${i} ${dish.done ? "done" : ""}"
            draggable="true"
            ondragstart="dragDish('${id}',${i})"
            ondragover="event.preventDefault()"
            ondrop="dropDish('${id}',${i})"
            onclick="toggleDish('${id}',${i})"
          >
            ${dish.name}
        </td>
      `;
    });

if(order.extraDishes){

  order.extraDishes.forEach((dish,i)=>{

    html += `
      <td
        class="dish extraDish ${dish.done ? 'done' : ''}"
      
        draggable="true"
      
        ondragstart="dragExtraDish('${id}',${i})"
      
        ondragover="event.preventDefault()"
      
        ondrop="dropExtraDish('${id}',${i})"
      
        onclick="toggleExtraDish('${id}',${i})"
      >
        ★${dish.name}
      </td>
    `;

  });

}

    html += `
</tr>

<tr>

  <td colspan="7"></td>

  <td colspan="20">

    <div class="progressWrap">
      <div
        class="progressBar ${progressClass}"
        style="width:${progress}%">
      </div>
    </div>

  </td>

</tr>
`;

    body.innerHTML += html;
  });
}

   function updateField(orderId, field, value) {
  const ref = window.db.collection("orders").doc(orderId);

  ref.update({
    [field]: field === "people" ? Number(value) : value
  });
}


window.db.collection("completedOrders")
  .onSnapshot((snapshot) => {
    renderCompleted(snapshot);
  });

function renderCompleted(snapshot) {
  const body = document.getElementById("completedBody");
  body.innerHTML = "";

  snapshot.docs
.sort((a,b)=>
 (a.data().sortOrder || 0) -
 (b.data().sortOrder || 0)
)
.forEach(doc=>{
    const d = doc.data();

if(
  d.completedAt &&
  Date.now() - d.completedAt >
  60 * 60 * 1000
){
  window.db
    .collection("completedOrders")
    .doc(doc.id)
    .delete();

  return;
}

    body.innerHTML += `
      <tr>
        <td>${d.time}</td>
        <td>${d.course}</td>
        <td>${d.people}</td>
        <td>${d.table}</td>
        <td>${d.completedTime || ""}</td>
        <td>
          <button onclick="restoreOrder('${doc.id}')">戻す</button>
        </td>
      </tr>
    `;
  });
}
let dragIndex = null;
let dragExtraIndex = null;
let dragExtraOrderId = null;
let dragOrderId = null;

function dragDish(orderId,index){

  dragIndex = index;
  dragOrderId = orderId;

}

function dropDish(orderId,targetIndex){

  if(orderId !== dragOrderId) return;

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    const dishes = data.dishes;

    const moved =
      dishes.splice(dragIndex,1)[0];

    dishes.splice(targetIndex,0,moved);

    ref.update({
      dishes:dishes
    });

  });

}

function dragExtraDish(orderId,index){

  dragExtraIndex = index;
  dragExtraOrderId = orderId;

}

function dropExtraDish(orderId,targetIndex){

  if(orderId !== dragExtraOrderId) return;

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    const extra =
      data.extraDishes || [];

    const moved =
      extra.splice(dragExtraIndex,1)[0];

    extra.splice(targetIndex,0,moved);

    ref.update({
      extraDishes:extra
    });

  });

}

function toggleDish(orderId, index) {
  const ref = window.db.collection("orders").doc(orderId);

  ref.get().then(doc => {
    const data = doc.data();

    data.dishes[index].done = !data.dishes[index].done;

    const allDone = data.dishes.every(d => d.done);

    if (allDone) {
      window.db.collection("completedOrders").add({
        ...data,
        completedTime: new Date().toLocaleTimeString("ja-JP"),
        completedAt: Date.now()
      });

      ref.delete();
    } else {
      ref.update({ dishes: data.dishes });
    }
  });
}

function toggleExtraDish(orderId,index){

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    const extra =
      data.extraDishes || [];

    extra[index].done =
      !extra[index].done;

    ref.update({
      extraDishes:extra
    });

  });

}

function deleteOrder(id) {
  if (confirm("削除しますか？")) {
    window.db.collection("orders").doc(id).delete();
  }
}

function restoreOrder(id) {
  window.db.collection("completedOrders").doc(id).get()
    .then(doc => {
      const data = doc.data();

      delete data.completedTime;
      delete data.completedAt;
      
      window.db.collection("orders").add(data);

      window.db.collection("completedOrders").doc(id).delete();
    });
}

function addExtraDish(orderId){

  const choice = prompt(
`追加料理を選択(番号を入力してください)

0: 追加料理を削除
1: 焼き鳥
2: 宮炭`
  );

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    let extra =
      data.extraDishes || [];

    // 0なら最後の追加料理を削除
    if(choice === "0"){

      if(extra.length === 0){
        alert("追加料理がありません");
        return;
      }

      extra.pop();

      ref.update({
        extraDishes: extra
      });

      return;
    }

    let name = "";

    if(choice === "1") name = "焼き鳥";
    if(choice === "2") name = "宮炭";

    if(!name) return;

    extra.push({
      name:name,
      done:false
    });

    ref.update({
      extraDishes: extra
    });

  });

}

function updateCourse(orderId, newCourse) {

  window.db.collection("orders")
    .doc(orderId)
    .update({

      course: newCourse,

      dishes: courseData[newCourse].map(d => ({
        name: d,
        done: false
      }))

    });

}


function moveDishLeft(orderId,index){

  if(index === 0) return;

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    const dishes = data.dishes;

    const temp = dishes[index];

    dishes[index] = dishes[index-1];

    dishes[index-1] = temp;

    ref.update({
      dishes:dishes
    });

  });

}

function moveDishRight(orderId,index){

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    const dishes = data.dishes;

    if(index === dishes.length-1) return;

    const temp = dishes[index];

    dishes[index] = dishes[index+1];

    dishes[index+1] = temp;

    ref.update({
      dishes:dishes
    });

  });

}

window.addCourse = addCourse;
window.deleteOrder = deleteOrder;
window.updateField = updateField;
window.updateCourse = updateCourse;
window.toggleDish = toggleDish;
window.restoreOrder = restoreOrder;
window.moveDishLeft = moveDishLeft;
window.moveDishRight = moveDishRight;
window.dragDish = dragDish;
window.dropDish = dropDish;
window.toggleExtraDish = toggleExtraDish;
window.dragExtraDish = dragExtraDish;
window.dropExtraDish = dropExtraDish;

setInterval(() => {

  window.db.collection("orders").get()
    .then(snapshot => {
      renderOrders(snapshot);
    });

}, 60000);
