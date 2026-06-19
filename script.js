//① コース内容の定義
//各コースにどんな料理が入っているかを登録。
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

//② コース時間の定義
//コース開始からL.O.までの時間。
const courseDuration = {
  "当日":70,
  "4000円":90,
  "4500円":90,
  "5000円":100,
  "6000円":110,
  "7000円":120
};

//③ コース追加
//「追加」ボタンを押した時の処理。
function addCourse() {
  //開始時間取得。
  const time = document.getElementById("courseTime").value;
  //コース取得。
  const course = document.getElementById("courseSelect").value;
  //人数取得。
  const people = document.getElementById("people").value;
  //卓番号取得。
  const table = document.getElementById("tableNo").value;

  //未入力チェック
  if (!time || !course || !people || !table) {
    alert("未入力があります");  //どれか空なら表示
    return;
  }

//注文データ作成。
  window.db.collection("orders").add({
    //基本情報
    time,
    course,
    people: Number(people),
    table,
  
  //料理一覧生成。
    dishes: courseData[course].map(d => ({
      name: d,
      done: false, //未提供状態。
    })),
  
    extraDishes: [],  //追加料理用。
  
    createdAt: Date.now() //登録時刻保存。
});

  document.getElementById("people").value = "";
  document.getElementById("tableNo").value = "";
}

//④ リアルタイム監視
window.db.collection("orders")
  .onSnapshot((snapshot) => {
    renderOrders(snapshot); //注文が増えたり削除されたら自動更新
  });

//⑤ 注文表示
//画面表示担当。
function renderOrders(snapshot) {
  const body = document.getElementById("courseBody");
  body.innerHTML = "";

  snapshot.docs

//進行中→開始前の順
.sort((a,b)=>{
  const timeCompare =
    a.data().time.localeCompare(b.data().time);

  if(timeCompare !== 0) return timeCompare;

  return (a.data().createdAt || 0) -
         (b.data().createdAt || 0);
})

//⑥ラストオーダー計算
.forEach(doc=>{
    const order = doc.data();
    const id = doc.id;

    const [h, m] = order.time.split(":");  //開始時刻分解。h=hour,m=minues

    const lo = new Date(); //日時作成。
    lo.setHours(Number(h));
    lo.setMinutes(Number(m) + courseDuration[order.course]); //コース時間加算。

    let loText =
      lo.getHours().toString().padStart(2,"0") +
      ":" +
      lo.getMinutes().toString().padStart(2,"0");

const now = new Date();

//⑦ 残り時間計算
// 残り時間計算(L.Oまで何分か。)
const remainMinutes =
  Math.floor((lo.getTime() - now.getTime()) / 60000);

//⑧進捗バー計算
//開始時刻。
const startMinutes =
  Number(h) * 60 + Number(m);

//現在時刻。
const nowMinutes =
  now.getHours() * 60 +
  now.getMinutes();

//コース時間。
const duration =
  courseDuration[order.course];
const totalCols =
  order.dishes.length +
  ((order.extraDishes && order.extraDishes.length) || 0);

//進捗率。
let progress =
  ((nowMinutes - startMinutes) / duration) * 100;

if(progress < 0) progress = 0;
if(progress > 100) progress = 100;

let rowClass = "";

if(order.course === "当日"){
  rowClass = "courseTodayRow";
}
else if(order.course === "4000円"){
  rowClass = "course4000Row";
}
else if(order.course === "4500円"){
  rowClass = "course4500Row";
}
else if(order.course === "5000円"){
  rowClass = "course5000Row";
}
else if(order.course === "6000円"){
  rowClass = "course6000Row";
}
else if(order.course === "7000円"){
  rowClass = "course7000Row";
}

let loClass = "";
let progressClass = "";

//⑩ 色変更
//L.O超過。
if(remainMinutes < 0){

  loClass = "loRed";
  loText = "L.O.過ぎ";

  progressClass = "progressRed";

}
else if(remainMinutes <= 10){

  loClass = "loRed"; 
  progressClass = "progressRed";  //バー赤。

}
else if(remainMinutes <= 30){

  loClass = "loYellow";
  progressClass = "progressYellow"; //黄色。

}

    let html = `
      <tr class="${rowClass}">

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

        <td
  id="lo-${id}"
  class="${loClass}">
  ${loText}
</td>
    `;

//⑪ 料理表示
    //料理を1セルずつ作成
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
    
//⑫ 追加料理表示
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


<tr class="${rowClass}">

  <td colspan="7"></td>

  <td colspan="${totalCols}">
  
    <div class="progressWrap">
      <div
        id="progress-${id}"
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

//⑭ 更新処理
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

//⑮ 完了済み表示
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

//⑯ ドラッグ移動
//つかむ
function dragDish(orderId,index){

  dragIndex = index;
  dragOrderId = orderId;

}
//並び替え
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

//⑰ 提供済み切替
//料理タップ時。
function toggleDish(orderId, index) {
  const ref = window.db.collection("orders").doc(orderId);

  ref.get().then(doc => {
    const data = doc.data();

    data.dishes[index].done = !data.dishes[index].done;

    const allDone = data.dishes.every(d => d.done);

//全部完了したら「conpleteOrder」に移動
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

//⑱ 削除
function deleteOrder(id) {
  if (confirm("削除しますか？")) {
    window.db.collection("orders").doc(id).delete();
  }
}

//⑲ 戻す
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

//⑳ 追加料理
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

//㉑ コース変更
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

//㉒ 1秒ごと更新
setInterval(() => {

  window.db.collection("orders")
    .get()
    .then(snapshot => {

      snapshot.forEach(doc => {

        const order = doc.data();
        const id = doc.id;

        const [h,m] =
          order.time.split(":");

        const now = new Date();

        const startMinutes =
          Number(h) * 60 + Number(m);

        const nowMinutes =
          now.getHours() * 60 +
          now.getMinutes();

        const duration =
          courseDuration[order.course];

        let progress =
          ((nowMinutes - startMinutes)
          / duration) * 100;

        if(progress < 0) progress = 0;
        if(progress > 100) progress = 100;

        const bar =
          document.getElementById(
            `progress-${id}`
          );

        if(bar){
          bar.style.width =
            progress + "%";
        }

      });

    });

},1000);