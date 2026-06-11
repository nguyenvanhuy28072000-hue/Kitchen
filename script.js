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

  snapshot.forEach(doc => {
    const order = doc.data();
    const id = doc.id;

    const [h, m] = order.time.split(":");

    const lo = new Date();
    lo.setHours(Number(h));
    lo.setMinutes(Number(m) + courseDuration[order.course]);

    const loText =
      lo.getHours().toString().padStart(2,"0") +
      ":" +
      lo.getMinutes().toString().padStart(2,"0");

    let html = `
      <tr>

        <td>
          <button onclick="deleteOrder('${id}')">削除</button>
        </td>

        <td>
          <input type="time"
            value="${order.time}"
            onchange="updateField('${id}','time',this.value)">
        </td>

        <td>${order.course}</td>

        <td>
          <input type="number"
            value="${order.people}"
            onchange="updateField('${id}','people',this.value)">
        </td>

        <td>
          <input type="text"
            value="${order.table}"
            onchange="updateField('${id}','table',this.value)">
        </td>

        <td>${loText}</td>
    `;

    order.dishes.forEach((dish, i) => {
      html += `
        <td class="dish dish${i} ${dish.done ? "done" : ""}"
            onclick="toggleDish('${id}',${i})">
          ${dish.name}
        </td>
      `;
    });

    html += `</tr>`;

    body.innerHTML += html;
  });
}

window.db.collection("completedOrders")
  .onSnapshot((snapshot) => {
    renderCompleted(snapshot);
  });

function renderCompleted(snapshot) {
  const body = document.getElementById("completedBody");
  body.innerHTML = "";

  snapshot.forEach(doc => {
    const d = doc.data();

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

window.addCourse = addCourse;
window.deleteOrder = deleteOrder;
window.moveUp = moveUp;
window.moveDown = moveDown;
window.updateField = updateField;
window.updateCourse = updateCourse;
window.toggleDish = toggleDish;
window.restoreOrder = restoreOrder;
