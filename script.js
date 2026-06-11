
// コースのデータ
const courseData = {
"当日":[
    "お造り",
    "サラダ",
    "焼き鳥２種",
    "串揚げ３種",
    "デザート"
],
"4000円":[
    "お造り",
    "サラダ",
    "揚げ物２種",
    "鳥バジルソース",
    "カレーつくね",
    "ちまき"
],
"4500円":[
    "お造り",
    "サラダ",
    "キス、なす天",
    "つくねと万願寺",
    "さわら",
    "ちまき",
    "デザート"
],
"5000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "エビ、なす天",
    "はもユーリンチ",
    "鶏のてりやき",
    "ちまき",
    "デザート"
],
"6000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "はも、生麩の揚げ出し",
    "豚しゃぶ",
    "さわら",
    "ちまき",
    "デザート"
],
"7000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "エビ、なす、万願寺の天",
    "はもユーリンチ",
    "鶏のてりやき",
    "さわら",
    "ちまき",
    "デザート"
]

};
const courseDuration = {
    "当日":70,
    "4000円": 90,
    "4500円": 90,
    "5000円": 100,
    "6000円": 110,
    "7000円": 120
};

let orders =[];
let completedOrders = [];

async function saveOrders(){

    await setDoc(
        doc(db,"kitchen","orders"),
        {
            orders: orders,
            completedOrders: completedOrders
        }
    );

}



function addCourse() {
  const courseTime =
    document.getElementById("courseTime").value;
  const course =
    document.getElementById("courseSelect").value;
  const people =
    document.getElementById("people").value;
  const tableNo =
    document.getElementById("tableNo").value;

  // 入力チェック
  if (courseTime === "") {
    alert("時間を入力してください");
    return;
  }
  if (course === "") {
    alert("コースを選択してください");
    return;
  }
  if (people === "") {
    alert("人数を入力してください");
    return;
  }
  if (tableNo === "") {
    alert("卓番を入力してください");
    return;
  }

  // Firestoreに保存（ここが重要）
  window.db.collection("orders").add({
    time: courseTime,
    course: course,
    people: Number(people),
    table: tableNo,

    dishes: courseData[course].map(dish => ({
      name: dish,
      done: false
    })),

    createdAt: new Date()
  });

  // 入力リセット
  document.getElementById("people").value = "";
  document.getElementById("tableNo").value = "";
}


function toggleDish(orderIndex,dishIndex){
    console.log(orderIndex,dishIndex);
    
    orders[orderIndex]
        .dishes[dishIndex]
        .done =
    !orders[orderIndex]
        .dishes[dishIndex]
        .done;

    const allDone =
        orders[orderIndex]
        .dishes
        .every(d => d.done);

    if(allDone){

        alert("完了コースへ移動");

        completedOrders.push({
    ...orders[orderIndex],
    completedTime: new Date().toLocaleTimeString("ja-JP"),
    completedAt: Date.now()
});

        orders.splice(orderIndex,1);
    }

    saveOrders();
    render();
}

function deleteOrder(index){

    if(confirm("このコースを削除しますか？")){
        orders.splice(index,1);
         saveOrders();
         render();
    }

}

function renderOrders(snapshot) {
  const body = document.getElementById("courseBody");
  body.innerHTML = "";

  snapshot.forEach((doc) => {
    const order = doc.data();
    const orderId = doc.id;

    const [hour, minute] = order.time.split(":");

    const loTime = new Date();
    loTime.setHours(Number(hour));
    loTime.setMinutes(Number(minute));

    loTime.setMinutes(
      loTime.getMinutes() + courseDuration[order.course]
    );

    const loText =
      loTime.getHours().toString().padStart(2, "0") +
      ":" +
      loTime.getMinutes().toString().padStart(2, "0");

    let html = `
      <tr>

        <td>
          <button onclick="moveUp('${orderId}')">▲</button>
          <button onclick="moveDown('${orderId}')">▼</button>
        </td>

        <td>
          <button onclick="deleteOrder('${orderId}')">削除</button>
        </td>

        <td>
          <input type="time"
            value="${order.time}"
            onchange="updateField('${orderId}','time',this.value)">
        </td>

        <td>${order.course}</td>

        <td>
          <input type="number"
            value="${order.people}"
            onchange="updateField('${orderId}','people',this.value)">
        </td>

        <td>
          <input type="text"
            value="${order.table}"
            onchange="updateField('${orderId}','table',this.value)">
        </td>

        <td>${loText}</td>
    `;

    for (let i = 0; i < order.dishes.length; i++) {
      const dish = order.dishes[i];

      html += `
        <td class="dish dish${i} ${dish.done ? "done" : ""}"
            onclick="toggleDish('${orderId}', ${i})">
          ${dish.name}
        </td>
      `;
    }

    html += `</tr>`;

    body.innerHTML += html;
  });
}
function renderCompleted(snapshot) {
  const body = document.getElementById("completedBody");
  body.innerHTML = "";

  snapshot.forEach((doc) => {
    const order = doc.data();

    body.innerHTML += `
      <tr>
        <td>${order.time}</td>
        <td>${order.course}</td>
        <td>${order.people}名</td>
        <td>${order.table}</td>
        <td>${order.completedTime}</td>
        <td>
          <button onclick="restoreOrder('${doc.id}')">戻す</button>
        </td>
      </tr>
    `;
  });
}

function moveUp(index){
    if(index === 0) return; // 一番上は動かせない

    const temp = orders[index];
    orders[index] = orders[index - 1];
    orders[index - 1] = temp;

    saveOrders();
    render();
}

function moveDown(index){
    if(index === orders.length - 1) return; // 一番下は動かせない

    const temp = orders[index];
    orders[index] = orders[index + 1];
    orders[index + 1] = temp;

    saveOrders();
    render();
}

function updateField(index, field, value){

    orders[index][field] = value;

    saveOrders();
    render();
}

function updateCourse(index, newCourse){

    // コース変更
    orders[index].course = newCourse;

    // 料理を再生成（ここ重要）
    orders[index].dishes = courseData[newCourse].map(dish => ({
        name: dish,
        done: false
    }));

    saveOrders();
    render();
}

function restoreOrder(index){

    const order = completedOrders[index];

    // 完了時間を削除
    delete order.completedTime;
    delete order.completedAt;

    orders.push(order);

    completedOrders.splice(index,1);

    saveOrders();
    render();
}

onSnapshot(
    doc(db,"kitchen","orders"),
    (snapshot)=>{

        const data = snapshot.data();

        if(data){
            orders = data.orders || [];
            completedOrders = data.completedOrders || [];
            render();
        }

    }
);


window.addCourse = addCourse;
window.deleteOrder = deleteOrder;
window.moveUp = moveUp;
window.moveDown = moveDown;
window.updateField = updateField;
window.updateCourse = updateCourse;
window.toggleDish = toggleDish;
window.restoreOrder = restoreOrder;


window.db.collection("orders")
  .onSnapshot((snapshot) => {
    renderOrders(snapshot);
  });

window.db.collection("completedOrders")
  .onSnapshot((snapshot) => {
    renderCompleted(snapshot);
  });


