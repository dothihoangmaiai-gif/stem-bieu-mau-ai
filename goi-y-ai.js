/* Gợi ý AI cho trang phiên bản 3 của mỗi nhóm.
   - Gợi ý tại chỗ: tính theo quy tắc từ kết quả trên trang (luôn chạy, không cần mạng).
   - Gợi ý từ AI: gửi số liệu (không có thông tin cá nhân) tới Apps Script của giáo viên; Apps Script gọi Gemini.
     Khóa API được cất trong Apps Script (Script Properties), KHÔNG nằm trong trang web này. */
(function () {
  var m = location.pathname.match(/nhom(\d)_phien_ban_3/);
  if (!m || typeof WEB_APP_URL === "undefined") return;
  var NHOM = m[1];
  var kq = document.querySelector(".kq");
  if (!kq) return;

  function so(id) { var e = document.getElementById(id); var x = e ? parseFloat(e.value) : NaN; return isNaN(x) ? null : x; }
  function f(x, n) { return Number(x).toLocaleString("vi-VN", { maximumFractionDigits: n === undefined ? 1 : n }); }
  function chu(id) { var e = document.getElementById(id); return e ? e.textContent.replace(/\./g, "").replace(",", ".") : ""; }

  // ---------- Gợi ý tại chỗ (theo quy tắc) ----------
  var QUY_TAC = {
    "1": function () {
      var g = [], tl = so("kq_tl"), A = so("kq_a"), P = so("kq_p");
      if (tl !== null) {
        if (tl > 100) g.push("⚠ Phòng đang <b>quá tải " + f(tl) + "%</b>: tắt bớt thiết bị công suất lớn và báo giáo viên ngay.");
        else if (tl > 80) g.push("Tải " + f(tl) + "% đã gần định mức: không cắm thêm thiết bị như ấm đun, máy sấy.");
        else g.push("Tải " + f(tl) + "% nằm trong vùng an toàn (≤ 80%).");
      }
      var lon = null, plon = 0;
      ["tivi", "loa", "maylanh", "quattran", "den"].forEach(function (k) { var v = parseFloat(chu("t_" + k)); if (v > plon) { plon = v; lon = k; } });
      var ten = { tivi: "Tivi", loa: "Loa", maylanh: "Máy lạnh", quattran: "Quạt trần", den: "Đèn tuýp" };
      if (lon && P) g.push(ten[lon] + " chiếm khoảng <b>" + f(plon / P * 100, 0) + "%</b> tổng công suất – nên ưu tiên tắt khi phòng vắng.");
      if (A) g.push("Quên tắt đang lãng phí khoảng <b>" + f(A) + " kWh/tháng</b>: thử phân công “người tắt điện cuối giờ” rồi đo lại để so sánh.");
      return g;
    },
    "2": function () {
      var g = [], d = so("kq_pd"), b = so("kq_pb"), c = so("kq_pc");
      function k(id, mac) { var v = so(id); return v === null ? mac : v; }
      var kh = { d: [k("kd1", 13), k("kd2", 20)], b: [k("kb1", 20), k("kb2", 30)], c: [k("kc1", 50), k("kc2", 65)] };
      function xet(ten, v, r) {
        if (v === null) return;
        if (v < r[0]) g.push(ten + " " + f(v) + "% <b>thấp hơn</b> khoảng " + r[0] + "–" + r[1] + "%.");
        else if (v > r[1]) g.push(ten + " " + f(v) + "% <b>cao hơn</b> khoảng " + r[0] + "–" + r[1] + "%.");
      }
      xet("Đạm", d, kh.d); xet("Béo", b, kh.b); xet("Carbohydrate", c, kh.c);
      if (!g.length && d !== null) g.push("Tỉ lệ ba nhóm chất đang nằm trong khoảng tham khảo – bữa ăn khá cân đối.");
      g.push("Khoảng tham khảo mặc định: đạm 13–20%, béo 20–30%, carbohydrate 50–65%; nhóm nên đối chiếu với tài liệu của Viện Dinh dưỡng.");
      return g;
    },
    "3": function () {
      var g = [], ss = so("kq_saiso"), gi = so("kq_giam"), nam = so("kq_nam");
      if (ss !== null) g.push(ss > 15 ? "Sai số " + f(ss) + "% còn lớn: cân thêm mẫu (≥ 10 món mỗi loại) để khối lượng trung bình chính xác hơn." : "Sai số " + f(ss) + "% ≤ 15%: cách ước tính của nhóm đáng tin cậy.");
      if (gi !== null) g.push(gi >= 20 ? "Phong trào giảm được <b>" + f(gi) + "%</b> rác nhựa – nên duy trì và chia sẻ cho các lớp khác." : "Mức giảm " + f(gi) + "% còn thấp: thử “mang bình nước, hộp cơm cá nhân” và đo lại sau 1 tuần.");
      if (nam !== null) g.push("Cả năm học lớp thải khoảng <b>" + f(nam) + " kg</b> nhựa – có thể quy đổi ra số chai để tuyên truyền dễ hiểu hơn.");
      return g;
    },
    "4": function () {
      var g = [], tb = so("kq_tb");
      if (tb !== null) g.push(tb < 8 ? "Giờ ngủ trung bình " + f(tb, 2) + " giờ, <b>thiếu</b> so với khuyến nghị 8–10 giờ: thử tắt màn hình 30 phút trước khi ngủ." : "Giờ ngủ trung bình " + f(tb, 2) + " giờ đạt khuyến nghị 8–10 giờ.");
      g.push("Đây chỉ là số liệu thống kê, không phải chẩn đoán sức khỏe.");
      return g;
    }
  };

  // ---------- Khung giao diện ----------
  var hop = document.createElement("div");
  hop.className = "goi-y-ai khong-in-nut";
  hop.innerHTML = '<h4>🤖 Gợi ý</h4><ul class="tai-cho"></ul>' +
    '<button type="button" class="nut-ai">✨ Nhận gợi ý từ AI (Gemini)</button>' +
    '<div class="ai-tra-loi" aria-live="polite"></div>';
  var neo = kq.querySelector("details.cach-tinh");
  kq.insertBefore(hop, neo || null);
  var ul = hop.querySelector(".tai-cho"), nut = hop.querySelector(".nut-ai"), tl = hop.querySelector(".ai-tra-loi");

  function capNhat() {
    var ds = [];
    try { ds = QUY_TAC[NHOM]() || []; } catch (e) { ds = []; }
    ul.innerHTML = ds.map(function (x) { return "<li>" + x + "</li>"; }).join("");
  }
  var form = kq.closest("form") || document.querySelector("form");
  setTimeout(capNhat, 0);
  form.addEventListener("input", function () { setTimeout(capNhat, 0); });
  form.addEventListener("change", function () { setTimeout(capNhat, 0); });
  form.addEventListener("reset", function () { setTimeout(capNhat, 50); });

  // ---------- Ngữ cảnh gửi cho AI (chỉ số liệu, không gửi họ tên) ----------
  function giaTri(el) {
    if (el.type === "checkbox") return el.checked ? "có" : "không";
    if (el.type === "radio") return el.checked ? el.value : "";
    if (el.tagName === "SELECT") return el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : "";
    return el.value;
  }
  function nguCanh() {
    var dong = ["Phiếu: " + (document.querySelector("h2") || {}).textContent];
    form.querySelectorAll("fieldset").forEach(function (fs) {
      var lg = fs.querySelector("legend");
      dong.push("## " + (lg ? lg.textContent.trim() : ""));
      fs.querySelectorAll("tr").forEach(function (tr) {
        var o = [];
        tr.querySelectorAll("th,td").forEach(function (td) {
          var inp = td.querySelector("input,select");
          o.push(inp ? giaTri(inp) : td.textContent.trim());
        });
        dong.push(o.join(" | "));
      });
      fs.querySelectorAll("input,select").forEach(function (el) {
        if (el.closest("table") || el.type === "hidden" || el.type === "submit" || el.type === "reset" || el.type === "button") return;
        if (el.type === "radio" && !el.checked) return;
        var lb = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
        var ten = lb ? lb.textContent.trim() : (el.name || el.id);
        if (/tên|họ/i.test(ten)) return;
        dong.push(ten + " " + giaTri(el));
      });
    });
    var k = kq.querySelector("#kq");
    dong.push("## Kết quả tính trên trang", k ? k.innerText : "");
    return dong.join("\n").replace(/\n{2,}/g, "\n").slice(0, 3000);
  }

  // ---------- Gọi AI qua Apps Script ----------
  function anToan(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function dinhDang(s) {
    s = s.replace(/\$+/g, "").replace(/\\text\{([^}]*)\}/g, "$1").replace(/\\approx/g, "≈").replace(/\\cdot/g, "·").replace(/\\times/g, "×").replace(/\\le(q)?/g, "≤").replace(/\\ge(q)?/g, "≥").replace(/\\,/g, " ");
    return anToan(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^\s*[-*•]\s+/gm, "• ").replace(/\n/g, "<br>");
  }
  nut.addEventListener("click", function () {
    nut.disabled = true; var cu = nut.textContent; nut.textContent = "⏳ AI đang suy nghĩ (có thể mất tới 1 phút)…";
    tl.className = "ai-tra-loi"; tl.innerHTML = "";
    var dl = new URLSearchParams({ hanh_dong: "goi_y_ai", nhom: NHOM, ngu_canh: nguCanh() });
    var xong = false;
    var hen = setTimeout(function () { if (xong) return; xong = true; loi(); }, 90000);
    function loi(tb) {
      tl.className = "ai-tra-loi loi";
      tl.textContent = tb || "AI đang bận hoặc mạng chậm, em thử lại sau ít phút. Trong lúc chờ, hãy dùng các gợi ý tại chỗ ở trên.";
      nut.disabled = false; nut.textContent = cu;
    }
    fetch(WEB_APP_URL, { method: "POST", body: dl })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (xong) return; xong = true; clearTimeout(hen);
        if (!j || !j.ok) { loi(j && j.loi === "chua_co_khoa" ? "Giáo viên chưa bật AI (chưa cài khóa Gemini trong Apps Script)." : (j && j.loi === "qua_tai" ? "AI đang quá tải (nhiều người cùng hỏi), em đợi 1 phút rồi thử lại nhé." : undefined)); return; }
        tl.innerHTML = '<div class="ai-nhan">Gemini gợi ý:</div>' + dinhDang(j.goi_y) +
          '<div class="ai-chu-y">Gợi ý do AI tạo ra – nhóm cần kiểm chứng lại bằng kiến thức đã học.</div>';
        nut.disabled = false; nut.textContent = "🔄 Hỏi lại AI";
      })
      .catch(function () { if (xong) return; xong = true; clearTimeout(hen); loi(); });
  });
})();
