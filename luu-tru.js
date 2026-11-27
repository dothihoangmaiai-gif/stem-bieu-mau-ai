/* Lưu dữ liệu biểu mẫu vào Google Trang tính của nhóm (qua Google Apps Script).
   Giáo viên dán địa chỉ Web app vào WEB_APP_URL. Để trống thì trang vẫn chạy như cũ (chỉ gửi tới ketqua.html). */
var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3lDVehB_bX0igJGKis58c4k7E_yIyxB8xgI4aTj6BrbDxTdpDPgUkiuxxgaD7UTg9/exec";
(function () {
  var m = location.pathname.match(/nhom(\d)_phien_ban_(\d)/);
  if (!m || !WEB_APP_URL) return;
  function bao(form, chu, mau) {
    var b = form.querySelector(".bao-luu") || form.appendChild(Object.assign(document.createElement("p"), { className: "bao-luu" }));
    b.textContent = chu; b.style.color = mau;
  }
  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      if (form.dataset.daLuu) return;
      ev.preventDefault();
      var dl = new URLSearchParams();
      new FormData(form).forEach(function (v, k) { if (typeof v === "string") dl.append(k, v); });
      dl.append("nhom", m[1]); dl.append("phien_ban", m[2]);
      dl.append("Giờ gửi (VN)", new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));
      bao(form, "⏳ Đang lưu vào Google Trang tính của nhóm…", "#555");
      var xong = function (ok) {
        bao(form, ok ? "✅ Đã lưu vào Google Trang tính của nhóm." : "⚠ Chưa lưu được (kiểm tra mạng). Dữ liệu vẫn được chuyển sang trang kết quả.", ok ? "#15803d" : "#b45309");
        form.dataset.daLuu = "1";
        setTimeout(function () { HTMLFormElement.prototype.submit.call(form); }, 900);
      };
      var hen = setTimeout(function () { xong(false); }, 8000);
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: dl })
        .then(function () { clearTimeout(hen); xong(true); })
        .catch(function () { clearTimeout(hen); xong(false); });
    });
  });
})();
